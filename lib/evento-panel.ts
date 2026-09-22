import { auth } from "@/auth";
import { prisma } from "./prisma";
import type { DatosEvento, InvitacionDemo } from "./evento";
import { mapearRegalos } from "./evento";

// Devuelve el Evento autorizado derivado SIEMPRE de session.user.id →
// Evento.usuarioId (nunca de un id recibido del navegador), con su cronograma
// ordenado. Pensado para las lecturas del panel de configuración.
export async function obtenerEventoConfiguracionSesion() {
  const sesion = await auth();
  if (!sesion?.user) return null;

  return prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    select: {
      id: true,
      plantilla: true,
      nombreQuinceanera: true,
      nombrePadre: true,
      nombreMadre: true,
      nombrePadrinos: true,
      fecha: true,
      fechaLimiteRsvp: true,
      tieneMisa: true,
      misaLugar: true,
      misaDireccion: true,
      misaHora: true,
      recepcionLugar: true,
      recepcionDireccion: true,
      recepcionHora: true,
      codigoVestimenta: true,
      infoAdicional: true,
      cronograma: {
        orderBy: { orden: "asc" },
        select: { id: true, hora: true, titulo: true, icono: true, orden: true },
      },
    },
  });
}

export type EventoConfiguracion = NonNullable<
  Awaited<ReturnType<typeof obtenerEventoConfiguracionSesion>>
>;

// Imágenes del Evento autorizado (principal + galería ordenada). Derivadas
// server-side de la sesión; el cliente nunca envía eventoId.
export async function obtenerImagenesEventoSesion() {
  const sesion = await auth();
  if (!sesion?.user) return null;

  return prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    select: {
      fotoPrincipalUrl: true,
      fotosGaleria: {
        orderBy: { orden: "asc" },
        select: { id: true, url: true, orden: true },
      },
    },
  });
}

// Regalos del Evento autorizado (InfoRegalos + mesas ordenadas). Derivados
// server-side de la sesión; el cliente nunca envía eventoId/infoRegalosId.
export async function obtenerRegalosEventoSesion() {
  const sesion = await auth();
  if (!sesion?.user) return null;

  const evento = await prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    select: {
      infoRegalos: {
        select: {
          mostrar: true,
          mensaje: true,
          datosBancarios: true,
          numeroEvento: true,
          mesasRegalo: {
            orderBy: { orden: "asc" },
            select: { id: true, tienda: true, url: true, orden: true },
          },
        },
      },
    },
  });
  if (!evento) return null;
  return evento.infoRegalos;
}

// Construye los datos de la VISTA PREVIA reutilizando los tipos de vista de la
// ruta pública (`DatosEvento` / `InvitacionDemo`). No crea ni persiste
// invitaciones ni tokens: si el evento no tiene invitaciones, usa un objeto
// mínimo claramente interno. Tampoco firma RSVP.
export async function obtenerVistaPreviaSesion(): Promise<{
  evento: DatosEvento;
  invitacion: InvitacionDemo;
} | null> {
  const sesion = await auth();
  if (!sesion?.user) return null;

  const evento = await prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    include: {
      cronograma: { orderBy: { orden: "asc" } },
      fotosGaleria: { orderBy: { orden: "asc" } },
      infoRegalos: { include: { mesasRegalo: { orderBy: { orden: "asc" } } } },
    },
  });
  if (!evento) return null;

  const representativa = await prisma.invitacion.findFirst({
    where: { eventoId: evento.id },
    orderBy: { creadaEn: "asc" },
    select: {
      titulo: true,
      respondida: true,
      personas: {
        select: { id: true, nombre: true, asiste: true },
        orderBy: { id: "asc" },
      },
    },
  });

  const eventoVista: DatosEvento = {
    nombreQuinceanera: evento.nombreQuinceanera,
    nombrePadre: evento.nombrePadre,
    nombreMadre: evento.nombreMadre,
    fotoPrincipalUrl: evento.fotoPrincipalUrl,
    fecha: evento.fecha,
    fechaLimiteRsvp: evento.fechaLimiteRsvp,
    tieneMisa: evento.tieneMisa,
    misaLugar: evento.misaLugar,
    misaDireccion: evento.misaDireccion,
    misaHora: evento.misaHora,
    recepcionLugar: evento.recepcionLugar,
    recepcionDireccion: evento.recepcionDireccion,
    recepcionHora: evento.recepcionHora,
    codigoVestimenta: evento.codigoVestimenta,
    infoAdicional: evento.infoAdicional,
    cronograma: evento.cronograma.map((momento) => ({
      hora: momento.hora,
      titulo: momento.titulo,
      icono: momento.icono ?? "sparkles",
      orden: momento.orden,
    })),
    galeria: evento.fotosGaleria.map((foto) => ({
      url: foto.url,
      orden: foto.orden,
    })),
    infoRegalos: mapearRegalos(evento.infoRegalos),
  };

  const invitacionVista: InvitacionDemo = representativa
    ? {
        titulo: representativa.titulo,
        respondida: representativa.respondida,
        personas: representativa.personas.map((persona) => ({
          id: persona.id,
          nombre: persona.nombre,
          asiste: persona.asiste,
        })),
      }
    : {
        titulo: "Invitación de ejemplo",
        respondida: false,
        personas: [
          { id: "vista-previa-1", nombre: "Invitado de ejemplo", asiste: null },
        ],
      };

  return { evento: eventoVista, invitacion: invitacionVista };
}
