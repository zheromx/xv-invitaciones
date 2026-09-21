import { prisma } from "./prisma";

export type MotivoRsvp = "no-encontrada" | "ya-respondida" | "ids-invalidos";

export function idsLimpios(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => id.length > 0))];
}

export async function ejecutarConfirmacion(
  token: string,
  personaIdsQueAsisten: string[]
): Promise<MotivoRsvp | null> {
  return prisma.$transaction(async (tx) => {
    const invitacion = await tx.invitacion.findUnique({
      where: { token },
      select: {
        id: true,
        respondida: true,
        personas: { select: { id: true } },
      },
    });

    if (!invitacion) return "no-encontrada";
    if (invitacion.respondida) return "ya-respondida";

    const idsPermitidos = new Set(invitacion.personas.map((p) => p.id));
    if (personaIdsQueAsisten.some((id) => !idsPermitidos.has(id))) {
      return "ids-invalidos";
    }

    const cambiadas = await tx.invitacion.updateMany({
      where: { id: invitacion.id, respondida: false },
      data: { respondida: true, respondidaEn: new Date() },
    });
    if (cambiadas.count === 0) return "ya-respondida";

    await tx.persona.updateMany({
      where: { invitacionId: invitacion.id, id: { in: personaIdsQueAsisten } },
      data: { asiste: true },
    });
    await tx.persona.updateMany({
      where: { invitacionId: invitacion.id, id: { notIn: personaIdsQueAsisten } },
      data: { asiste: false },
    });

    return null;
  });
}