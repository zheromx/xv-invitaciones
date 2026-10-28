import { prisma } from "./prisma";

export type MotivoMesa =
  | "no-encontrada"
  | "no-autorizado"
  | "no-respondida"
  | "no-asiste"
  | "datos-invalidos"
  | "fallo";

// Actualiza EXCLUSIVAMENTE la mesa de una persona confirmada.
// Validaciones estrictas:
// 1. La persona debe existir y pertenecer a una invitación del evento del usuario autenticado.
// 2. La invitación debe estar respondida (`respondida === true`).
// 3. La persona debe tener `asiste === true`.
// 4. Modifica exclusivamente `mesa` (permite entero positivo o null).
export async function ejecutarGuardarMesaPersona(
  usuarioId: string,
  personaId: string,
  mesa: number | null
): Promise<MotivoMesa | null> {
  try {
    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
      select: {
        id: true,
        asiste: true,
        invitacion: {
          select: {
            id: true,
            respondida: true,
            evento: {
              select: {
                usuarioId: true,
              },
            },
          },
        },
      },
    });

    if (!persona) return "no-encontrada";
    if (persona.invitacion.evento.usuarioId !== usuarioId) return "no-autorizado";
    if (!persona.invitacion.respondida) return "no-respondida";
    if (persona.asiste !== true) return "no-asiste";

    await prisma.persona.update({
      where: { id: personaId },
      data: { mesa },
    });

    return null;
  } catch (error) {
    console.error("Error al guardar el número de mesa:", error);
    return "fallo";
  }
}

// Actualiza EXCLUSIVAMENTE `Evento.mensajeMesaWhatsApp` del evento autorizado.
export async function ejecutarGuardarMensajeMesaWhatsApp(
  usuarioId: string,
  mensaje: string | null
): Promise<MotivoMesa | null> {
  try {
    const evento = await prisma.evento.findFirst({
      where: { usuarioId },
      select: { id: true },
    });
    if (!evento) return "no-encontrada";

    await prisma.evento.update({
      where: { id: evento.id },
      data: { mensajeMesaWhatsApp: mensaje },
    });
    return null;
  } catch (error) {
    console.error("Error al guardar el mensaje de mesas de WhatsApp:", error);
    return "fallo";
  }
}
