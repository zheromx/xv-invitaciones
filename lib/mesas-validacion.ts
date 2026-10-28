export const LIMITE_MENSAJE_MESA_WHATSAPP = 1000;

export const MENSAJE_MESA_FALLBACK =
  "¡Hola {titulo}! Les compartimos el número de mesa asignado para los XV años. Pueden consultarlo aquí:";

export function validarMesaEntrante(bruto: unknown): { ok: true; valor: number | null } | { ok: false } {
  if (bruto === null || bruto === undefined || bruto === "") {
    return { ok: true, valor: null };
  }
  let numero: number;
  if (typeof bruto === "number") {
    numero = bruto;
  } else if (typeof bruto === "string") {
    const limpio = bruto.trim();
    if (limpio === "") return { ok: true, valor: null };
    if (!/^\d+$/.test(limpio)) return { ok: false };
    numero = Number(limpio);
  } else {
    return { ok: false };
  }

  if (!Number.isInteger(numero) || numero <= 0 || numero > 2147483647) {
    return { ok: false };
  }

  return { ok: true, valor: numero };
}

export function validarMensajeMesaWhatsAppEntrante(
  bruto: unknown
): { ok: true; valor: string | null } | { ok: false } {
  if (typeof bruto !== "string") return { ok: false };

  const recortado = bruto.trim();
  if (recortado.length === 0) return { ok: true, valor: null };
  if (recortado.length > LIMITE_MENSAJE_MESA_WHATSAPP) return { ok: false };

  return { ok: true, valor: recortado };
}

export function resolverMensajeMesaWhatsApp(
  titulo: string,
  mensaje: string | null | undefined,
  url: string
): string {
  const personalizado = mensaje?.trim();
  const cuerpo = personalizado ? personalizado : MENSAJE_MESA_FALLBACK;
  const conTitulo = cuerpo.split("{titulo}").join(titulo);
  return `${conTitulo}\n\n${url}`;
}
