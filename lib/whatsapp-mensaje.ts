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
