import { ExternalLink, Gift } from "lucide-react";
import type { DatosEvento } from "@/lib/evento";
import { urlHttpsValida } from "@/lib/regalos-validacion";

// Sección pública de regalos. Solo se renderiza si `infoRegalos.mostrar` es
// true y existe contenido útil tras normalizar (nunca un bloque vacío). Los
// enlaces se revalidan en lectura (https + hostname) para no exponer URLs
// históricas inseguras.
export function Regalos({ evento }: { evento: DatosEvento }) {
  const regalos = evento.infoRegalos;
  if (!regalos || !regalos.mostrar) return null;

  const mensaje = regalos.mensaje?.trim() || null;
  const datosBancarios = regalos.datosBancarios?.trim() || null;
  const numeroEvento = regalos.numeroEvento?.trim() || null;
  const mesas = [...regalos.mesas]
    .sort((a, b) => a.orden - b.orden)
    .filter((mesa) => mesa.tienda.trim() && urlHttpsValida(mesa.url));

  if (!mensaje && !datosBancarios && !numeroEvento && mesas.length === 0) {
    return null;
  }

  return (
    <section className="px-5 text-center">
      <div className="flex items-center justify-center gap-2">
        <Gift className="h-4 w-4 text-eucalipto-600" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
          Regalos
        </p>
      </div>
      <h2 className="mt-1 font-serif text-2xl text-eucalipto-700">
        Mesa de regalos
      </h2>

      <div className="mt-5 space-y-4 rounded-2xl border border-dorado/25 bg-white px-5 py-6 text-left shadow-sm">
        {mensaje && (
          <p className="text-[15px] leading-6 text-zinc-700">{mensaje}</p>
        )}

        {numeroEvento && (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-eucalipto-100 px-3 py-1 text-xs font-medium text-eucalipto-700">
            Número de evento:
            <span className="font-semibold">{numeroEvento}</span>
          </p>
        )}

        {datosBancarios && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
              Datos bancarios
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
              {datosBancarios}
            </p>
          </div>
        )}

        {mesas.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-eucalipto-600">
              Mesas de regalo
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {mesas.map((mesa) => (
                <a
                  key={mesa.id}
                  href={mesa.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-dorado/40 bg-marfil-osc px-3.5 py-2 text-sm font-medium text-eucalipto-700 hover:bg-dorado/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
                >
                  {mesa.tienda}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
