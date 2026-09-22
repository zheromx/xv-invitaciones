"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ejecutarActualizarEvento } from "@/lib/evento-nucleo";
import { parsearDatosEvento } from "@/lib/evento-validacion";

export type ResultadoEvento =
  | { ok: true }
  | {
      ok: false;
      motivo:
        | "no-autenticado"
        | "no-encontrada"
        | "datos-invalidos"
        | "no-autorizado"
        | "fallo";
    };

// Server Action fina: valida runtime antes de mutar, deriva el Evento
// autorizado desde session.user.id (nunca desde el cliente) y revalida las
// rutas afectadas.
export async function actualizarEvento(
  _prev: unknown,
  formData: FormData
): Promise<ResultadoEvento> {
  const sesion = await auth();
  if (!sesion?.user) return { ok: false, motivo: "no-autenticado" };

  const datos = parsearDatosEvento(formData);
  if (!datos) return { ok: false, motivo: "datos-invalidos" };

  const motivo = await ejecutarActualizarEvento(sesion.user.id, datos);
  if (motivo === null) {
    revalidatePath("/panel/configuracion");
    revalidatePath("/panel");
    // Invalida las páginas públicas de invitación que muestran datos del evento.
    revalidatePath("/invitacion/[token]", "page");
    return { ok: true };
  }
  return { ok: false, motivo };
}
