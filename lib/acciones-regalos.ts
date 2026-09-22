"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ejecutarActualizarRegalos } from "@/lib/regalos-nucleo";
import { parsearDatosRegalos } from "@/lib/regalos-validacion";

export type ResultadoRegalos =
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

// Server Action fina (bloque separado de la mutación base del Evento): valida
// runtime antes de mutar, deriva el Evento autorizado desde session.user.id
// (nunca desde el cliente) y revalida las rutas afectadas.
export async function actualizarRegalos(
  _prev: unknown,
  formData: FormData
): Promise<ResultadoRegalos> {
  const sesion = await auth();
  if (!sesion?.user) return { ok: false, motivo: "no-autenticado" };

  const datos = parsearDatosRegalos(formData);
  if (!datos) return { ok: false, motivo: "datos-invalidos" };

  const motivo = await ejecutarActualizarRegalos(sesion.user.id, datos);
  if (motivo === null) {
    revalidatePath("/panel/configuracion");
    revalidatePath("/panel/configuracion/vista-previa");
    revalidatePath("/panel");
    revalidatePath("/invitacion/[token]", "page");
    return { ok: true };
  }
  return { ok: false, motivo };
}
