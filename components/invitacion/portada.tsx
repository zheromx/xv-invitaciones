import type { DatosEvento } from "@/lib/evento";
import { formatearFechaLarga } from "@/lib/evento";

function Ramita({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M24 44V6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M24 38c-7-2-11-9-12-16 7-1 11 9 12 16Z"
        fill="currentColor"
        opacity="0.45"
      />
      <path
        d="M24 30c2-7 8-11 16-12-1 8-9 12-16 12Z"
        fill="currentColor"
        opacity="0.45"
      />
      <path
        d="M24 16c-6-1-10-6-12-12 6-1 10 6 12 12Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M24 8c4-4 9-6 14-6-2 5-6 7-14 6Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

export function Portada({ evento }: { evento: DatosEvento }) {
  return (
    <section className="relative overflow-hidden rounded-t-[140px] rounded-b-2xl bg-eucalipto-900 shadow-sm">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-eucalipto-700 via-eucalipto-800 to-eucalipto-900" />
        <div
          className="pointer-events-none absolute inset-x-10 top-16 aspect-square rounded-full border border-dorado/25"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-20 top-28 aspect-square rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-eucalipto-900/95 via-eucalipto-900/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-8 pt-24 text-center">
          <Ramita className="h-6 w-6 text-dorado-claro" />
          <p className="mt-2 rounded-full border border-dorado/40 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-dorado-claro">
            Mis XV Años
          </p>
          <h1 className="mt-3 font-serif text-[38px] font-normal leading-tight text-white">
            {evento.nombreQuinceanera}
          </h1>
          <p className="mt-2 text-sm italic text-white/85">
            Te invitamos a celebrar con nosotros
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            {formatearFechaLarga(evento.fecha)}
          </p>
        </div>
      </div>
    </section>
  );
}