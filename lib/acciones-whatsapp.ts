"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { validarMensajeWhatsAppEntrante } from "@/lib/whatsapp-mensaje";
import { ejecutarGuardarMensajeWhatsApp } from "@/lib/whatsapp-nucleo";

export type ResultadoWhatsApp =
  | { ok: true }
  | {
      ok: false;
      motivo:
        | "no-autenticado"
        | "no-encontrada"
        | "datos-invalidos"
        | "fallo";
    };

// Server Action fina y aislada del formulario base: valida estrictamente el
// payload antes de mutar, deriva el Evento desde session.user.id y revalida el
// panel de configuración y el listado de invitaciones.
export async function guardarMensajeWhatsApp(
  _prev: unknown,
  formData: FormData
): Promise<ResultadoWhatsApp> {
  const sesion = await auth();
  if (!sesion?.user) return { ok: false, motivo: "no-autenticado" };

  const validado = validarMensajeWhatsAppEntrante(
    formData.get("mensajeWhatsApp")
  );
  if (!validado.ok) return { ok: false, motivo: "datos-invalidos" };

  const motivo = await ejecutarGuardarMensajeWhatsApp(
    sesion.user.id,
    validado.valor
  );
  if (motivo !== null) return { ok: false, motivo };

  revalidatePath("/panel/configuracion");
  revalidatePath("/panel/invitaciones");
  return { ok: true };
}
