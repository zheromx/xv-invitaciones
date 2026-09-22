"use client";

import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { borrarInvitacion } from "@/lib/acciones-invitaciones";

const TEXTO_REQUERIDO = "ELIMINAR";

export function ConfirmacionBorrado({
  invitacionId,
  titulo,
  totalPersonas,
  respondida,
  confirmadas,
  controlado = false,
  abierto = false,
  onCerrar,
  onEliminada,
}: {
  invitacionId: string;
  titulo: string;
  totalPersonas: number;
  respondida: boolean;
  confirmadas?: number;
  controlado?: boolean;
  abierto?: boolean;
  onCerrar?: () => void;
  onEliminada?: () => void;
}) {
  const router = useRouter();
  const [abiertoLocal, setAbiertoLocal] = useState(false);
  const [texto, setTexto] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const abiertoEfectivo = controlado ? abierto : abiertoLocal;
  const reforzado = respondida;
  const coincide = texto.trim() === TEXTO_REQUERIDO;

  const cerrar = useCallback(() => {
    setTexto("");
    setError(false);
    if (controlado) onCerrar?.();
    else setAbiertoLocal(false);
  }, [controlado, onCerrar]);

  useEffect(() => {
    if (!abiertoEfectivo) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abiertoEfectivo, cerrar]);

  const confirmar = async () => {
    if (reforzado && !coincide) return;
    setBorrando(true);
    setError(false);
    try {
      const resultado = await borrarInvitacion(invitacionId);
      if (resultado.ok) {
        onEliminada?.();
        router.refresh();
      } else {
        setError(true);
      }
    } finally {
      setBorrando(false);
    }
  };

  const plural = (n: number, una: string, muchas: string) =>
    n === 1 ? una : muchas;

  return (
    <div className="flex justify-end">
      {!controlado && (
        <button
          type="button"
          title="Eliminar invitación"
          onClick={() => setAbiertoLocal(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      {abiertoEfectivo && (
        <div
          ref={panelRef}
          role="group"
          aria-label={`Confirmar eliminación de ${titulo}`}
          className="mt-2 w-full rounded-2xl border border-red-200 bg-red-50/60 p-4 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              {reforzado ? (
                <>
                  <p className="text-sm font-semibold text-red-800">
                    Eliminar invitación respondida
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">
                    <span className="font-medium">«{titulo}»</span> ·{" "}
                    {plural(totalPersonas, "1 persona", `${totalPersonas} personas`)}
                    {typeof confirmadas === "number"
                      ? ` (${confirmadas} confirmadas)`
                      : ""}
                  </p>
                  <p
                    role="alert"
                    className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800"
                  >
                    Se eliminarán permanentemente esta invitación y la respuesta
                    RSVP registrada. Esta acción no se puede deshacer.
                  </p>
                  <label className="mt-3 block">
                    <span className="text-xs font-medium text-zinc-700">
                      Escribe <span className="font-semibold">ELIMINAR</span>{" "}
                      para confirmar:
                    </span>
                    <input
                      type="text"
                      autoFocus
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      disabled={borrando}
                      className="mt-1 h-10 w-full max-w-xs rounded-lg border border-red-300 bg-white px-3 text-sm text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:opacity-60"
                    />
                  </label>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-zinc-800">
                    ¿Eliminar a «{titulo}»?
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {plural(totalPersonas, "1 persona", `${totalPersonas} personas`)}{" "}
                    dejar(á)n de estar invitadas y se eliminará el enlace. Esta
                    acción no se puede deshacer.
                  </p>
                </>
              )}

              {error && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  No se pudo eliminar. Inténtalo de nuevo.
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cerrar}
                  disabled={borrando}
                  autoFocus={!reforzado}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmar}
                  disabled={borrando || (reforzado && !coincide)}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:opacity-60 ${
                    borrando
                      ? "bg-red-400"
                      : reforzado && !coincide
                        ? "bg-red-300"
                        : "bg-red-700 hover:bg-red-800"
                  }`}
                >
                  {borrando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eliminando…
                    </>
                  ) : reforzado ? (
                    "Eliminar permanentemente"
                  ) : (
                    "Sí, eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}