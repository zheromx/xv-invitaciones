import Image from "next/image";
import type { DatosEvento } from "@/lib/evento";
import { MAX_FOTOS_GALERIA } from "@/lib/imagenes-evento";

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

export function Galeria({ evento }: { evento: DatosEvento }) {
  const fotos = [...evento.galeria]
    .sort((a, b) => a.orden - b.orden)
    .slice(0, MAX_FOTOS_GALERIA);

  if (fotos.length === 0) return null;

  // Composición 2 columnas × hasta 3 filas (máximo 6): se muestran las fotos
  // reales y las posiciones faltantes se completan con placeholders locales,
  // conservando la paleta y el ADN de la plantilla.
  const posiciones = Array.from(
    { length: MAX_FOTOS_GALERIA },
    (_, indice) => fotos[indice] ?? null
  );

  return (
    <section className="px-5 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
        Recuerdos
      </p>
      <h2 className="mt-1 font-serif text-2xl text-eucalipto-700">Galería</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {posiciones.map((foto, indice) =>
          foto && foto.url ? (
            <div
              key={foto.url || indice}
              className="relative aspect-square overflow-hidden rounded-xl shadow-sm"
            >
              <Image
                src={foto.url}
                alt={`Recuerdo ${indice + 1}`}
                fill
                sizes="(max-width: 420px) 45vw, 200px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              key={`placeholder-${indice}`}
              className={`flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br ${
                VARIANTES[indice % VARIANTES.length]
              } shadow-sm`}
            >
              <Ramita className="h-9 w-9 text-marfil/80" />
            </div>
          )
        )}
      </div>
    </section>
  );
}
