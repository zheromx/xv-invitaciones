// Utilidades de ubicación para la invitación pública. Sin API key, SDK,
// geocoding ni resolución de redirects: la URL explícita se usa tal cual y,
// si no existe, se genera una búsqueda a partir de la dirección.

const HOSTS_ACORTADORES = new Set(["maps.app.goo.gl", "goo.gl"]);

// google.com, www.google.com, maps.google.com, google.com.mx, google.co.uk y
// cualquier subdominio de google.<tld>.
const HOST_GOOGLE = /^(?:[a-z0-9-]+\.)*google\.[a-z]{2,3}(\.[a-z]{2})?$/;

const LONGITUD_MAXIMA_URL = 2048;

// Valida una URL COMPARTIDA de Google Maps (la que se copia desde "Compartir").
export function urlMapaGoogleValida(valor: string): boolean {
  const limpia = valor.trim();
  if (!limpia || limpia.length > LONGITUD_MAXIMA_URL) return false;

  let url: URL;
  try {
    url = new URL(limpia);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;

  const host = url.hostname.toLowerCase();

  if (HOSTS_ACORTADORES.has(host)) {
    // Enlaces cortos: basta con que traigan una ruta (código).
    return url.pathname.replace(/\/+$/, "").length > 1;
  }

  if (HOST_GOOGLE.test(host)) {
    // Host Google normal: debe apuntar a /maps.
    return url.pathname.startsWith("/maps");
  }

  return false;
}

// Construye una URL de búsqueda de Google Maps (sin API key, SDK ni geocoding)
// a partir de una dirección en texto libre. Devuelve null si la dirección es
// vacía o solo espacios, para no renderizar enlaces vacíos.
export function urlMapaGoogle(direccion: string): string | null {
  const limpia = direccion.trim();
  if (!limpia) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    limpia
  )}`;
}

// Prioriza la URL explícita válida; si no, cae a la búsqueda por dirección.
export function resolverUrlMapa(
  urlExplicita: string | null | undefined,
  direccion: string | null | undefined
): string | null {
  if (urlExplicita && urlMapaGoogleValida(urlExplicita)) {
    return urlExplicita.trim();
  }
  if (direccion) return urlMapaGoogle(direccion);
  return null;
}
