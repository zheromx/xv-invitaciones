import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import type { FileSize } from "@uploadthing/shared";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_FOTO_PRINCIPAL,
  MAX_TAMANO_IMAGEN_ETIQUETA,
} from "@/lib/imagenes-evento";
import {
  MAX_MUSICA_ARCHIVOS,
  MAX_TAMANO_MUSICA_ETIQUETA,
  MIME_MUSICA,
} from "@/lib/musica-evento";

const f = createUploadthing();

// Autorización derivada SIEMPRE de la sesión (server-side). El cliente nunca
// determina eventoId/usuarioId.
async function eventoDeSesion() {
  const sesion = await auth();
  if (!sesion?.user) {
    throw new UploadThingError("No autenticado");
  }
  const evento = await prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    select: { id: true },
  });
  if (!evento) {
    throw new UploadThingError("No hay un evento vinculado a tu cuenta");
  }
  return evento;
}

const limitesImagen = {
  image: {
    maxFileSize: MAX_TAMANO_IMAGEN_ETIQUETA,
    maxFileCount: MAX_FOTO_PRINCIPAL,
  },
} as const;

const limitesMusica = {
  audio: {
    // UploadThing tipa `maxFileSize` solo como potencias de 2; en runtime acepta
    // cualquier `${n}${unit}` (lo parsea `fileSizeToBytes`), así que 12MB es válido.
    maxFileSize: MAX_TAMANO_MUSICA_ETIQUETA as unknown as FileSize,
    maxFileCount: MAX_MUSICA_ARCHIVOS,
  },
} as const;

export const nuestroFileRouter = {
  // Una sola foto principal por operación.
  fotoPrincipal: f(limitesImagen)
    .middleware(async () => {
      const evento = await eventoDeSesion();
      return { eventoId: evento.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  // Una sola foto de galería por operación.
  fotoGaleria: f(limitesImagen)
    .middleware(async () => {
      const evento = await eventoDeSesion();
      return { eventoId: evento.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  // Una sola foto por operación para una sede (ceremonia o recepción). El slot
  // ("misa"/"recepcion") se valida server-side en la Server Action que persiste.
  fotoSede: f(limitesImagen)
    .middleware(async () => {
      const evento = await eventoDeSesion();
      return { eventoId: evento.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),

  // Una sola pista de música (MP3) por operación.
  musicaEvento: f(limitesMusica)
    .middleware(async ({ files }) => {
      const evento = await eventoDeSesion();
      if (files[0]?.type !== MIME_MUSICA) {
        throw new UploadThingError("Solo se admite MP3 (audio/mpeg)");
      }
      return { eventoId: evento.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type NuestroFileRouter = typeof nuestroFileRouter;
