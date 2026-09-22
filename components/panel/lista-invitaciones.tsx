"use client";

import {
  CheckCircle2,
  ChevronDown,
  Eye,
  Link2,
  Lock,
  MessageCircleMore,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Fragment, useState } from "react";
import { ConfirmacionBorrado } from "@/components/panel/confirmacion-borrado";

export type FilaInvitacion = {
  id: string;
  titulo: string;
  url: string;
  respondida: boolean;
  totalPersonas: number;
  confirmadas: number;
  integrantes: string;
  respondidaEn: string | null;
};

function iniciales(titulo: string): string {
  const partes = titulo.trim().split(/\s+/).filter(Boolean);
  const letras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letras.join("") || "?";
}

export function ListaInvitaciones({
  invitaciones,
  hayEvento,
}: {
  invitaciones: FilaInvitacion[];
  hayEvento: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "respondida" | "sin-responder">("todas");
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const mostrarToast = () => {
    setToast(true);
    window.setTimeout(() => setToast(false), 2400);
  };

  const copiarEnlace = async (fila: FilaInvitacion) => {
    try {
      await navigator.clipboard.writeText(fila.url);
    } finally {
      mostrarToast();
    }
  };

  const compartirWhatsApp = (fila: FilaInvitacion) => {
    const texto = `¡Hola ${fila.titulo}! Están invitados a mis XV años. Confirmen su asistencia aquí: ${fila.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const consulta = query.trim().toLocaleLowerCase("es");
  const visibles = invitaciones.filter((fila) => {
    const coincideFiltro =
      filtro === "todas" ||
      (filtro === "respondida" && fila.respondida) ||
      (filtro === "sin-responder" && !fila.respondida);
    const coincideTexto =
      !consulta ||
      fila.titulo.toLocaleLowerCase("es").includes(consulta) ||
      fila.integrantes.toLocaleLowerCase("es").includes(consulta);
    return coincideFiltro && coincideTexto;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-eucalipto-700">Invitaciones</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Crea, edita y comparte los enlaces de confirmación.
          </p>
        </div>
        <a
          href="/panel/invitaciones/nueva"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-eucalipto-700 px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Nueva invitación
        </a>
      </div>

      {!hayEvento ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-serif text-lg text-eucalipto-700">
            Aún no hay evento vinculado
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
            La configuración del evento se habilita en un entregable posterior.
            En desarrollo, ejecuta el seed para crear una invitación de prueba.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por familia o persona…"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
              />
            </div>
            <div className="relative">
              <select
                value={filtro}
                onChange={(e) =>
                  setFiltro(
                    e.target.value as "todas" | "respondida" | "sin-responder"
                  )
                }
                className="h-10 appearance-none rounded-lg border border-zinc-300 bg-white pl-3 pr-8 text-sm text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
              >
                <option value="todas">Todos los estados</option>
                <option value="respondida">Respondida</option>
                <option value="sin-responder">Sin responder</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>

          <div className="overflow-x-auto">
            {visibles.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-zinc-500">
                {invitaciones.length === 0
                  ? "Todavía no hay invitaciones. Crea la primera."
                  : "Ninguna invitación coincide con la búsqueda o el filtro."}
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Familia o grupo
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Personas
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                      Confirmada el
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {visibles.map((fila) => (
                    <Fragment key={fila.id}>
                      <tr className="hover:bg-zinc-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-eucalipto-100 font-serif text-sm text-eucalipto-800">
                              {iniciales(fila.titulo)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-800">
                                {fila.titulo}
                              </p>
                              <p className="truncate text-xs text-zinc-500">
                                {fila.integrantes}
                              </p>
                            </div>
                          </div>
                        </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-zinc-800">
                            {fila.totalPersonas}{" "}
                            {fila.totalPersonas === 1 ? "persona" : "personas"}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {fila.respondida
                              ? `${fila.confirmadas} confirmadas`
                              : "Pendiente"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fila.respondida ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-eucalipto-100 px-2.5 py-0.5 text-xs font-medium text-eucalipto-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Respondida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                            Sin responder
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                        {fila.respondida ? fila.respondidaEn ?? "—" : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={fila.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Ver invitación"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <a
                            href={`/panel/invitaciones/${fila.id}/editar`}
                            title={fila.respondida ? "Ver en solo lectura" : "Editar"}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700"
                          >
                            {fila.respondida ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Pencil className="h-4 w-4" />
                            )}
                          </a>
                          <button
                            type="button"
                            title="Copiar enlace"
                            onClick={() => copiarEnlace(fila)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700"
                          >
                            <Link2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Compartir por WhatsApp"
                            onClick={() => compartirWhatsApp(fila)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700"
                          >
                            <MessageCircleMore className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title={fila.respondida
                              ? "Eliminar invitación respondida"
                              : "Eliminar invitación"}
                            aria-expanded={abiertaId === fila.id}
                            aria-controls={`confirmar-borrado-${fila.id}`}
                            onClick={() =>
                              setAbiertaId((actual) =>
                                actual === fila.id ? null : fila.id
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {abiertaId === fila.id && (
                      <tr>
                        <td
                          colSpan={5}
                          className="bg-red-50/40 px-4 py-3"
                          id={`confirmar-borrado-${fila.id}`}
                        >
                          <ConfirmacionBorrado
                            controlado
                            abierto
                            invitacionId={fila.id}
                            titulo={fila.titulo}
                            totalPersonas={fila.totalPersonas}
                            respondida={fila.respondida}
                            confirmadas={fila.confirmadas}
                            onCerrar={() => setAbiertaId(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                </tbody>
              </table>
            )}
          </div>

          {visibles.length > 0 && (
            <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
              Mostrando {visibles.length} de {invitaciones.length} invitaciones
            </div>
          )}
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-eucalipto-700 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4" />
          Enlace copiado al portapapeles
        </div>
      )}
    </div>
  );
}