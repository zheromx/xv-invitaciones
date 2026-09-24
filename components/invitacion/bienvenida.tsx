"use client";

import { CalendarDays, Mail } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type TransitionEvent,
} from "react";
import { useAudioMusica } from "@/components/invitacion/audio-musica";
import type { DatosEvento } from "@/lib/evento";
import { formatearFechaLarga } from "@/lib/evento";

const suscripcionVacia = () => () => {};

// Ornamento de esquina (SVG local). Se refleja con transforms para las 4 esquinas.
function EsquinaFloral({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M4 4 Q24 6 28 28" strokeLinecap="round" />
      <path d="M4 4 Q6 24 28 28" strokeLinecap="round" />
      <path
        d="M8 9 Q14 7 16 13 Q11 15 8 9 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="none"
      />
      <path
        d="M9 8 Q7 14 13 16 Q15 11 9 8 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="none"
      />
      <circle cx="28" cy="28" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Aro de laurel interno del sello (SVG local mínimo).
function LaurelSello() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-1.5 h-[calc(100%-12px)] w-[calc(100%-12px)] text-dorado-claro/40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path
        d="M22 68 C15 50 20 30 35 20 C42 15 50 15 58 18"
        strokeLinecap="round"
      />
      <path
        d="M78 68 C85 50 80 30 65 20 C58 15 50 15 42 18"
        strokeLinecap="round"
      />
      <circle cx="21" cy="46" r="3" fill="currentColor" stroke="none" />
      <circle cx="27" cy="32" r="3" fill="currentColor" stroke="none" />
      <circle cx="79" cy="46" r="3" fill="currentColor" stroke="none" />
      <circle cx="73" cy="32" r="3" fill="currentColor" stroke="none" />
      <circle cx="50" cy="85" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Bienvenida({ evento }: { evento: DatosEvento }) {
  const [saliendo, setSaliendo] = useState(false);
  const [oculto, setOculto] = useState(false);
  const reducirRef = useRef(false);
  const scrollPendiente = useRef(false);
  const abriendoRef = useRef(false);
  const finalizadoRef = useRef(false);
  const pausaTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  // `false` en SSR (sin JS → en flujo, sin overlay ni bloqueo); `true` tras
  // hidratar en cliente (overlay fijo + bloqueo de scroll).
  const montado = useSyncExternalStore(
    suscripcionVacia,
    () => true,
    () => false
  );
  const { iniciar } = useAudioMusica();

  // Bloqueo del scroll del documento mientras la bienvenida está visible.
  useEffect(() => {
    if (!montado || oculto) return;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [montado, oculto]);

  // Al abrir: desplazar a #invitacion y reflejar el hash en la URL.
  useEffect(() => {
    if (!oculto || !scrollPendiente.current) return;
    scrollPendiente.current = false;
    const destino = document.getElementById("invitacion");
    if (destino) {
      destino.scrollIntoView({
        behavior: reducirRef.current ? "auto" : "smooth",
        block: "start",
      });
    }
    try {
      window.history.replaceState(null, "", "#invitacion");
    } catch {
      // History API no disponible: el flujo continúa igual.
    }
  }, [oculto]);

  // Limpieza de timers al desmontar el componente.
  useEffect(() => {
    return () => {
      if (pausaTimerRef.current !== null) {
        window.clearTimeout(pausaTimerRef.current);
      }
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  // Finalización centralizada e idempotente: desmonta y deja que los efectos
  // existentes restauren el scroll y hagan scrollIntoView hacia #invitacion.
  const finalizar = useCallback(() => {
    if (finalizadoRef.current) return;
    finalizadoRef.current = true;
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setOculto(true);
  }, []);

  if (oculto) return null;

  const alAbrir = (eventoClick: MouseEvent<HTMLAnchorElement>) => {
    if (abriendoRef.current) {
      eventoClick.preventDefault();
      return;
    }
    eventoClick.preventDefault();
    // Inicia la música de forma SÍNCRONA dentro del mismo gesto del usuario.
    iniciar();
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducirRef.current = reducir;
    scrollPendiente.current = true;
    if (reducir) {
      finalizar();
      return;
    }
    abriendoRef.current = true;
    // Fallback desde el clic por si `transitionend` no llega (p. ej. pestaña oculta).
    fallbackTimerRef.current = window.setTimeout(finalizar, 1350);
    // Fase 1: pausa ceremonial sin cambios visuales.
    pausaTimerRef.current = window.setTimeout(() => {
      pausaTimerRef.current = null;
      setSaliendo(true);
    }, 250);
  };

  const alTransicionTerminar = (
    eventoTransicion: TransitionEvent<HTMLElement>
  ) => {
    if (!saliendo || finalizadoRef.current) return;
    if (eventoTransicion.target !== eventoTransicion.currentTarget) return;
    if (eventoTransicion.propertyName !== "opacity") return;
    finalizar();
  };

  const inicial =
    evento.nombreQuinceanera.trim().charAt(0).toUpperCase() || "·";

  const clasesSeccion = montado
    ? "fixed inset-0 z-[60] flex items-center justify-center bg-marfil px-6"
    : "relative mx-auto flex min-h-svh w-full max-w-[420px] flex-col items-center justify-center bg-marfil px-6";

  const colorOrnamento = "text-[#e0c298]";

  return (
    <section
      onTransitionEnd={alTransicionTerminar}
      className={`${clasesSeccion} transition-[opacity,transform] duration-[1000ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
        saliendo ? "pointer-events-none -translate-y-6 opacity-0" : "opacity-100"
      }`}
    >
      {/* Animación local y scoped del anillo del sello (solo opacity/transform). */}
      <style>{`
        @keyframes xv-sello-pulso {
          0% { transform: scale(1); opacity: 0.82; }
          70% { transform: scale(1.07); opacity: 0; }
          100% { transform: scale(1.07); opacity: 0; }
        }
        .xv-sello-pulso { animation: xv-sello-pulso 2.5s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .xv-sello-pulso { display: none; }
        }
      `}</style>

      {/* Glow ambiental estático */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-80 w-80 -translate-y-6 rounded-full bg-eucalipto-200/30 blur-3xl" />
      </div>

      {/* Tarjeta / sobre */}
      <div className="relative flex w-full max-w-[370px] flex-col items-center overflow-hidden rounded-[2rem] bg-white shadow-xl">
        {/* Textura de papel */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-marfil-osc/40 via-transparent to-marfil-osc/60"
          aria-hidden="true"
        />

        {/* Marco interior foil */}
        <div
          className="pointer-events-none absolute inset-2.5 rounded-[1.5rem] bg-gradient-to-br from-dorado-claro/25 via-transparent to-dorado-claro/35 p-[1px]"
          aria-hidden="true"
        >
          <div className="h-full w-full rounded-[1.4rem] bg-white/80" />
        </div>

        {/* Ornamentos de esquina (4) */}
        <EsquinaFloral
          className={`pointer-events-none absolute left-4 top-4 h-11 w-11 opacity-80 ${colorOrnamento}`}
        />
        <EsquinaFloral
          className={`pointer-events-none absolute right-4 top-4 h-11 w-11 -scale-x-100 opacity-80 ${colorOrnamento}`}
        />
        <EsquinaFloral
          className={`pointer-events-none absolute bottom-4 left-4 h-11 w-11 -scale-y-100 opacity-80 ${colorOrnamento}`}
        />
        <EsquinaFloral
          className={`pointer-events-none absolute bottom-4 right-4 h-11 w-11 -scale-x-100 -scale-y-100 opacity-80 ${colorOrnamento}`}
        />

        {/* Solapa + contenido */}
        <div className="relative z-10 flex w-full flex-col items-center px-6 pb-2 pt-6">
          {/* Solapa (geometría y capas) */}
          <div
            className="pointer-events-none absolute inset-x-0 -top-1 h-28 opacity-70"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 370 110"
              preserveAspectRatio="none"
              className="h-full w-full"
              fill="none"
            >
              <path d="M0 0 L185 88 L370 0 Z" fill="#f5f3f0" fillOpacity="0.9" />
              <path
                d="M0 0 L185 88 L370 0"
                stroke="#c5a880"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <path
                d="M12 4 L185 86 L358 4"
                stroke="rgba(15,45,32,0.08)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#xv-flap-blur)"
              />
              <defs>
                <filter
                  id="xv-flap-blur"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="4" />
                </filter>
              </defs>
            </svg>
          </div>

          {/* Etiqueta */}
          <div className="relative z-20 mb-3 mt-2 flex items-center gap-2">
            <span className="h-px w-6 bg-dorado-claro" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-eucalipto-600">
              MIS XV AÑOS
            </span>
            <span className="h-px w-6 bg-dorado-claro" />
          </div>

          {/* Nombre */}
          <div className="relative z-20 my-1 text-center">
            <p className="font-serif text-[40px] font-normal italic leading-tight tracking-tight text-eucalipto-900">
              {evento.nombreQuinceanera}
            </p>
          </div>

          {/* Frase */}
          <p className="relative z-20 mb-4 mt-2 max-w-[250px] text-center text-sm leading-relaxed text-zinc-600">
            Con mucha ilusión, te invito a celebrar este día tan especial
          </p>

          {/* Fecha (píldora) */}
          <div className="relative z-20 mb-6 flex items-center gap-1.5 rounded-full bg-marfil-osc/70 px-4 py-1.5 shadow-sm">
            <CalendarDays className="h-4 w-4 text-dorado-osc" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-dorado-osc">
              {formatearFechaLarga(evento.fecha)}
            </span>
          </div>

          {/* Sello / medallón */}
          <div className="relative z-20 my-2">
            {/* Base estática tenue (aro fijo, sin animación) */}
            <span
              className="pointer-events-none absolute -inset-2.5 rounded-full ring-1 ring-dorado-claro/40"
              aria-hidden="true"
            />
            {/* Pulso animado (solo opacity/transform) */}
            <span
              className="xv-sello-pulso pointer-events-none absolute -inset-2.5 rounded-full bg-dorado/45"
              aria-hidden="true"
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-dorado-claro to-dorado-osc p-[2px] shadow-md">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-eucalipto-900 to-eucalipto-700 p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.28)]">
                <LaurelSello />
                <span className="relative font-serif text-3xl text-dorado-claro">
                  {inicial}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="relative z-20 mt-6 w-full max-w-[280px]">
            <a
              href="#invitacion"
              onClick={alAbrir}
              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-eucalipto-700 px-6 text-sm font-semibold text-white shadow-md transition-colors hover:bg-eucalipto-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
            >
              Abrir invitación
              <Mail className="h-5 w-5 text-dorado-claro" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Costura inferior */}
        <div
          className="relative z-10 flex h-4 w-full items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-dorado to-transparent" />
        </div>
      </div>
    </section>
  );
}
