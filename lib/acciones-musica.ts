"use server";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { auth } from "@/auth";
import {
  claveDesdeUrlUploadThing,
  urlUploadThingValida,
} from "@/lib/imagenes-evento";
import {
  ejecutarEliminarMusica,
  ejecutarGuardarMusica,
} from "@/lib/musica-nucleo";

export type ResultadoMusica =
  | { ok: true }
  | {
      ok: false;
      motivo: "no-autenticado" | "no-encontrada" | "datos-invalidos" | "fallo";
    };

const RUTAS_REVALIDADAS = [
  "/panel/configuracion",
  "/panel/configuracion/vista-previa",
  "/panel",
];

function revalidar() {
  for (const ruta of RUTAS_REVALIDADAS) revalidatePath(ruta);
  revalidatePath("/invitacion/[token]", "page");
}

// Borrado físico en UploadThing a partir de la URL persistida (la key se deriva
// server-side; nunca se acepta del cliente). Best-effort: si falla, se registra
// y no se revierte la mutación de BD ya exitosa.
async function borrarMusicaUploadThing(url: string) {
  const clave = claveDesdeUrlUploadThing(url);
  if (!clave) {
    console.warn(
      "[musica] No se pudo derivar la key de UploadThing; se omite el borrado físico."
    );
    return;
  }
  try {
    const utapi = new UTApi();
    await utapi.deleteFiles(clave);
  } catch (error) {
    console.error("[musica] Falló el borrado físico en UploadThing:", error);
  }
}

export async function guardarMusica(url: string): Promise<ResultadoMusica> {
  const sesion = await auth();
  const usuarioId = sesion?.user?.id;
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };
  if (typeof url !== "string" || !urlUploadThingValida(url)) {
    return { ok: false, motivo: "datos-invalidos" };
  }

  const resultado = await ejecutarGuardarMusica(usuarioId, url);
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  if (resultado.anterior && resultado.anterior !== url) {
    await borrarMusicaUploadThing(resultado.anterior);
  }
  revalidar();
  return { ok: true };
}

export async function eliminarMusica(): Promise<ResultadoMusica> {
  const sesion = await auth();
  const usuarioId = sesion?.user?.id;
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };

  const resultado = await ejecutarEliminarMusica(usuarioId);
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  if (resultado.anterior) {
    await borrarMusicaUploadThing(resultado.anterior);
  }
  revalidar();
  return { ok: true };
}
