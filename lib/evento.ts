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

export type DatosEvento = {
  nombreQuinceanera: string;
  nombrePadre: string | null;
  nombreMadre: string | null;
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
};

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

export function duracionHasta(fecha: Date): DuracionHasta {
  let diff = fecha.getTime() - Date.now();
  if (diff < 0) diff = 0;
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