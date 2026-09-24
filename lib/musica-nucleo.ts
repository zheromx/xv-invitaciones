import { prisma } from "./prisma";

export type MotivoMusica = "no-encontrada" | "fallo";

// Núcleo transaccional de la música de fondo (testeable sin Next ni
// UploadThing). Recibe el usuarioId de la sesión y deriva el Evento autorizado
// dentro de la transacción; el cliente nunca envía eventoId/usuarioId. Devuelve
// la URL anterior para que la Server Action haga el borrado físico después.

export async function ejecutarGuardarMusica(
  usuarioId: string,
  url: string
): Promise<
  | { ok: true; anterior: string | null }
  | { ok: false; motivo: MotivoMusica }
> {
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true, musicaUrl: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };

      await tx.evento.update({
        where: { id: evento.id },
        data: { musicaUrl: url },
      });
      return { ok: true as const, anterior: evento.musicaUrl };
    });
  } catch (error) {
    console.error("Error al guardar la música:", error);
    return { ok: false, motivo: "fallo" };
  }
}

export async function ejecutarEliminarMusica(
  usuarioId: string
): Promise<
  | { ok: true; anterior: string | null }
  | { ok: false; motivo: MotivoMusica }
> {
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true, musicaUrl: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };
      if (!evento.musicaUrl) return { ok: true as const, anterior: null };

      await tx.evento.update({
        where: { id: evento.id },
        data: { musicaUrl: null },
      });
      return { ok: true as const, anterior: evento.musicaUrl };
    });
  } catch (error) {
    console.error("Error al eliminar la música:", error);
    return { ok: false, motivo: "fallo" };
  }
}
