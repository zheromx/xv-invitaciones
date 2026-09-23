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
