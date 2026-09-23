import type { DatosEvento } from "@/lib/evento";
import { MAX_FOTOS_GALERIA } from "@/lib/imagenes-evento";
import { GaleriaInteractiva } from "@/components/invitacion/galeria-interactiva";

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

const VARIANTES = [
  "from-eucalipto-200 to-eucalipto-400",
  "from-eucalipto-100 to-eucalipto-300",
  "from-marfil-claro to-eucalipto-200",
  "from-eucalipto-300 to-eucalipto-600",
];

// Server Component: mantiene el grid 2×3 y los placeholders no interactivos.
// Las fotos reales se delegan al componente cliente aislado del visor.
export function Galeria({ evento }: { evento: DatosEvento }) {
  const fotos = [...evento.galeria]
    .sort((a, b) => a.orden - b.orden)
    .slice(0, MAX_FOTOS_GALERIA);

  if (fotos.length === 0) return null;

  const reales = fotos
    .filter((foto): foto is { url: string; orden: number } => Boolean(foto.url))
    .map((foto, indice) => ({ url: foto.url, alt: `Recuerdo ${indice + 1}` }));

  const totalPlaceholders = MAX_FOTOS_GALERIA - reales.length;

  return (
    <section className="px-5 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
        Recuerdos
      </p>
      <h2 className="mt-1 font-serif text-2xl text-eucalipto-700">Galería</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <GaleriaInteractiva fotos={reales} />
        {Array.from({ length: totalPlaceholders }, (_, indice) => {
          const posicion = reales.length + indice;
          return (
            <div
              key={`placeholder-${posicion}`}
              className={`flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br ${
                VARIANTES[posicion % VARIANTES.length]
              } shadow-sm`}
            >
              <Ramita className="h-9 w-9 text-marfil/80" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
