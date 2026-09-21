"use server";

import { revalidatePath } from "next/cache";
import {
  ejecutarConfirmacion,
  idsLimpios,
  type MotivoRsvp,
} from "@/lib/rsvp-nucleo";

export type ResultadoRsvp =
  | { ok: true }
  | { ok: false; motivo: MotivoRsvp | "fallo" };

export async function confirmarAsistencia(input: {
  token: string;
  personaIdsQueAsisten: string[];
}): Promise<ResultadoRsvp> {
  const token = input.token;
  const entrada: unknown = input.personaIdsQueAsisten;

  if (!Array.isArray(entrada) || !entrada.every((id) => typeof id === "string")) {
    return { ok: false, motivo: "ids-invalidos" };
  }

  const personaIdsQueAsisten = idsLimpios(entrada as string[]);

  try {
    const motivo = await ejecutarConfirmacion(token, personaIdsQueAsisten);
    if (motivo === null) {
      revalidatePath(`/invitacion/${token}`);
      revalidatePath(`/invitacion/[token]`);
      return { ok: true };
    }
    return { ok: false, motivo };
  } catch (error) {
    console.error("Error al confirmar asistencia:", error);
    return { ok: false, motivo: "fallo" };
  }
}