import { prisma } from "./prisma";
import { MAX_FOTOS_GALERIA } from "./imagenes-evento";

export type MotivoImagen =
  | "no-encontrada"
  | "no-autorizado"
  | "limite-galeria"
  | "datos-invalidos"
  | "fallo";

// Núcleo transaccional de imágenes (testeable sin Next ni UploadThing). Recibe
// el usuarioId de la sesión y deriva el Evento autorizado dentro de la
// transacción; el cliente nunca envía eventoId/usuarioId. Devuelve las URLs
// eliminadas para que la Server Action haga el borrado físico después.

export async function ejecutarGuardarFotoPrincipal(
  usuarioId: string,
  url: string
): Promise<
  | { ok: true; anterior: string | null }
  | { ok: false; motivo: MotivoImagen }
> {
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true, fotoPrincipalUrl: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };

      await tx.evento.update({
        where: { id: evento.id },
        data: { fotoPrincipalUrl: url },
      });
      return { ok: true as const, anterior: evento.fotoPrincipalUrl };
    });
  } catch (error) {
    console.error("Error al guardar la foto principal:", error);
    return { ok: false, motivo: "fallo" };
  }
}

export async function ejecutarEliminarFotoPrincipal(
  usuarioId: string
): Promise<
  | { ok: true; anterior: string | null }
  | { ok: false; motivo: MotivoImagen }
> {
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true, fotoPrincipalUrl: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };
      if (!evento.fotoPrincipalUrl) {
        return { ok: true as const, anterior: null };
      }

      await tx.evento.update({
        where: { id: evento.id },
        data: { fotoPrincipalUrl: null },
      });
      return { ok: true as const, anterior: evento.fotoPrincipalUrl };
    });
  } catch (error) {
    console.error("Error al eliminar la foto principal:", error);
    return { ok: false, motivo: "fallo" };
  }
}

export async function ejecutarAgregarFotoGaleria(
  usuarioId: string,
  url: string
): Promise<{ ok: true } | { ok: false; motivo: MotivoImagen }> {
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };

      // El límite se valida en servidor: manipular el cliente no permite la 7.ª.
      const total = await tx.fotoGaleria.count({ where: { eventoId: evento.id } });
      if (total >= MAX_FOTOS_GALERIA) {
        return { ok: false as const, motivo: "limite-galeria" as const };
      }

      const ultimo = await tx.fotoGaleria.aggregate({
        where: { eventoId: evento.id },
        _max: { orden: true },
      });
      const orden = (ultimo._max.orden ?? -1) + 1;

      await tx.fotoGaleria.create({
        data: { eventoId: evento.id, url, orden },
      });
      return { ok: true as const };
    });
  } catch (error) {
    console.error("Error al agregar la foto de galería:", error);
    return { ok: false, motivo: "fallo" };
  }
}

export async function ejecutarEliminarFotoGaleria(
  usuarioId: string,
  fotoId: string
): Promise<
  | { ok: true; urlEliminada: string }
  | { ok: false; motivo: MotivoImagen }
> {
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };

      // El cliente solo puede referir el FotoGaleria.id; se verifica pertenencia.
      const foto = await tx.fotoGaleria.findFirst({
        where: { id: fotoId, eventoId: evento.id },
        select: { id: true, url: true },
      });
      if (!foto) return { ok: false as const, motivo: "no-autorizado" as const };

      await tx.fotoGaleria.delete({ where: { id: foto.id } });

      // Renumera el resto para conservar orden secuencial 0..n-1.
      const restantes = await tx.fotoGaleria.findMany({
        where: { eventoId: evento.id },
        orderBy: { orden: "asc" },
        select: { id: true },
      });
      for (let posicion = 0; posicion < restantes.length; posicion++) {
        await tx.fotoGaleria.update({
          where: { id: restantes[posicion].id },
          data: { orden: posicion },
        });
      }

      return { ok: true as const, urlEliminada: foto.url };
    });
  } catch (error) {
    console.error("Error al eliminar la foto de galería:", error);
    return { ok: false, motivo: "fallo" };
  }
}

export async function ejecutarMoverFotoGaleria(
  usuarioId: string,
  fotoId: string,
  direccion: "subir" | "bajar"
): Promise<{ ok: true } | { ok: false; motivo: MotivoImagen }> {
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };

      const fotos = await tx.fotoGaleria.findMany({
        where: { eventoId: evento.id },
        orderBy: { orden: "asc" },
        select: { id: true },
      });
      const indice = fotos.findIndex((foto) => foto.id === fotoId);
      if (indice === -1) return { ok: false as const, motivo: "no-autorizado" as const };

      const destino = direccion === "subir" ? indice - 1 : indice + 1;
      if (destino < 0 || destino >= fotos.length) {
        return { ok: true as const };
      }

      const reordenadas = [...fotos];
      [reordenadas[indice], reordenadas[destino]] = [
        reordenadas[destino],
        reordenadas[indice],
      ];
      for (let posicion = 0; posicion < reordenadas.length; posicion++) {
        await tx.fotoGaleria.update({
          where: { id: reordenadas[posicion].id },
          data: { orden: posicion },
        });
      }
      return { ok: true as const };
    });
  } catch (error) {
    console.error("Error al reordenar la galería:", error);
    return { ok: false, motivo: "fallo" };
  }
}

export type SlotSede = "misa" | "recepcion";

function esSlotSede(valor: string): valor is SlotSede {
  return valor === "misa" || valor === "recepcion";
}

// Foto opcional de una sede (ceremonia o recepción). El slot se valida aquí
// (server-side); el cliente nunca elige la columna directamente.
export async function ejecutarGuardarFotoSede(
  usuarioId: string,
  slot: string,
  url: string
): Promise<
  | { ok: true; anterior: string | null }
  | { ok: false; motivo: MotivoImagen }
> {
  if (!esSlotSede(slot)) return { ok: false, motivo: "datos-invalidos" };
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true, misaFotoUrl: true, recepcionFotoUrl: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };

      const anterior =
        slot === "misa" ? evento.misaFotoUrl : evento.recepcionFotoUrl;

      await tx.evento.update({
        where: { id: evento.id },
        data:
          slot === "misa"
            ? { misaFotoUrl: url }
            : { recepcionFotoUrl: url },
      });
      return { ok: true as const, anterior };
    });
  } catch (error) {
    console.error("Error al guardar la foto de sede:", error);
    return { ok: false, motivo: "fallo" };
  }
}

export async function ejecutarEliminarFotoSede(
  usuarioId: string,
  slot: string
): Promise<
  | { ok: true; anterior: string | null }
  | { ok: false; motivo: MotivoImagen }
> {
  if (!esSlotSede(slot)) return { ok: false, motivo: "datos-invalidos" };
  try {
    return await prisma.$transaction(async (tx) => {
      const evento = await tx.evento.findFirst({
        where: { usuarioId },
        select: { id: true, misaFotoUrl: true, recepcionFotoUrl: true },
      });
      if (!evento) return { ok: false as const, motivo: "no-encontrada" as const };

      const anterior =
        slot === "misa" ? evento.misaFotoUrl : evento.recepcionFotoUrl;
      if (!anterior) return { ok: true as const, anterior: null };

      await tx.evento.update({
        where: { id: evento.id },
        data:
          slot === "misa"
            ? { misaFotoUrl: null }
            : { recepcionFotoUrl: null },
      });
      return { ok: true as const, anterior };
    });
  } catch (error) {
    console.error("Error al eliminar la foto de sede:", error);
    return { ok: false, motivo: "fallo" };
  }
}
