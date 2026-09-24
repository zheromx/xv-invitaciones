"use client";

import type { DatosEvento } from "@/lib/evento";
import { useEnViewport } from "@/components/invitacion/revelar";

export function Cronograma({ evento }: { evento: DatosEvento }) {
  const momentos = [...evento.cronograma].sort((a, b) => a.orden - b.orden);
  const { ref, revelado } = useEnViewport<HTMLElement>();

  if (momentos.length === 0) return null;

  return (
    <section ref={ref} className="px-5 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
        Itinerario
      </p>
      <h2 className="mt-1 font-serif text-2xl text-eucalipto-700">
        Momentos mágicos
      </h2>
      <div className="mt-5 rounded-2xl border border-dorado/25 bg-white px-5 py-5 text-left shadow-sm">
        <ol className="relative space-y-4 pl-7 list-none">
          <span
            className="absolute left-[10px] top-3 bottom-3 w-0.5 bg-eucalipto-200"
            aria-hidden="true"
          />
          {momentos.map((momento, indice) => (
            <li
              key={momento.orden}
              style={
                revelado
                  ? { transitionDelay: `${Math.min(indice * 120, 600)}ms` }
                  : undefined
              }
              className={`xv-revelar-item relative flex items-start gap-3 transition-[opacity,transform,translate] duration-[450ms] ease-out motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
                revelado ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <span
                className="absolute -left-7 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-eucalipto-300"
                aria-hidden="true"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-eucalipto-400" />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-eucalipto-600">
                  {momento.hora}
                </span>
                <p className="text-[15px] font-medium text-zinc-800">
                  {momento.titulo}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
