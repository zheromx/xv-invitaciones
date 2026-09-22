import type {
  DatosRegalosActualizables,
  MesaEntrada,
} from "./regalos-nucleo";

// Validación runtime pura (sin Next ni Prisma) de la sección de regalos.
export const LIMITES_REGALOS = {
  mensaje: 1000,
  datosBancarios: 2000,
  numeroEvento: 200,
  mesas: 5,
  tienda: 100,
  url: 2000,
} as const;

// Solo HTTPS con hostname válido. Rechaza http, javascript:, data:, URLs
// malformadas y URLs sin host. Se usa al guardar y también al renderizar.
export function urlHttpsValida(valor: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(valor);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (!parsed.hostname) return false;
  return true;
}

function texto(formData: FormData, campo: string): string {
  const bruto = formData.get(campo);
  return typeof bruto === "string" ? bruto.trim() : "";
}

function parsearMesas(formData: FormData): MesaEntrada[] | null {
  const ids = formData.getAll("mesa_id");
  const tiendas = formData.getAll("mesa_tienda");
  const urls = formData.getAll("mesa_url");
  const total = Math.max(ids.length, tiendas.length, urls.length);

  const mesas: MesaEntrada[] = [];
  const idsVistos = new Set<string>();
  for (let indice = 0; indice < total; indice++) {
    const id = String(ids[indice] ?? "").trim();
    const tienda = String(tiendas[indice] ?? "").trim();
    const url = String(urls[indice] ?? "").trim();

    // Fila totalmente vacía → se ignora.
    if (!id && !tienda && !url) continue;

    // Fila parcial (falta tienda o URL) → inválida.
    if (!tienda || !url) return null;
    if (tienda.length > LIMITES_REGALOS.tienda) return null;
    if (url.length > LIMITES_REGALOS.url || !urlHttpsValida(url)) return null;
    if (id) {
      if (idsVistos.has(id)) return null; // ids duplicados
      idsVistos.add(id);
    }

    mesas.push({ id: id || undefined, tienda, url });
    if (mesas.length > LIMITES_REGALOS.mesas) return null;
  }

  return mesas;
}

export function parsearDatosRegalos(
  formData: FormData
): DatosRegalosActualizables | null {
  const valorMostrar = formData.get("regalos_mostrar");
  const mostrar = valorMostrar === "on" || valorMostrar === "true";

  const mensaje = texto(formData, "regalos_mensaje");
  if (mensaje.length > LIMITES_REGALOS.mensaje) return null;
  const datosBancarios = texto(formData, "regalos_datosBancarios");
  if (datosBancarios.length > LIMITES_REGALOS.datosBancarios) return null;
  const numeroEvento = texto(formData, "regalos_numeroEvento");
  if (numeroEvento.length > LIMITES_REGALOS.numeroEvento) return null;

  const mesas = parsearMesas(formData);
  if (mesas === null) return null;

  // Al mostrar, exigir al menos un contenido útil tras normalizar.
  if (mostrar) {
    const tieneContenido = Boolean(
      mensaje || datosBancarios || numeroEvento || mesas.length > 0
    );
    if (!tieneContenido) return null;
  }

  return {
    mostrar,
    mensaje: mensaje || null,
    datosBancarios: datosBancarios || null,
    numeroEvento: numeroEvento || null,
    mesas,
  };
}
