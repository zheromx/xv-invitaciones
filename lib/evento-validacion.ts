import type {
  DatosEventoActualizables,
  MomentoEntrada,
} from "./evento-nucleo";
import { esPlantillaDisponible, PLANTILLA_PREDETERMINADA } from "./plantillas";

// Validación runtime pura (sin Next ni Prisma): transforma el FormData del
// navegador en datos tipados y validados. Devuelve null si algo es inválido,
// de modo que el llamador no muta nada.
export const LIMITES_EVENTO = {
  nombre: 120,
  padrinos: 200,
  mensajePadres: 1000,
  lugar: 200,
  direccion: 200,
  hora: 40,
  vestimenta: 200,
  info: 500,
  momentos: 30,
  icono: 40,
} as const;

const PATRON_ICONO = /^[A-Za-z0-9_-]+$/;

function texto(formData: FormData, campo: string): string {
  const bruto = formData.get(campo);
  return typeof bruto === "string" ? bruto.trim() : "";
}

function parsearFechaHora(valor: string): Date | null {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  const anio = fecha.getFullYear();
  if (anio < 2000 || anio > 2100) return null;
  return fecha;
}

function parsearFechaDia(valor: string): Date | null {
  if (!valor) return null;
  const fecha = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return null;
  const anio = fecha.getFullYear();
  if (anio < 2000 || anio > 2100) return null;
  return fecha;
}

function parsearMomentos(formData: FormData): MomentoEntrada[] | null {
  const ids = formData.getAll("momento_id");
  const horas = formData.getAll("momento_hora");
  const titulos = formData.getAll("momento_titulo");
  const iconos = formData.getAll("momento_icono");
  const total = Math.max(ids.length, horas.length, titulos.length, iconos.length);

  const momentos: MomentoEntrada[] = [];
  for (let indice = 0; indice < total; indice++) {
    const id = String(ids[indice] ?? "").trim();
    const hora = String(horas[indice] ?? "").trim();
    const titulo = String(titulos[indice] ?? "").trim();
    const icono = String(iconos[indice] ?? "").trim();

    // Fila totalmente vacía → se ignora (no se persiste).
    if (!id && !hora && !titulo && !icono) continue;

    // Fila no vacía: hora y título obligatorios.
    if (!hora || !titulo) return null;
    if (hora.length > LIMITES_EVENTO.hora || titulo.length > LIMITES_EVENTO.nombre) {
      return null;
    }
    // El ícono es un string controlado: opcional, con caracteres acotados.
    if (
      icono &&
      (icono.length > LIMITES_EVENTO.icono || !PATRON_ICONO.test(icono))
    ) {
      return null;
    }

    momentos.push({ id: id || undefined, hora, titulo, icono: icono || null });
    if (momentos.length > LIMITES_EVENTO.momentos) return null;
  }

  return momentos;
}

export function parsearDatosEvento(
  formData: FormData
): DatosEventoActualizables | null {
  const nombreQuinceanera = texto(formData, "nombreQuinceanera");
  if (!nombreQuinceanera || nombreQuinceanera.length > LIMITES_EVENTO.nombre) {
    return null;
  }

  const nombrePadre = texto(formData, "nombrePadre");
  if (nombrePadre.length > LIMITES_EVENTO.nombre) return null;
  const nombreMadre = texto(formData, "nombreMadre");
  if (nombreMadre.length > LIMITES_EVENTO.nombre) return null;
  const nombrePadrinos = texto(formData, "nombrePadrinos");
  if (nombrePadrinos.length > LIMITES_EVENTO.padrinos) return null;

  const mensajePadres = texto(formData, "mensajePadres");
  if (mensajePadres.length > LIMITES_EVENTO.mensajePadres) return null;

  const fecha = parsearFechaHora(texto(formData, "fecha"));
  if (!fecha) return null;
  const fechaLimiteBruta = texto(formData, "fechaLimiteRsvp");
  const fechaLimiteRsvp = fechaLimiteBruta
    ? parsearFechaDia(fechaLimiteBruta)
    : null;
  if (fechaLimiteBruta && !fechaLimiteRsvp) return null;

  const valorMisa = formData.get("tieneMisa");
  const tieneMisa = valorMisa === "on" || valorMisa === "true";

  const misaLugar = texto(formData, "misaLugar");
  const misaDireccion = texto(formData, "misaDireccion");
  const misaHora = texto(formData, "misaHora");
  if (tieneMisa) {
    if (!misaLugar || misaLugar.length > LIMITES_EVENTO.lugar) return null;
    if (!misaDireccion || misaDireccion.length > LIMITES_EVENTO.direccion) {
      return null;
    }
    if (!misaHora || misaHora.length > LIMITES_EVENTO.hora) return null;
  }

  const recepcionLugar = texto(formData, "recepcionLugar");
  if (!recepcionLugar || recepcionLugar.length > LIMITES_EVENTO.lugar) return null;
  const recepcionDireccion = texto(formData, "recepcionDireccion");
  if (!recepcionDireccion || recepcionDireccion.length > LIMITES_EVENTO.direccion) {
    return null;
  }
  const recepcionHora = texto(formData, "recepcionHora");
  if (!recepcionHora || recepcionHora.length > LIMITES_EVENTO.hora) return null;

  const codigoVestimenta = texto(formData, "codigoVestimenta");
  if (codigoVestimenta.length > LIMITES_EVENTO.vestimenta) return null;
  const infoAdicional = texto(formData, "infoAdicional");
  if (infoAdicional.length > LIMITES_EVENTO.info) return null;

  const plantilla = texto(formData, "plantilla") || PLANTILLA_PREDETERMINADA;
  if (!esPlantillaDisponible(plantilla)) return null;

  const momentos = parsearMomentos(formData);
  if (momentos === null) return null;

  return {
    plantilla: PLANTILLA_PREDETERMINADA,
    nombreQuinceanera,
    nombrePadre: nombrePadre || null,
    nombreMadre: nombreMadre || null,
    nombrePadrinos: nombrePadrinos || null,
    mensajePadres: mensajePadres || null,
    fecha,
    fechaLimiteRsvp,
    tieneMisa,
    misaLugar: tieneMisa ? misaLugar : null,
    misaDireccion: tieneMisa ? misaDireccion : null,
    misaHora: tieneMisa ? misaHora : null,
    recepcionLugar,
    recepcionDireccion,
    recepcionHora,
    codigoVestimenta: codigoVestimenta || null,
    infoAdicional: infoAdicional || null,
    momentos,
  };
}
