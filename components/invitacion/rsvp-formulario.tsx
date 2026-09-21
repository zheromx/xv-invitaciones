"use client";

import { Check, CheckCircle2, ClipboardList, Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  confirmarAsistencia,
  type ResultadoRsvp,
} from "@/lib/acciones-rsvp";
import type { PersonaDemo } from "@/lib/evento";

const MENSAJES_ERROR: Record<
  Extract<ResultadoRsvp, { ok: false }>["motivo"],
  string
> = {
  "no-encontrada":
    "Esta invitación ya no está disponible. Revisa el enlace que te compartieron.",
  "ya-respondida": "Esta invitación ya fue respondida. Te mostramos el estado actual.",
  "ids-invalidos": "Hubo un problema con la selección. Vuelve a intentarlo.",
  fallo: "No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.",
};

export function RsvpFormulario({
  token,
  personas,
}: {
  token: string;
  personas: PersonaDemo[];
}) {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<Set<string>>(
    () => new Set(personas.filter((p) => p.asiste !== false).map((p) => p.id))
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alternar = (id: string) => {
    if (enviando) return;
    setSeleccion((actual) => {
      const nueva = new Set(actual);
      if (nueva.has(id)) nueva.delete(id);
      else nueva.add(id);
      return nueva;
    });
    setError(null);
  };

  const confirmar = async () => {
    if (enviando) return;
    setEnviando(true);
    setError(null);
    const resultado = await confirmarAsistencia({
      token,
      personaIdsQueAsisten: [...seleccion],
    });
    if (resultado.ok) {
      router.refresh();
      return;
    }
    setEnviando(false);
    setError(MENSAJES_ERROR[resultado.motivo]);
    if (resultado.motivo === "ya-respondida") {
      router.refresh();
    }
  };

  return (
    <>
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-eucalipto-700 text-white">
        <ClipboardList className="h-5 w-5" />
      </span>
      <h2 className="mt-3 font-serif text-2xl text-eucalipto-700">
        Confirma tu asistencia
      </h2>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {personas.length} pases reservados
      </p>
      <ul className="mt-4 space-y-2 text-left" aria-busy={enviando}>
        {personas.map((persona) => {
          const marcado = seleccion.has(persona.id);
          return (
            <li key={persona.id}>
              <label
                className={`flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ${
                  enviando ? "opacity-60" : "cursor-pointer"
                }`}
              >
                <span className="text-sm font-medium text-zinc-800">
                  {persona.nombre}
                </span>
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={marcado}
                  disabled={enviando}
                  onChange={() => alternar(persona.id)}
                />
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-eucalipto-700 peer-focus-visible:ring-offset-2 ${
                    marcado
                      ? "bg-eucalipto-700 text-white"
                      : "border border-zinc-300"
                  }`}
                  aria-hidden="true"
                >
                  {marcado && <Check className="h-3.5 w-3.5" />}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
        <Info className="h-3.5 w-3.5 text-eucalipto-600" />
        La confirmación se puede enviar una sola vez.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-left text-xs leading-5 text-red-700"
        >
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={confirmar}
        disabled={enviando}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-eucalipto-700 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {enviando ? "Enviando…" : "Confirmar asistencia"}
      </button>
      <button
        type="button"
        onClick={() => {
          setSeleccion(new Set());
          setError(null);
        }}
        disabled={enviando}
        className="mt-2 inline-block rounded-sm text-xs text-eucalipto-600 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-60"
      >
        No podré asistir
      </button>
    </>
  );
}