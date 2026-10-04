"use client";

import { Info, Loader2, MessageCircleMore, Save } from "lucide-react";
import { useActionState, useState } from "react";
import {
  guardarMensajeWhatsApp,
  type ResultadoWhatsApp,
} from "@/lib/acciones-whatsapp";
import {
  LIMITE_MENSAJE_WHATSAPP,
  resolverMensajeWhatsApp,
} from "@/lib/whatsapp-mensaje";

const MENSAJES: Record<
  Extract<ResultadoWhatsApp, { ok: false }>["motivo"],
  string
> = {
  "no-autenticado": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "no-encontrada": "No hay un evento vinculado a tu cuenta.",
  "datos-invalidos": `El mensaje no puede superar ${LIMITE_MENSAJE_WHATSAPP} caracteres. Revisa el texto e inténtalo de nuevo.`,
  fallo: "Ocurrió un error inesperado. Vuelve a intentarlo.",
};

const TITULO_EJEMPLO = "Familia Rodríguez";
const URL_EJEMPLO = "https://ejemplo.test/invitacion/ejemplo";

export function BloqueWhatsApp({ inicial }: { inicial: string }) {
  const [valor, setValor] = useState(inicial);
  const [estado, accionForm, pendiente] = useActionState<
    ResultadoWhatsApp | null,
    FormData
  >(guardarMensajeWhatsApp, null);

  const estadoError = estado && !estado.ok ? estado : null;
  const previsualizacion = resolverMensajeWhatsApp(
    TITULO_EJEMPLO,
    valor,
    URL_EJEMPLO
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3 border-b border-zinc-100 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-eucalipto-100 text-eucalipto-700">
          <MessageCircleMore className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg text-eucalipto-700">
            10. Mensaje de WhatsApp
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Texto que acompaña al enlace al compartir cada invitación
            manualmente por WhatsApp. Es privado del panel.
          </p>
        </div>
      </div>

      <form action={accionForm} className="mt-4 space-y-4">
        <fieldset disabled={pendiente} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-zinc-700">
              Mensaje (opcional)
            </span>
            <textarea
              name="mensajeWhatsApp"
              value={valor}
              onChange={(evento) => setValor(evento.target.value)}
              maxLength={LIMITE_MENSAJE_WHATSAPP}
              rows={4}
              placeholder="Ej. ¡Hola {titulo}! Los esperamos para celebrar este día tan especial."
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-70"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span>
              Marcador opcional <span className="font-semibold">{"{titulo}"}</span>{" "}
              se reemplaza por el título de cada invitación.
            </span>
            <span>
              {valor.length}/{LIMITE_MENSAJE_WHATSAPP}
            </span>
          </div>

          <p className="flex items-start gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-[11px] leading-4 text-zinc-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-eucalipto-600" />
            No hace falta pegar el enlace: el sistema agrega automáticamente la
            URL de cada invitación al final. Si dejas el mensaje vacío se usa el
            mensaje predeterminado.
          </p>

          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Previsualización (ejemplo)
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
              {previsualizacion}
            </p>
            <p className="mt-1 text-[10px] text-zinc-400">
              En una invitación real, el título y el enlace corresponden a esa
              invitación.
            </p>
          </div>
        </fieldset>

        {estadoError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700"
          >
            {MENSAJES[estadoError.motivo]}
          </p>
        )}
        {estado?.ok && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-lg bg-eucalipto-100 px-3 py-2 text-sm text-eucalipto-800"
          >
            <Info className="h-4 w-4 shrink-0" />
            Mensaje guardado. Los próximos enlaces de WhatsApp usarán este
            texto.
          </p>
        )}

        <button
          type="submit"
          disabled={pendiente}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-eucalipto-700 px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendiente ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar mensaje
        </button>
      </form>
    </section>
  );
}
