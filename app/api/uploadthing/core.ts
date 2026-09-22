import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_FOTO_PRINCIPAL,
  MAX_TAMANO_IMAGEN_ETIQUETA,
} from "@/lib/imagenes-evento";

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
} satisfies FileRouter;

export type NuestroFileRouter = typeof nuestroFileRouter;
