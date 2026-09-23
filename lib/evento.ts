export type MomentoEvento = {
  hora: string;
  titulo: string;
  icono: string;
  orden: number;
};

export type FotoGaleria = {
  url: string | null;
  orden: number;
};

export type MesaRegaloVista = {
  id: string;
  tienda: string;
  url: string;
  orden: number;
};

export type RegalosVista = {
  mostrar: boolean;
  mensaje: string | null;
  datosBancarios: string | null;
  numeroEvento: string | null;
  mesas: MesaRegaloVista[];
};

export type DatosEvento = {
  nombreQuinceanera: string;
  nombrePadre: string | null;
  nombreMadre: string | null;
  mensajePadres?: string | null;
  fotoPrincipalUrl?: string | null;
  fecha: Date;
  fechaLimiteRsvp: Date | null;
  tieneMisa: boolean;
  misaLugar: string | null;
  misaDireccion: string | null;
  misaHora: string | null;
  recepcionLugar: string;
  recepcionDireccion: string;
  recepcionHora: string;
  codigoVestimenta: string | null;
  infoAdicional: string | null;
  cronograma: MomentoEvento[];
  galeria: FotoGaleria[];
  infoRegalos?: RegalosVista | null;
};

// Mapeo compartido de InfoRegalos (+ mesas) al tipo de vista, reutilizado por
// la ruta pública y la vista previa.
export function mapearRegalos(
  info: {
    mostrar: boolean;
    mensaje: string | null;
    datosBancarios: string | null;
    numeroEvento: string | null;
    mesasRegalo: { id: string; tienda: string; url: string; orden: number }[];
  } | null
): RegalosVista | null {
  if (!info) return null;
  return {
    mostrar: info.mostrar,
    mensaje: info.mensaje,
    datosBancarios: info.datosBancarios,
    numeroEvento: info.numeroEvento,
    mesas: info.mesasRegalo.map((mesa) => ({
      id: mesa.id,
      tienda: mesa.tienda,
      url: mesa.url,
      orden: mesa.orden,
    })),
  };
}

export type PersonaDemo = {
  id: string;
  nombre: string;
  asiste: boolean | null;
};

export type InvitacionDemo = {
  titulo: string;
  respondida: boolean;
  personas: PersonaDemo[];
};

export type DuracionHasta = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

export function duracionHasta(
  fecha: Date,
  ahora: number = Date.now()
): DuracionHasta {
  let diff = fecha.getTime() - ahora;
  if (!Number.isFinite(diff) || diff < 0) diff = 0;
  const totalSegundos = Math.floor(diff / 1000);
  return {
    dias: Math.floor(totalSegundos / 86400),
    horas: Math.floor((totalSegundos % 86400) / 3600),
    minutos: Math.floor((totalSegundos % 3600) / 60),
    segundos: totalSegundos % 60,
  };
}

export function formatearFechaLarga(fecha: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

export function formatearFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

export function formatearHora(fecha: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  }).format(fecha);
}