"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  validarMesaEntrante,
  validarMensajeMesaWhatsAppEntrante,
} from "@/lib/mesas-validacion";
import {
  ejecutarGuardarMesaPersona,
  ejecutarGuardarMensajeMesaWhatsApp,
} from "@/lib/mesas-nucleo";

export type ResultadoMesaAction =
  | { ok: true }
  | {
      ok: false;
      motivo:
        | "no-autenticado"
        | "no-encontrada"
        | "no-autorizado"
        | "no-respondida"
        | "no-asiste"
        | "datos-invalidos"
        | "fallo";
    };

export async function guardarMesaPersonaAction(
  personaId: string,
  mesaBruta: unknown
): Promise<ResultadoMesaAction> {
  const sesion = await auth();
  if (!sesion?.user) return { ok: false, motivo: "no-autenticado" };

  if (typeof personaId !== "string" || personaId.trim() === "") {
    return { ok: false, motivo: "datos-invalidos" };
  }

  const validadoMesa = validarMesaEntrante(mesaBruta);
  if (!validadoMesa.ok) return { ok: false, motivo: "datos-invalidos" };

  const motivo = await ejecutarGuardarMesaPersona(
    sesion.user.id,
    personaId,
    validadoMesa.valor
  );
  if (motivo !== null) return { ok: false, motivo };

  revalidatePath("/panel");
  revalidatePath("/panel/invitaciones");
  return { ok: true };
}

export async function guardarMensajeMesaWhatsApp(
  _prev: unknown,
  formData: FormData
): Promise<ResultadoMesaAction> {
  const sesion = await auth();
  if (!sesion?.user) return { ok: false, motivo: "no-autenticado" };

  const validado = validarMensajeMesaWhatsAppEntrante(
    formData.get("mensajeMesaWhatsApp")
  );
  if (!validado.ok) return { ok: false, motivo: "datos-invalidos" };

  const motivo = await ejecutarGuardarMensajeMesaWhatsApp(
    sesion.user.id,
    validado.valor
  );
  if (motivo !== null) return { ok: false, motivo };

  revalidatePath("/panel/configuracion");
  revalidatePath("/panel/invitaciones");
  return { ok: true };
}
