import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { DatosEvento, InvitacionDemo } from "@/lib/evento";
import { mapearRegalos } from "@/lib/evento";

export const obtenerInvitacionPorToken = cache(async (token: string) => {
  const registro = await prisma.invitacion.findUnique({
    where: { token },
    include: {
      personas: { orderBy: { id: "asc" } },
      evento: {
        include: {
          cronograma: { orderBy: { orden: "asc" } },
          fotosGaleria: { orderBy: { orden: "asc" } },
          infoRegalos: {
            include: { mesasRegalo: { orderBy: { orden: "asc" } } },
          },
        },
      },
    },
  });

  if (!registro) return null;

  const evento: DatosEvento = {
    nombreQuinceanera: registro.evento.nombreQuinceanera,
    nombrePadre: registro.evento.nombrePadre,
    nombreMadre: registro.evento.nombreMadre,
    mensajePadres: registro.evento.mensajePadres,
    fotoPrincipalUrl: registro.evento.fotoPrincipalUrl,
    musicaUrl: registro.evento.musicaUrl,
    fecha: registro.evento.fecha,
    fechaLimiteRsvp: registro.evento.fechaLimiteRsvp,
    tieneMisa: registro.evento.tieneMisa,
    misaLugar: registro.evento.misaLugar,
    misaDireccion: registro.evento.misaDireccion,
    misaHora: registro.evento.misaHora,
    misaMapaUrl: registro.evento.misaMapaUrl,
    misaFotoUrl: registro.evento.misaFotoUrl,
    recepcionLugar: registro.evento.recepcionLugar,
    recepcionDireccion: registro.evento.recepcionDireccion,
    recepcionHora: registro.evento.recepcionHora,
    recepcionMapaUrl: registro.evento.recepcionMapaUrl,
    recepcionFotoUrl: registro.evento.recepcionFotoUrl,
    codigoVestimenta: registro.evento.codigoVestimenta,
    infoAdicional: registro.evento.infoAdicional,
    cronograma: registro.evento.cronograma.map((momento) => ({
      hora: momento.hora,
      titulo: momento.titulo,
      icono: momento.icono ?? "sparkles",
      orden: momento.orden,
    })),
    galeria: registro.evento.fotosGaleria.map((foto) => ({
      url: foto.url,
      orden: foto.orden,
    })),
    infoRegalos: mapearRegalos(registro.evento.infoRegalos),
  };

  const invitacion: InvitacionDemo = {
    titulo: registro.titulo,
    respondida: registro.respondida,
    personas: registro.personas.map((persona) => ({
      id: persona.id,
      nombre: persona.nombre,
      asiste: persona.asiste,
    })),
  };

  return { evento, invitacion };
});