import type { DatosEvento } from "@/lib/evento";

export function MensajePadres({ evento }: { evento: DatosEvento }) {
  const padres =
    evento.nombrePadre && evento.nombreMadre
      ? `${evento.nombrePadre} & ${evento.nombreMadre}`
      : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-dorado/25 bg-marfil-osc px-5 py-6 text-center">
      <p className="mx-auto max-w-[300px] font-serif text-[17px] italic leading-relaxed text-eucalipto-700">
        “Con la bendición de Dios y la alegría de nuestras familias, te
        invitamos a celebrar los XV años de {evento.nombreQuinceanera}. Tu
        presencia hará de este día un recuerdo inolvidable.”
      </p>
      <div
        className="mx-auto mt-4 flex items-center justify-center gap-2 text-eucalipto-400"
        aria-hidden="true"
      >
        <span className="h-px w-10 bg-eucalipto-300" />
        <span className="h-1.5 w-1.5 rotate-45 bg-dorado" />
        <span className="h-px w-10 bg-eucalipto-300" />
      </div>
      {padres && (
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          {padres}
        </p>
      )}
      <p className="mt-1 text-xs text-eucalipto-600">Padres de la quinceañera</p>
    </section>
  );
}