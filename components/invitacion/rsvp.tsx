import {
  Check,
  CheckCircle2,
  ClipboardList,
  Info,
  Lock,
} from "lucide-react";
import type { DatosEvento, InvitacionDemo } from "@/lib/evento";
import { formatearFechaCorta } from "@/lib/evento";
import { RsvpFormulario } from "@/components/invitacion/rsvp-formulario";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();
}

function SinResponder({ invitacion }: { invitacion: InvitacionDemo }) {
  return (
    <>
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-eucalipto-700 text-white">
        <ClipboardList className="h-5 w-5" />
      </span>
      <h2 className="mt-3 font-serif text-2xl text-eucalipto-700">
        Confirma tu asistencia
      </h2>
      <p className="mt-1 font-serif text-base italic text-eucalipto-600">
        {invitacion.titulo}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {invitacion.personas.length} pases reservados
      </p>
      <ul className="mt-4 space-y-2 text-left">
        {invitacion.personas.map((persona) => {
          const marcado = persona.asiste ?? true;
          return (
            <li
              key={persona.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <span className="text-sm font-medium text-zinc-800">
                {persona.nombre}
              </span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded ${
                  marcado
                    ? "bg-eucalipto-700 text-white"
                    : "border border-zinc-300"
                }`}
                aria-hidden="true"
              >
                {marcado && <Check className="h-3.5 w-3.5" />}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
        <Info className="h-3.5 w-3.5 text-eucalipto-600" />
        La confirmación se puede enviar una sola vez.
      </p>
      <button
        type="button"
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-eucalipto-700 text-sm font-semibold text-white"
      >
        <CheckCircle2 className="h-4 w-4" />
        Confirmar asistencia
      </button>
      <span className="mt-2 inline-block text-xs text-eucalipto-600 underline underline-offset-4">
        No podré asistir
      </span>
    </>
  );
}

function Confirmada({
  invitacion,
}: {
  invitacion: InvitacionDemo;
}) {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
        Pase digital registrado
      </p>
      <h2 className="mt-1 font-serif text-2xl text-eucalipto-700">
        Confirmación de asistencia
      </h2>
      <p className="mt-1 font-serif text-base italic text-eucalipto-600">
        {invitacion.titulo}
      </p>
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-eucalipto-200 p-3 text-left">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-eucalipto-700" />
        <div>
          <p className="text-sm font-semibold text-eucalipto-800">
            Tu respuesta ha sido registrada
          </p>
          <p className="mt-0.5 text-xs leading-5 text-eucalipto-700">
            Gracias por acompañarnos en este día tan especial.
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-left">
        {invitacion.personas.map((persona) => {
          const asiste = persona.asiste ?? false;
          return (
            <li
              key={persona.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-marfil-osc text-[11px] font-semibold text-eucalipto-700">
                  {iniciales(persona.nombre)}
                </span>
                <span className="text-sm font-medium text-zinc-800">
                  {persona.nombre}
                </span>
              </div>
              {asiste ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-eucalipto-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-eucalipto-700">
                <Check className="h-3 w-3" />
                Asistirá
              </span>
            ) : (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                No asistirá
              </span>
            )}
          </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
        <Lock className="h-3.5 w-3.5 text-eucalipto-600" />
        La confirmación queda sellada y no puede modificarse.
      </div>
    </>
  );
}

export function Rsvp({
  evento,
  invitacion,
  demostracion = false,
  token,
}: {
  evento: DatosEvento;
  invitacion: InvitacionDemo;
  demostracion?: boolean;
  token?: string;
}) {
  const interactivo = !demostracion && Boolean(token) && !invitacion.respondida;
  return (
    <section className="px-5">
      <div className="rounded-2xl border border-dorado/25 bg-marfil-osc px-5 py-6 text-center">
        {invitacion.respondida ? (
          <Confirmada invitacion={invitacion} />
        ) : interactivo && token ? (
          <RsvpFormulario token={token} personas={invitacion.personas} />
        ) : (
          <SinResponder invitacion={invitacion} />
        )}
        {evento.fechaLimiteRsvp && (
          <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
            Responde antes del {formatearFechaCorta(evento.fechaLimiteRsvp)}
          </p>
        )}
      </div>
      {demostracion && (
        <p className="px-5 pt-3 text-center text-[10px] leading-4 text-zinc-400">
          Vista de demostración: esta confirmación no se guarda en ningún
          lugar.
        </p>
      )}
    </section>
  );
}