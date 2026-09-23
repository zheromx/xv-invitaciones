// Constantes y validaciones compartidas (cliente y servidor) para las imágenes
// del evento. MAX_FOTOS_GALERIA es deliberadamente una constante central: si se
// cambia, no requiere migración (el límite se valida en servidor y se refleja
// en la UI).

export const MAX_FOTOS_GALERIA = 6;
export const MAX_FOTO_PRINCIPAL = 1;
export const MAX_FOTO_SEDE = 1;

// 4 MB expresados en bytes y en la etiqueta que espera UploadThing.
export const MAX_TAMANO_IMAGEN_BYTES = 4 * 1024 * 1024;
export const MAX_TAMANO_IMAGEN_ETIQUETA = "4MB" as const;

export const TIPOS_IMAGEN_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function tipoImagenPermitido(tipo: string): boolean {
  return (TIPOS_IMAGEN_PERMITIDOS as readonly string[]).includes(tipo);
}

function esHostUploadThing(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "utfs.io" || host.endsWith(".ufs.sh");
}

// Deriva la key del objeto UploadThing a partir de la URL persistida.
// Formato verificado con la versión instalada (uploadthing@6.12.0):
// `https://utfs.io/f/<key>`. Se usa para el borrado físico sin guardar la key
// en BD (el schema no tiene columna para ello).
export function claveDesdeUrlUploadThing(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (!esHostUploadThing(parsed.hostname)) return null;

  const marcador = "/f/";
  const indice = parsed.pathname.indexOf(marcador);
  if (indice === -1) return null;

  const claveBruta = parsed.pathname.slice(indice + marcador.length);
  if (!claveBruta) return null;

  try {
    return decodeURIComponent(claveBruta);
  } catch {
    return claveBruta;
  }
}

// Verifica que la URL enviada por el cliente sea un objeto de UploadThing
// válido (host permitido + key presente). Evita persistir URLs arbitrarias.
export function urlUploadThingValida(url: string): boolean {
  return claveDesdeUrlUploadThing(url) !== null;
}
