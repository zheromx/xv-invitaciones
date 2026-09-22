"use client";

import {
  ArrowDown,
  ArrowUp,
  Gift,
  Info,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useActionState, useState } from "react";
import { actualizarRegalos, type ResultadoRegalos } from "@/lib/acciones-regalos";
import { LIMITES_REGALOS } from "@/lib/regalos-validacion";

export type MesaRegaloInicial = { id?: string; tienda: string; url: string };

export type ValoresInicialesRegalos = {
  mostrar: boolean;
  mensaje: string;
  datosBancarios: string;
  numeroEvento: string;
  mesas: MesaRegaloInicial[];
};

type FilaMesa = { clave: string; id?: string; tienda: string; url: string };

const MENSAJES: Record<
  Extract<ResultadoRegalos, { ok: false }>["motivo"],
  string
> = {
  "no-autenticado": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "no-encontrada": "No hay un evento vinculado a tu cuenta.",
  "datos-invalidos":
    "Revisa los regalos: cada mesa necesita tienda y una URL https:// válida, y si activas la sección debe haber al menos un dato (mensaje, datos bancarios, número de evento o una mesa).",
  "no-autorizado": "No tienes permiso para modificar estas mesas de regalo.",
  fallo: "Ocurrió un error inesperado. Vuelve a intentarlo.",
};

const claseInput =
  "mt-1.5 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-70";
const claseArea =
  "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-70";
const claseEtiqueta = "block";
const claseTitulo = "text-xs font-semibold text-zinc-700";

let sigClave = 0;

export function BloqueRegalos({
  inicial,
}: {
  inicial: ValoresInicialesRegalos;
}) {
  const [mostrar, setMostrar] = useState(inicial.mostrar);
  const [filas, setFilas] = useState<FilaMesa[]>(() =>
    inicial.mesas.map((mesa) => ({
      clave: `r-${sigClave++}`,
      id: mesa.id,
      tienda: mesa.tienda,
      url: mesa.url,
    }))
  );

  const [estado, accionForm, pendiente] = useActionState<
    ResultadoRegalos | null,
    FormData
  >(actualizarRegalos, null);

  const estadoError = estado && !estado.ok ? estado : null;
  const hayCupo = filas.length < LIMITES_REGALOS.mesas;

  const agregarMesa = () => {
    setFilas((actual) => [
      ...actual,
      { clave: `r-${sigClave++}`, tienda: "", url: "" },
    ]);
  };

  const eliminarMesa = (clave: string) => {
    setFilas((actual) => actual.filter((fila) => fila.clave !== clave));
  };

  const cambiarMesa = (
    clave: string,
    campo: "tienda" | "url",
    valor: string
  ) => {
    setFilas((actual) =>
      actual.map((fila) => (fila.clave === clave ? { ...fila, [campo]: valor } : fila))
    );
  };

  const moverMesa = (indice: number, direccion: -1 | 1) => {
    setFilas((actual) => {
      const destino = indice + direccion;
      if (destino < 0 || destino >= actual.length) return actual;
      const copia = [...actual];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3 border-b border-zinc-100 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-eucalipto-100 text-eucalipto-700">
          <Gift className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg text-eucalipto-700">8. Regalos</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Sección opcional de regalos y mesas (hasta {LIMITES_REGALOS.mesas}).
            Solo enlaces externos; sin pagos ni integración con tiendas.
          </p>
        </div>
      </div>

      <form action={accionForm} className="mt-4 space-y-5">
        <fieldset disabled={pendiente} className="space-y-5">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-zinc-800">
              <Gift className="h-4 w-4 text-eucalipto-700" />
              Mostrar sección de regalos en la invitación
            </span>
            <input
              type="checkbox"
              name="regalos_mostrar"
              checked={mostrar}
              onChange={(evento) => setMostrar(evento.target.checked)}
              className="h-5 w-5 rounded border-zinc-300 text-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
            />
          </label>

          {!mostrar && (
            <p className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              Los datos se conservan, pero no se mostrarán en la invitación.
            </p>
          )}

          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Mensaje para invitados (opcional)</span>
            <textarea
              name="regalos_mensaje"
              defaultValue={inicial.mensaje}
              maxLength={LIMITES_REGALOS.mensaje}
              rows={3}
              placeholder="Ej. Su presencia es nuestro mayor regalo. Si desean tener un detalle…"
              className={claseArea}
            />
          </label>

          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Datos bancarios (opcional)</span>
            <textarea
              name="regalos_datosBancarios"
              defaultValue={inicial.datosBancarios}
              maxLength={LIMITES_REGALOS.datosBancarios}
              rows={3}
              placeholder={"Banco, titular y cuenta/CLABE.\nPuedes usar saltos de línea."}
              className={claseArea}
            />
            <span className="mt-1 block text-[11px] text-zinc-400">
              Texto libre; se muestra respetando los saltos de línea.
            </span>
          </label>

          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Número o código de evento (opcional)</span>
            <input
              type="text"
              name="regalos_numeroEvento"
              defaultValue={inicial.numeroEvento}
              maxLength={LIMITES_REGALOS.numeroEvento}
              placeholder="Ej. Evento #123456"
              className={claseInput}
            />
          </label>

          <fieldset className="space-y-3">
            <legend className={claseTitulo}>Mesas de regalo</legend>

            {filas.length === 0 && (
              <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
                Todavía no hay mesas de regalo.
              </p>
            )}

            {filas.map((fila, indice) => (
              <div
                key={fila.clave}
                className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3"
              >
                <input type="hidden" name="mesa_id" value={fila.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className={`${claseEtiqueta} sm:w-40`}>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Tienda
                    </span>
                    <input
                      type="text"
                      name="mesa_tienda"
                      value={fila.tienda}
                      onChange={(evento) =>
                        cambiarMesa(fila.clave, "tienda", evento.target.value)
                      }
                      maxLength={LIMITES_REGALOS.tienda}
                      placeholder="Ej. Amazon"
                      className={claseInput}
                    />
                  </label>
                  <label className={`${claseEtiqueta} flex-1`}>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      URL (https://)
                    </span>
                    <input
                      type="url"
                      name="mesa_url"
                      value={fila.url}
                      onChange={(evento) =>
                        cambiarMesa(fila.clave, "url", evento.target.value)
                      }
                      maxLength={LIMITES_REGALOS.url}
                      placeholder="https://…"
                      className={claseInput}
                    />
                  </label>
                  <div className="flex items-center gap-1 pb-0.5">
                    <button
                      type="button"
                      onClick={() => moverMesa(indice, -1)}
                      disabled={indice === 0}
                      aria-label="Subir mesa"
                      title="Subir"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moverMesa(indice, 1)}
                      disabled={indice === filas.length - 1}
                      aria-label="Bajar mesa"
                      title="Bajar"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarMesa(fila.clave)}
                      aria-label="Eliminar mesa"
                      title="Eliminar"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={agregarMesa}
              disabled={!hayCupo}
              className="inline-flex items-center gap-1.5 rounded-full border border-dorado/50 px-3.5 py-2 text-xs font-semibold text-eucalipto-700 hover:bg-dorado/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar mesa
            </button>
            <p className="text-[11px] text-zinc-400">
              {filas.length} de {LIMITES_REGALOS.mesas} mesas · tienda y URL
              https:// obligatorias por fila
            </p>
          </fieldset>
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
            Regalos guardados.
          </p>
        )}

        <button
          type="submit"
          disabled={pendiente}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-eucalipto-700 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {pendiente ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar regalos
        </button>
      </form>
    </section>
  );
}
