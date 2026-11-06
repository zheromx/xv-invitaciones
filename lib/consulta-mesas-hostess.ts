import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import type { AsistenciaInvitacion } from "@/lib/asistencia-resumen";

export type DatosConsultaHostess = {
  eventoNombre: string | null;
  invitacionesRespondidas: AsistenciaInvitacion[];
  hayRespuestas: boolean;
};

function validarClaveSegura(claveProporcionada: string): boolean {
  const claveServidor = process.env.HOSTESS_MESAS_CLAVE?.trim();
  const eventoIdServidor = process.env.HOSTESS_MESAS_EVENTO_ID?.trim();

  if (!claveServidor || claveServidor.length < 32 || !eventoIdServidor) {
    return false;
  }

  const limpioProporcionado = claveProporcionada?.trim() ?? "";
  if (!limpioProporcionado) return false;

  try {
    const bufA = Buffer.from(limpioProporcionado, "utf8");
    const bufB = Buffer.from(claveServidor, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function obtenerDatosConsultaHostess(
  claveUrl: string
): Promise<DatosConsultaHostess | null> {
  if (!validarClaveSegura(claveUrl)) {
    return null;
  }

  const eventoId = process.env.HOSTESS_MESAS_EVENTO_ID?.trim();
  if (!eventoId) return null;

  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    select: {
      id: true,
      nombreQuinceanera: true,
      invitaciones: {
        where: {
          respondida: true,
          personas: {
            some: { asiste: true },
          },
        },
        select: {
          id: true,
          titulo: true,
          respondidaEn: true,
          personas: {
            where: { asiste: true },
            select: {
              id: true,
              nombre: true,
              asiste: true,
              mesa: true,
            },
            orderBy: { nombre: "asc" },
          },
        },
      },
    },
  });

  if (!evento) return null;

  // Verificamos si existen invitaciones respondidas en general en el evento
  // para diferenciar "aún no hay respuestas" de "no hay asistentes confirmados".
  const totalRespondidas = await prisma.invitacion.count({
    where: { eventoId: evento.id, respondida: true },
  });

  const invitacionesRespondidas: AsistenciaInvitacion[] = evento.invitaciones.map(
    (inv) => ({
      id: inv.id,
      titulo: inv.titulo,
      respondidaEn: inv.respondidaEn,
      personas: inv.personas.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        asiste: p.asiste,
        mesa: p.mesa,
      })),
    })
  );

  return {
    eventoNombre: evento.nombreQuinceanera,
    invitacionesRespondidas,
    hayRespuestas: totalRespondidas > 0,
  };
}
