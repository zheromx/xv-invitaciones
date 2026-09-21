import { Clock } from "lucide-react";
import type { DatosEvento } from "@/lib/evento";
import { duracionHasta, formatearFechaLarga } from "@/lib/evento";

export function CuentaRegresiva({ evento }: { evento: DatosEvento }) {
  const { dias, horas, minutos, segundos } = duracionHasta(evento.fecha);
  const unidades = [
    { valor: dias, etiqueta: "Días" },
    { valor: horas, etiqueta: "Horas" },
    { valor: minutos, etiqueta: "Min" },
    { valor: segundos, etiqueta: "Seg" },
  ];

  return (
    <section className="flex flex-col items-center px-5 text-center">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-eucalipto-600" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
          El gran día se acerca
        </p>
      </div>
      <div className="mt-3 grid w-full grid-cols-4 gap-2">
        {unidades.map((u) => (
          <div
            key={u.etiqueta}
            className="flex flex-col items-center rounded-xl bg-white px-1 py-3 shadow-sm"
          >
            <span className="font-serif text-2xl font-bold text-eucalipto-700">
              {String(u.valor).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {u.etiqueta}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        {formatearFechaLarga(evento.fecha)}
      </p>
      <p className="mt-1 text-[10px] text-zinc-400">
        Cifras calculadas al momento de cargar esta vista.
      </p>
    </section>
  );
}