export const LIMITE_MENSAJE_WHATSAPP = 1000;

// Cuerpo del mensaje fijo vigente. El único marcador soportado es {titulo}.
export const MENSAJE_WHATSAPP_FALLBACK =
  "¡Hola {titulo}! Están invitados a mis XV años. Confirmen su asistencia aquí:";

// Validación estricta para la acción de guardado. Una entrada ausente o de
// tipo inesperado se RECHAZA (no se convierte en null); solo un string vacío o
// compuesto por espacios se normaliza a null. Más de 1000 tras trim se rechaza.
export function validarMensajeWhatsAppEntrante(
  bruto: unknown
): { ok: true; valor: string | null } | { ok: false } {
  if (typeof bruto !== "string") return { ok: false };

  const recortado = bruto.trim();
  if (recortado.length === 0) return { ok: true, valor: null };
  if (recortado.length > LIMITE_MENSAJE_WHATSAPP) return { ok: false };

  return { ok: true, valor: recortado };
}

// Composición pura del texto final. `mensaje` admite null/undefined para el
// fallback. El único marcador es {titulo}, sustituido de forma literal (todas
// las apariciones) sin interpretar `$`, sin alias y sin recursión. La URL se
// anexa una sola vez al final, separada por dos saltos de línea.
export function resolverMensajeWhatsApp(
  titulo: string,
  mensaje: string | null | undefined,
  url: string
): string {
  const personalizado = mensaje?.trim();
  const cuerpo = personalizado ? personalizado : MENSAJE_WHATSAPP_FALLBACK;
  const conTitulo = cuerpo.split("{titulo}").join(titulo);
  return `${conTitulo}\n\n${url}`;
}

// Cuerpo del mensaje fijo de recordatorio manual. Mismo marcador {titulo} y
// misma composición (URL una sola vez al final) que el mensaje de invitación.
export const MENSAJE_RECORDATORIO_FALLBACK =
  "¡Hola {titulo}! Les recordamos que aún pueden confirmar su asistencia a mis XV años. Si aún no lo hacen, pueden hacerlo aquí:";

export function resolverMensajeRecordatorio(
  titulo: string,
  mensaje: string | null | undefined,
  url: string
): string {
  const personalizado = mensaje?.trim();
  const cuerpo = personalizado ? personalizado : MENSAJE_RECORDATORIO_FALLBACK;
  const conTitulo = cuerpo.split("{titulo}").join(titulo);
  return `${conTitulo}\n\n${url}`;
}

// Instante en el que el botón "Enviar recordatorio" puede aparecer: medianoche
// local (zona del navegador del organizador) del día calendario de la fecha
// límite menos dos días. Sin redondeos de horas ni zona del servidor.
export function umbralRecordatorio(fechaLimite: Date): Date {
  return new Date(
    fechaLimite.getFullYear(),
    fechaLimite.getMonth(),
    fechaLimite.getDate() - 2
  );
}

// Disponibilidad pura del botón: solo para invitaciones sin responder, con
// fecha límite definida y a partir del umbral (permanece tras vencer el plazo).
export function recordatorioDisponible(
  respondida: boolean,
  fechaLimite: Date | null,
  ahora: Date = new Date()
): boolean {
  if (respondida || !fechaLimite) return false;
  return ahora.getTime() >= umbralRecordatorio(fechaLimite).getTime();
}
