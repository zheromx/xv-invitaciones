import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";

export type MotivoInvitacion =
  | "no-autorizado"
  | "ya-respondida"
  | "no-encontrada"
  | "fallo";

export function generarTokenInvitacion(): string {
  return randomBytes(24).toString("base64url");
}

export function esP2002(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function ejecutarCrear(
  eventoId: string,
  titulo: string,
  nombres: string[]
): Promise<"fallo" | null> {
  for (let intento = 0; intento < 5; intento++) {
    try {
      await prisma.invitacion.create({
        data: {
          titulo,
          eventoId,
          token: generarTokenInvitacion(),
          personas: { create: nombres.map((nombre) => ({ nombre })) },
        },
      });
      return null;
    } catch (error) {
      if (esP2002(error)) continue;
      console.error("Error al crear invitación:", error);
      return "fallo";
    }
  }
  console.error("Colisión de token persistente al crear invitación.");
  return "fallo";
}

export async function ejecutarEditar(
  eventoId: string,
  invitacionId: string,
  titulo: string,
  personasConId: { personaId: string; nombre: string }[],
  eliminadas: string[]
): Promise<MotivoInvitacion | null> {
  try {
    await prisma.$transaction(async (tx) => {
      const invitacion = await tx.invitacion.findUnique({
        where: { id: invitacionId },
        select: {
          eventoId: true,
          respondida: true,
          personas: { select: { id: true } },
        },
      });

      if (!invitacion) {
        throw new Error("no-encontrada");
      }
      if (invitacion.eventoId !== eventoId) {
        throw new Error("no-autorizado");
      }
      if (invitacion.respondida) {
        throw new Error("ya-respondida");
      }

      const idsPermitidos = new Set(invitacion.personas.map((p) => p.id));
      const idsEliminadas = new Set(eliminadas);
      const idsConservadas = personasConId
        .filter((p) => p.personaId)
        .map((p) => p.personaId);

      for (const personaId of [...idsConservadas, ...eliminadas]) {
        if (!idsPermitidos.has(personaId)) {
          throw new Error("no-autorizado");
        }
      }
      if (idsConservadas.some((idP) => idsEliminadas.has(idP))) {
        throw new Error("no-autorizado");
      }

      await tx.invitacion.update({
        where: { id: invitacionId },
        data: { titulo },
      });

      for (const { personaId, nombre } of personasConId) {
        if (personaId) {
          await tx.persona.updateMany({
            where: { id: personaId, invitacionId },
            data: { nombre },
          });
        } else {
          await tx.persona.create({
            data: { invitacionId, nombre },
          });
        }
      }

      if (eliminadas.length > 0) {
        await tx.persona.deleteMany({
          where: { id: { in: eliminadas }, invitacionId },
        });
      }
    });
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error.message === "no-autorizado") return "no-autorizado";
    if (error.message === "ya-respondida") return "ya-respondida";
    if (error.message === "no-encontrada") return "no-encontrada";
    console.error("Error al editar invitación:", error);
    return "fallo";
  }

  return null;
}

export async function ejecutarBorrar(
  eventoId: string,
  invitacionId: string
): Promise<MotivoInvitacion | null> {
  try {
    await prisma.$transaction(async (tx) => {
      const invitacion = await tx.invitacion.findUnique({
        where: { id: invitacionId },
        select: { eventoId: true },
      });

      if (!invitacion) {
        throw new Error("no-encontrada");
      }
      if (invitacion.eventoId !== eventoId) {
        throw new Error("no-autorizado");
      }

      await tx.invitacion.delete({ where: { id: invitacionId } });
    });
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error.message === "no-autorizado") return "no-autorizado";
    if (error.message === "no-encontrada") return "no-encontrada";
    console.error("Error al borrar invitación:", error);
    return "fallo";
  }

  return null;
}