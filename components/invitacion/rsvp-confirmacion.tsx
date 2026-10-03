"use client";

import { AlertTriangle, Check, Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { PersonaDemo } from "@/lib/evento";
import { construirResumen } from "@/lib/rsvp-resumen";

const suscripcionVacia = () => () => {};

const SELECTOR_ENFOCABLES =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Revisión previa al envío del RSVP. Modal accesible sin dependencias nuevas:
// portal, `role="dialog"`, foco atrapado, cierre con Escape y devolución del
// foco gestionada por el padre. La única acción que escribe es "Sí, enviar
// respuesta"; cerrar o Escape nunca escriben.
export function RsvpConfirmacion({
  personas,
  seleccion,
  enviando,
  onCancelar,
  onEnviar,
}: {
  personas: PersonaDemo[];
  seleccion: Set<string>;
  enviando: boolean;
  onCancelar: () => void;
  onEnviar: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const cancelarRef = useRef<HTMLButtonElement | null>(null);
  const montado = useSyncExternalStore(suscripcionVacia, () => true, () => false);
  const resumen = construirResumen(personas, seleccion);
  const nadieAsiste = resumen.asisten.length === 0;

  useEffect(() => {
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelarRef.current?.focus();

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        if (!enviando) onCancelar();
        return;
      }
      if (evento.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const enfocables = Array.from(
        panel.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES)
      );

      // Durante el envío ambos botones quedan deshabilitados: se retiene el
      // foco en el panel para que no escape al fondo.
      if (enfocables.length === 0) {
        evento.preventDefault();
        panel.focus();
        return;
      }

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const activo = document.activeElement as HTMLElement | null;
      const dentro = activo !== null && panel.contains(activo);

      if (evento.shiftKey) {
        if (!dentro || activo === primero) {
          evento.preventDefault();
          ultimo.focus();
        }
      } else if (!dentro || activo === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    window.addEventListener("keydown", alTeclear);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [enviando, onCancelar]);

  if (!montado) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={() => {
        if (!enviando) onCancelar();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Revisar respuesta"
        tabIndex={-1}
        onClick={(evento) => evento.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl focus:outline-none sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <h2 className="font-serif text-xl text-eucalipto-700">
            Revisa tu respuesta
          </h2>
          <button
            type="button"
            onClick={onCancelar}
            disabled={enviando}
            aria-label="Cerrar revisión"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm leading-6 text-zinc-600">
            Esta respuesta es definitiva. Una vez enviada no se puede modificar.
          </p>

          {nadieAsiste && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-left text-sm leading-5 text-amber-800"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Ninguna persona de la invitación asistirá.</span>
            </p>
          )}

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-eucalipto-600">
              Sí asistirán ({resumen.asisten.length})
            </p>
            {resumen.asisten.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {resumen.asisten.map((persona) => (
                  <li
                    key={persona.id}
                    className="flex items-center gap-2 rounded-lg bg-eucalipto-200/60 px-3 py-2 text-sm font-medium text-eucalipto-800"
                  >
                    <Check className="h-4 w-4 shrink-0" />
                    {persona.nombre}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">Nadie</p>
            )}
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              No asistirán ({resumen.noAsisten.length})
            </p>
            {resumen.noAsisten.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {resumen.noAsisten.map((persona) => (
                  <li
                    key={persona.id}
                    className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600"
                  >
                    {persona.nombre}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">Nadie</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            ref={cancelarRef}
            type="button"
            onClick={onCancelar}
            disabled={enviando}
            className="flex h-11 w-full items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-medium text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            Volver a editar
          </button>
          <button
            type="button"
            onClick={onEnviar}
            disabled={enviando}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-eucalipto-700 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {enviando ? "Enviando…" : "Sí, enviar respuesta"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
