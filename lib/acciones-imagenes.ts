"use server";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { auth } from "@/auth";
import {
  claveDesdeUrlUploadThing,
  urlUploadThingValida,
} from "@/lib/imagenes-evento";
import {
  ejecutarAgregarFotoGaleria,
  ejecutarEliminarFotoGaleria,
  ejecutarEliminarFotoPrincipal,
  ejecutarEliminarFotoSede,
  ejecutarGuardarFotoPrincipal,
  ejecutarGuardarFotoSede,
  ejecutarMoverFotoGaleria,
} from "@/lib/imagenes-nucleo";

export type ResultadoImagen =
  | { ok: true }
  | {
      ok: false;
      motivo:
        | "no-autenticado"
        | "no-encontrada"
        | "datos-invalidos"
        | "limite-galeria"
        | "no-autorizado"
        | "fallo";
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

async function usuarioIdSesion(): Promise<string | null> {
  const sesion = await auth();
  return sesion?.user?.id ?? null;
}

// Borrado físico en UploadThing a partir de la URL persistida (la key se deriva
// server-side; nunca se acepta una key del cliente). Si falla, se registra y no
// se revierte la mutación de BD ya exitosa.
async function borrarObjetoUploadThing(url: string) {
  const clave = claveDesdeUrlUploadThing(url);
  if (!clave) {
    console.warn(
      "[imagenes] No se pudo derivar la key de UploadThing; se omite el borrado físico."
    );
    return;
  }
  try {
    const utapi = new UTApi();
    await utapi.deleteFiles(clave);
  } catch (error) {
    console.error("[imagenes] Falló el borrado físico en UploadThing:", error);
  }
}

export async function guardarFotoPrincipal(url: string): Promise<ResultadoImagen> {
  const usuarioId = await usuarioIdSesion();
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };
  if (typeof url !== "string" || !urlUploadThingValida(url)) {
    return { ok: false, motivo: "datos-invalidos" };
  }

  const resultado = await ejecutarGuardarFotoPrincipal(usuarioId, url);
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  // Persistida la nueva URL, se elimina el objeto anterior si existía.
  if (resultado.anterior && resultado.anterior !== url) {
    await borrarObjetoUploadThing(resultado.anterior);
  }
  revalidar();
  return { ok: true };
}

export async function eliminarFotoPrincipal(): Promise<ResultadoImagen> {
  const usuarioId = await usuarioIdSesion();
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };

  const resultado = await ejecutarEliminarFotoPrincipal(usuarioId);
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  if (resultado.anterior) {
    await borrarObjetoUploadThing(resultado.anterior);
  }
  revalidar();
  return { ok: true };
}

export async function agregarFotoGaleria(url: string): Promise<ResultadoImagen> {
  const usuarioId = await usuarioIdSesion();
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };
  if (typeof url !== "string" || !urlUploadThingValida(url)) {
    return { ok: false, motivo: "datos-invalidos" };
  }

  const resultado = await ejecutarAgregarFotoGaleria(usuarioId, url);
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  revalidar();
  return { ok: true };
}

export async function eliminarFotoGaleria(fotoId: string): Promise<ResultadoImagen> {
  const usuarioId = await usuarioIdSesion();
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };
  if (typeof fotoId !== "string" || !fotoId.trim()) {
    return { ok: false, motivo: "datos-invalidos" };
  }

  const resultado = await ejecutarEliminarFotoGaleria(usuarioId, fotoId.trim());
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  // Primero la fila de BD (ya borrada de forma autorizada), luego el objeto.
  await borrarObjetoUploadThing(resultado.urlEliminada);
  revalidar();
  return { ok: true };
}

export async function moverFotoGaleria(
  fotoId: string,
  direccion: "subir" | "bajar"
): Promise<ResultadoImagen> {
  const usuarioId = await usuarioIdSesion();
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };
  if (typeof fotoId !== "string" || !fotoId.trim()) {
    return { ok: false, motivo: "datos-invalidos" };
  }
  if (direccion !== "subir" && direccion !== "bajar") {
    return { ok: false, motivo: "datos-invalidos" };
  }

  const resultado = await ejecutarMoverFotoGaleria(usuarioId, fotoId.trim(), direccion);
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  revalidar();
  return { ok: true };
}

// Foto opcional de una sede. El slot (misa/recepcion) se valida server-side.
export async function guardarFotoSede(
  slot: string,
  url: string
): Promise<ResultadoImagen> {
  const usuarioId = await usuarioIdSesion();
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };
  if (slot !== "misa" && slot !== "recepcion") {
    return { ok: false, motivo: "datos-invalidos" };
  }
  if (typeof url !== "string" || !urlUploadThingValida(url)) {
    return { ok: false, motivo: "datos-invalidos" };
  }

  const resultado = await ejecutarGuardarFotoSede(usuarioId, slot, url);
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  if (resultado.anterior && resultado.anterior !== url) {
    await borrarObjetoUploadThing(resultado.anterior);
  }
  revalidar();
  return { ok: true };
}

export async function eliminarFotoSede(slot: string): Promise<ResultadoImagen> {
  const usuarioId = await usuarioIdSesion();
  if (!usuarioId) return { ok: false, motivo: "no-autenticado" };
  if (slot !== "misa" && slot !== "recepcion") {
    return { ok: false, motivo: "datos-invalidos" };
  }

  const resultado = await ejecutarEliminarFotoSede(usuarioId, slot);
  if (!resultado.ok) return { ok: false, motivo: resultado.motivo };

  if (resultado.anterior) {
    await borrarObjetoUploadThing(resultado.anterior);
  }
  revalidar();
  return { ok: true };
}
