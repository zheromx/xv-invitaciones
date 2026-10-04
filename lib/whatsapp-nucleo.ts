import { prisma } from "./prisma";

export type MotivoWhatsApp = "no-encontrada" | "datos-invalidos" | "fallo";

// Actualiza EXCLUSIVAMENTE `Evento.mensajeWhatsApp` del evento autorizado.
// El Evento se deriva del usuarioId de la sesión (nunca de un id del cliente).
export async function ejecutarGuardarMensajeWhatsApp(
  usuarioId: string,
  mensajeWhatsApp: string | null
): Promise<MotivoWhatsApp | null> {
  try {
    const evento = await prisma.evento.findFirst({
      where: { usuarioId },
      select: { id: true },
    });
    if (!evento) return "no-encontrada";

    await prisma.evento.update({
      where: { id: evento.id },
      data: { mensajeWhatsApp },
    });
    return null;
  } catch (error) {
    console.error("Error al guardar el mensaje de WhatsApp:", error);
    return "fallo";
  }
}
