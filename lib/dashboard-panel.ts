import { auth } from "@/auth";
import { prisma } from "./prisma";

export type ResumenDashboard =
  | null
  | { eventoPresente: false }
  | {
      eventoPresente: true;
      eventoNombre: string | null;
      totalInvitaciones: number;
      respondidas: number;
      sinResponder: number;
      confirmadas: number;
      declinadas: number;
      enInvitacionesSinResponder: number;
    };

export async function obtenerMetricasDeEvento(eventoId: string) {
  const [porRespondida, porAsiste] = await Promise.all([
    prisma.invitacion.groupBy({
      by: ["respondida"],
      where: { eventoId },
      _count: { _all: true },
    }),
    prisma.persona.groupBy({
      by: ["asiste"],
      where: { invitacion: { eventoId } },
      _count: { _all: true },
    }),
  ]);

  const totalInvitaciones = porRespondida.reduce(
    (suma, grupo) => suma + grupo._count._all,
    0
  );
  const respondidas =
    porRespondida.find((grupo) => grupo.respondida)?._count._all ?? 0;

  return {
    totalInvitaciones,
    respondidas,
    sinResponder: totalInvitaciones - respondidas,
    confirmadas:
      porAsiste.find((grupo) => grupo.asiste === true)?._count._all ?? 0,
    declinadas:
      porAsiste.find((grupo) => grupo.asiste === false)?._count._all ?? 0,
    enInvitacionesSinResponder:
      porAsiste.find((grupo) => grupo.asiste === null)?._count._all ?? 0,
  };
}

export async function obtenerMetricasDashboard(): Promise<ResumenDashboard> {
  const sesion = await auth();
  if (!sesion?.user) return null;

  const evento = await prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    select: { id: true, nombreQuinceanera: true },
  });
  if (!evento) return { eventoPresente: false };

  const metricas = await obtenerMetricasDeEvento(evento.id);
  return {
    eventoPresente: true,
    eventoNombre: evento.nombreQuinceanera,
    ...metricas,
  };
}