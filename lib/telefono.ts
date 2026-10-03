export type MotivoTelefono = "vacio" | "caracteres" | "largo" | "521";

export type ResultadoTelefono =
  | { ok: true; e164: string }
  | { ok: false; motivo: MotivoTelefono };

const PREFIJO_MX = "52";
const LARGO_NACIONAL = 10;
const LARGO_INTERNACIONAL = 12;

function limpiar(bruto: string): string | null {
  const texto = bruto.trim();
  if (!texto) return null;

  if (/[a-zA-Z]/.test(texto)) return null;
  if (!/^\+?[\d\s\-()]+$/.test(texto)) return null;

  const sinMas = texto.startsWith("+") ? texto.slice(1) : texto;
  if (sinMas.includes("+")) return null;

  const digitos = sinMas.replace(/[\s\-()]/g, "");
  if (!/^\d+$/.test(digitos)) return null;
  return digitos;
}

export function validarTelefono(bruto: string): ResultadoTelefono {
  if (typeof bruto !== "string") return { ok: false, motivo: "caracteres" };

  const digitos = limpiar(bruto);
  if (digitos === null) {
    return { ok: false, motivo: bruto.trim() ? "caracteres" : "vacio" };
  }

  if (digitos.length === LARGO_NACIONAL) {
    return { ok: true, e164: PREFIJO_MX + digitos };
  }
  if (digitos.length === LARGO_INTERNACIONAL && digitos.startsWith(PREFIJO_MX)) {
    return { ok: true, e164: digitos };
  }
  if (digitos.length === 13 && digitos.startsWith(PREFIJO_MX + "1")) {
    return { ok: false, motivo: "521" };
  }
  return { ok: false, motivo: "largo" };
}

export function normalizarTelefono(bruto: string): string | null {
  const resultado = validarTelefono(bruto);
  return resultado.ok ? resultado.e164 : null;
}

export function formatearTelefono(e164: string): string {
  const diez = e164.slice(-LARGO_NACIONAL);
  if (diez.length !== LARGO_NACIONAL || !/^\d{10}$/.test(diez)) return e164;
  return `+52 ${diez.slice(0, 3)} ${diez.slice(3, 6)} ${diez.slice(6)}`;
}
