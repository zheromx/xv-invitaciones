"use server";

import { revalidatePath } from "next/cache";
import { obtenerEventoSegunSesion } from "@/lib/invitaciones-panel";
import { ejecutarBorrar, ejecutarCrear, ejecutarEditar } from "@/lib/invitaciones-nucleo";
import { normalizarTelefono } from "@/lib/telefono";

export type ResultadoInvitacion =
  | { ok: true }
  | { ok: false; motivo: "no-event" | "datos-invalidos" | "no-encontrada" | "no-autorizado" | "ya-respondida" | "fallo" };

const limite = { titulo: 120, personas: 25 };

function extraerTitulo(formData: FormData): string | null {
  const bruto = formData.get("titulo");
  const titulo = typeof bruto === "string" ? bruto.trim() : "";
  return titulo && titulo.length <= limite.titulo ? titulo : null;
}

function extraerPersonas(formData: FormData): string[] | null {
  const brutos = formData.getAll("persona").filter((v): v is string => typeof v === "string");
  if (brutos.length === 0 || brutos.length > limite.personas) return null;

  const resultados: string[] = [];
  const vistos = new Set<string>();
  for (const bruto of brutos) {
    const nombre = bruto.trim();
    if (!nombre || nombre.length > limite.titulo) return null;
    const clave = nombre.toLocaleLowerCase("es");
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    resultados.push(nombre);
  }
  return resultados.length > 0 ? resultados : null;
}

function extraerTelefono(
  formData: FormData
): { ok: true; telefono: string | null } | { ok: false } {
  const bruto = formData.get("telefono");
  if (bruto === null) return { ok: true, telefono: null };
  const texto = typeof bruto === "string" ? bruto.trim() : "";
  if (!texto) return { ok: true, telefono: null };
  const telefono = normalizarTelefono(texto);
  if (!telefono) return { ok: false };
  return { ok: true, telefono };
}

export async function crearInvitacion(
  _prev: unknown,
  formData: FormData
): Promise<ResultadoInvitacion> {
  const titulo = extraerTitulo(formData);
  const personas = extraerPersonas(formData);
  const telefono = extraerTelefono(formData);
  if (!titulo || !personas || !telefono.ok) return { ok: false, motivo: "datos-invalidos" };

  const evento = await obtenerEventoSegunSesion();
  if (!evento) return { ok: false, motivo: "no-event" };

  const resultado = await ejecutarCrear(evento.id, titulo, telefono.telefono, personas);
  if (resultado === null) {
    revalidatePath("/panel/invitaciones");
    return { ok: true };
  }
  return { ok: false, motivo: resultado };
}

export async function editarInvitacion(
  invitacionId: string,
  _prev: unknown,
  formData: FormData
): Promise<ResultadoInvitacion> {
  const id = typeof invitacionId === "string" ? invitacionId.trim() : "";
  if (!id) return { ok: false, motivo: "datos-invalidos" };

  const titulo = extraerTitulo(formData);
  const personas = extraerPersonas(formData);
  const telefono = extraerTelefono(formData);
  const eliminadas = formData
    .getAll("persona_eliminada")
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  if (!titulo || !personas || !telefono.ok) return { ok: false, motivo: "datos-invalidos" };

  const evento = await obtenerEventoSegunSesion();
  if (!evento) return { ok: false, motivo: "no-event" };

  const ids = formData
    .getAll("persona_id")
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim());

  const personasConId = personas.map((nombre, i) => ({
    personaId: ids[i] ?? "",
    nombre,
  }));

  const motivo = await ejecutarEditar(
    evento.id,
    id,
    titulo,
    telefono.telefono,
    personasConId,
    eliminadas
  );
  if (motivo === null) {
    revalidatePath("/panel/invitaciones");
    revalidatePath(`/panel/invitaciones/${id}/editar`);
    return { ok: true };
  }
  return { ok: false, motivo };
}

export async function borrarInvitacion(
  invitacionId: string
): Promise<ResultadoInvitacion> {
  const id = typeof invitacionId === "string" ? invitacionId.trim() : "";
  if (!id) return { ok: false, motivo: "datos-invalidos" };

  const evento = await obtenerEventoSegunSesion();
  if (!evento) return { ok: false, motivo: "no-event" };

  const motivo = await ejecutarBorrar(evento.id, id);
  if (motivo === null) {
    revalidatePath("/panel/invitaciones");
    return { ok: true };
  }
  return { ok: false, motivo };
}