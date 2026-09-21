import type { DatosEvento } from "@/lib/evento";

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
    </svg>
  );
}

export function FooterBotanico({ evento }: { evento: DatosEvento }) {
  const mesAnio = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(evento.fecha);
  const etiqueta = mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1);

  return (
    <footer className="px-5 pt-2 text-center">
      <div className="flex items-center justify-center gap-2 text-eucalipto-400">
        <span className="h-px w-10 bg-eucalipto-300" aria-hidden="true" />
        <Ramita className="h-4 w-4" />
        <span className="h-px w-10 bg-eucalipto-300" aria-hidden="true" />
      </div>
      <p className="mt-2 font-serif text-base italic text-eucalipto-700">
        Con amor, {evento.nombreQuinceanera} y su familia
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        {etiqueta}
      </p>
    </footer>
  );
}