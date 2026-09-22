import { auth } from "@/auth";
import { prisma } from "./prisma";

export async function obtenerEventoSegunSesion(): Promise<{ id: string } | null> {
  const sesion = await auth();
  if (!sesion?.user) return null;
  return prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    select: { id: true },
  });
}

export async function detalleInvitacionParaEditar(eventoId: string, invitacionId: string) {
  return prisma.invitacion.findUnique({
    where: { id: invitacionId },
    select: {
      id: true,
      eventoId: true,
      titulo: true,
      respondida: true,
      respondidaEn: true,
      token: true,
      personas: {
        select: { id: true, nombre: true, asiste: true },
        orderBy: { id: "asc" },
      },
    },
  });
}