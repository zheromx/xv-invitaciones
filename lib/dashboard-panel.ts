import { auth } from "@/auth";
import { prisma } from "./prisma";

export type ResumenDashboard =
  | null
  | { eventoPresente: false }
  | {
      eventoPresente: true;
      eventoNombre: string | null;
      totalInvitaciones: number;
      totalPersonas: number;
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
  const totalPersonas = porAsiste.reduce(
    (suma, grupo) => suma + grupo._count._all,
    0
  );
  const respondidas =
    porRespondida.find((grupo) => grupo.respondida)?._count._all ?? 0;

  return {
    totalInvitaciones,
    totalPersonas,
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

export type DetalleAsistenciaDatos = {
  invitacionesRespondidas: {
    id: string;
    titulo: string;
    personas: { id: string; nombre: string; asiste: boolean | null }[];
  }[];
  invitacionesSinResponder: {
    id: string;
    titulo: string;
    totalPersonas: number;
  }[];
};

export type DetalleAsistenciaDashboard =
  | null
  | { eventoPresente: false }
  | ({ eventoPresente: true } & DetalleAsistenciaDatos);

// Lectura autorizada y acotada del detalle de asistencia. El evento se deriva
// SIEMPRE del usuario de la sesión (nunca de un id enviado por el navegador).
// Se seleccionan solo los campos del detalle (sin teléfono, token ni URL
// pública) y se resuelve en una sola consulta con sus personas: sin N+1.
export async function obtenerDetalleAsistencia(): Promise<DetalleAsistenciaDashboard> {
  const sesion = await auth();
  if (!sesion?.user) return null;

  const evento = await prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    select: {
      invitaciones: {
        select: {
          id: true,
          titulo: true,
          respondida: true,
          personas: {
            select: { id: true, nombre: true, asiste: true },
          },
        },
      },
    },
  });
  if (!evento) return { eventoPresente: false };

  const invitacionesRespondidas: DetalleAsistenciaDatos["invitacionesRespondidas"] =
    [];
  const invitacionesSinResponder: DetalleAsistenciaDatos["invitacionesSinResponder"] =
    [];

  for (const invitacion of evento.invitaciones) {
    if (invitacion.respondida) {
      invitacionesRespondidas.push({
        id: invitacion.id,
        titulo: invitacion.titulo,
        personas: invitacion.personas.map((persona) => ({
          id: persona.id,
          nombre: persona.nombre,
          asiste: persona.asiste,
        })),
      });
    } else {
      invitacionesSinResponder.push({
        id: invitacion.id,
        titulo: invitacion.titulo,
        totalPersonas: invitacion.personas.length,
      });
    }
  }

  return {
    eventoPresente: true,
    invitacionesRespondidas,
    invitacionesSinResponder,
  };
}