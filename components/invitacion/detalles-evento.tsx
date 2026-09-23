import { Church, Clock, MapPin, Shirt, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { DatosEvento } from "@/lib/evento";
import { urlMapaGoogle } from "@/lib/ubicaciones";

type BloqueProps = {
  icono: ReactNode;
  eyebrow: string;
  titulo: string;
  hora: string;
  lugar: string;
  direccion: string;
};

function Bloque({ icono, eyebrow, titulo, hora, lugar, direccion }: BloqueProps) {
  const urlMapa = urlMapaGoogle(direccion);
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dorado/25 bg-marfil-osc px-5 py-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-eucalipto-200 text-eucalipto-700">
        {icono}
      </span>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
        {eyebrow}
      </p>
      <h3 className="mt-1 font-serif text-xl text-eucalipto-700">{titulo}</h3>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-eucalipto-700 shadow-sm">
        <Clock className="h-3.5 w-3.5" />
        {hora}
      </span>
      <p className="mt-3 text-[15px] font-medium text-zinc-800">{lugar}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{direccion}</p>
      {urlMapa && (
        <a
          href={urlMapa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-eucalipto-700 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
        >
          <MapPin className="h-4 w-4" />
          Ver ubicación
        </a>
      )}
    </div>
  );
}

export function DetallesEvento({ evento }: { evento: DatosEvento }) {
  return (
    <section className="space-y-4 px-5 text-center">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
          Ceremonia y recepción
        </p>
        <h2 className="mt-1 font-serif text-2xl text-eucalipto-700">
          Cuándo y dónde
        </h2>
      </div>

      {evento.tieneMisa && evento.misaLugar && (
        <Bloque
          icono={<Church className="h-5 w-5" />}
          eyebrow="Misa de acción de gracias"
          titulo="Ceremonia religiosa"
          hora={evento.misaHora ?? ""}
          lugar={evento.misaLugar}
          direccion={evento.misaDireccion ?? ""}
        />
      )}
      <Bloque
        icono={<Sparkles className="h-5 w-5" />}
        eyebrow="Gran festejo"
        titulo="Recepción"
        hora={evento.recepcionHora}
        lugar={evento.recepcionLugar}
        direccion={evento.recepcionDireccion}
      />

      {(evento.codigoVestimenta || evento.infoAdicional) && (
        <div className="rounded-2xl border border-dorado/25 bg-marfil-osc px-5 py-5 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-eucalipto-200 text-eucalipto-700">
            <Shirt className="h-5 w-5" />
          </span>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
            Protocolo
          </p>
          {evento.codigoVestimenta && (
            <p className="mt-2 font-serif text-lg italic text-dorado-osc">
              {evento.codigoVestimenta}
            </p>
          )}
          {evento.infoAdicional && (
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {evento.infoAdicional}
            </p>
          )}
        </div>
      )}
    </section>
  );
}