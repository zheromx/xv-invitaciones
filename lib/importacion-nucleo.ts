import { prisma } from "./prisma";
import { esP2002, generarTokenInvitacion } from "./invitaciones-nucleo";
import { normalizarTexto, type GrupoImportado } from "./importacion-invitaciones";

export type ConflictoDuplicado = { telefono: string; titulo: string };

export class ImportacionDuplicada extends Error {
  constructor(public readonly conflictos: ConflictoDuplicado[]) {
    super("importacion-duplicada");
  }
}

const NS_IMPORTACION = 19750323;

function hash32(texto: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash | 0;
}

function compararConflictos(
  grupos: GrupoImportado[],
  existentes: { titulo: string; telefono: string | null }[]
): { bloqueantes: ConflictoDuplicado[]; advertencias: { titulo: string }[] } {
  const conTelefono = new Set(
    existentes
      .filter((e) => e.telefono)
      .map((e) => `${e.telefono}\u0000${normalizarTexto(e.titulo)}`)
  );
  const sinTelefono = new Set(
    existentes.filter((e) => !e.telefono).map((e) => normalizarTexto(e.titulo))
  );

  const bloqueantes: ConflictoDuplicado[] = [];
  const advertencias: { titulo: string }[] = [];
  for (const grupo of grupos) {
    if (conTelefono.has(`${grupo.telefono}\u0000${normalizarTexto(grupo.titulo)}`)) {
      bloqueantes.push({ telefono: grupo.telefono, titulo: grupo.titulo });
    } else if (sinTelefono.has(normalizarTexto(grupo.titulo))) {
      advertencias.push({ titulo: grupo.titulo });
    }
  }
  return { bloqueantes, advertencias };
}

export async function detectarConflictos(eventoId: string, grupos: GrupoImportado[]) {
  const existentes = await prisma.invitacion.findMany({
    where: { eventoId },
    select: { titulo: true, telefono: true },
  });
  return compararConflictos(grupos, existentes);
}

export async function ejecutarImportacion(
  eventoId: string,
  grupos: GrupoImportado[]
): Promise<{ creadas: number }> {
  const claveEvento = hash32(`importacion:${eventoId}`);

  for (let intento = 0; intento < 3; intento++) {
    const conToken = grupos.map((grupo) => ({
      ...grupo,
      token: generarTokenInvitacion(),
    }));
    try {
      const creadas = await prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(${NS_IMPORTACION}::int, ${claveEvento}::int)`;

          const existentes = await tx.invitacion.findMany({
            where: { eventoId },
            select: { titulo: true, telefono: true },
          });
          const { bloqueantes } = compararConflictos(grupos, existentes);
          if (bloqueantes.length > 0) throw new ImportacionDuplicada(bloqueantes);

          await tx.invitacion.createMany({
            data: conToken.map((grupo) => ({
              eventoId,
              titulo: grupo.titulo,
              telefono: grupo.telefono,
              token: grupo.token,
            })),
          });

          const registros = await tx.invitacion.findMany({
            where: { eventoId, token: { in: conToken.map((g) => g.token) } },
            select: { id: true, token: true },
          });
          const idPorToken = new Map(registros.map((r) => [r.token, r.id]));

          await tx.persona.createMany({
            data: conToken.flatMap((grupo) =>
              grupo.personas.map((nombre) => ({
                invitacionId: idPorToken.get(grupo.token) as string,
                nombre,
              }))
            ),
          });

          return conToken.length;
        },
        { maxWait: 5000, timeout: 15000 }
      );

      return { creadas };
    } catch (error) {
      if (error instanceof ImportacionDuplicada) throw error;
      if (esP2002(error) && intento < 2) continue;
      throw error;
    }
  }

  throw new Error("importacion-fallida");
}
