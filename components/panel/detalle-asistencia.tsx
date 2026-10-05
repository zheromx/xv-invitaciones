"use client";

import { ChevronDown, Download, Info, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  MAX_LONGITUD_BUSQUEDA,
  construirDetalle,
  etiquetaAsiste,
  ordenarInvitacionesSinResponder,
  type AsistenciaInvitacion,
  type FiltroAsistencia,
  type InvitacionSinResponder,
} from "@/lib/asistencia-resumen";

type OpcionFiltro = {
  valor: FiltroAsistencia;
  etiqueta: string;
};

const OPCIONES_FILTRO: OpcionFiltro[] = [
  { valor: "todas", etiqueta: "Todas las respuestas" },
  { valor: "asistiran", etiqueta: "Asistirán" },
  { valor: "no-asistiran", etiqueta: "No asistirán" },
];

function pluralizarGrupos(n: number): string {
  return n === 1 ? "1 grupo" : `${n} grupos`;
}

function pluralizarPersonas(n: number): string {
  return n === 1 ? "1 persona visible" : `${n} personas visibles`;
}

function mensajeError(codigo: string): string {
  switch (codigo) {
    case "sin-datos":
      return "No hay personas visibles con el filtro o la búsqueda actual.";
    case "filtro-invalido":
    case "busqueda-invalida":
      return "El filtro o la búsqueda no son válidos.";
    case "no-autorizado":
      return "Tu sesión expiró. Vuelve a iniciar sesión.";
    case "sin-evento":
      return "No hay un evento vinculado.";
    default:
      return "No se pudo generar el archivo.";
  }
}

function nombreDesdeCabecera(cabecera: string | null): string | null {
  if (!cabecera) return null;
  const coincidencia = /filename="([^"]+)"/.exec(cabecera);
  return coincidencia?.[1] ?? null;
}

export function DetalleAsistencia({
  invitacionesRespondidas,
  invitacionesSinResponder,
}: {
  invitacionesRespondidas: AsistenciaInvitacion[];
  invitacionesSinResponder: InvitacionSinResponder[];
}) {
  const [filtro, setFiltro] = useState<FiltroAsistencia>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  const detalle = useMemo(
    () => construirDetalle(invitacionesRespondidas, filtro, busqueda),
    [invitacionesRespondidas, filtro, busqueda]
  );

  const sinResponderOrdenadas = useMemo(
    () => ordenarInvitacionesSinResponder(invitacionesSinResponder),
    [invitacionesSinResponder]
  );

  const exportar = async () => {
    if (detalle.totalPersonas === 0 || descargando) return;
    setDescargando(true);
    setErrorDescarga(null);
    try {
      const params = new URLSearchParams();
      params.set("filtro", filtro);
      params.set("busqueda", busqueda);
      const respuesta = await fetch(
        `/api/panel/asistencia/exportar?${params.toString()}`,
        { method: "GET", cache: "no-store" }
      );

      const tipo = respuesta.headers.get("Content-Type") ?? "";
      if (!respuesta.ok) {
        let mensaje = "No se pudo generar el archivo.";
        if (tipo.includes("application/json")) {
          const cuerpo = (await respuesta.json().catch(() => null)) as
            | { error?: unknown }
            | null;
          if (cuerpo && typeof cuerpo.error === "string") {
            mensaje = mensajeError(cuerpo.error);
          }
        }
        setErrorDescarga(mensaje);
        return;
      }

      if (!tipo.includes("spreadsheetml.sheet")) {
        setErrorDescarga("La respuesta del servidor no es un archivo Excel.");
        return;
      }

      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download =
        nombreDesdeCabecera(respuesta.headers.get("Content-Disposition")) ??
        "asistencia.xlsx";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrorDescarga("No se pudo descargar el archivo. Intenta de nuevo.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-serif text-lg text-eucalipto-700">
            Detalle de asistencia
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Asistencia confirmada, agrupada por invitación.
          </p>
        </div>

        {detalle.hayInconsistencias && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <p>
              Hay respuestas con datos de asistencia incompletos. No se
              muestran como negativas ni se modifican.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div
            role="group"
            aria-label="Filtrar respuestas de asistencia"
            className="flex flex-wrap gap-2"
          >
            {OPCIONES_FILTRO.map((opcion) => {
              const activa = filtro === opcion.valor;
              return (
                <button
                  key={opcion.valor}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => setFiltro(opcion.valor)}
                  className={
                    activa
                      ? "inline-flex h-9 items-center justify-center rounded-full bg-eucalipto-700 px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
                      : "inline-flex h-9 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
                  }
                >
                  {opcion.etiqueta}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <label htmlFor="buscar-asistencia" className="sr-only">
                Buscar persona o invitación
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="buscar-asistencia"
                type="search"
                value={busqueda}
                maxLength={MAX_LONGITUD_BUSQUEDA}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar persona o invitación"
                className="h-10 w-full rounded-full border border-zinc-300 bg-white pl-9 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:border-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700/30"
              />
            </div>
            <button
              type="button"
              onClick={exportar}
              disabled={detalle.totalPersonas === 0 || descargando}
              aria-label="Exportar vista a Excel"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              {descargando ? "Generando…" : "Exportar vista a Excel"}
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          El archivo refleja los datos al momento de exportar; si hubo otra
          confirmación desde que abrió el dashboard, puede diferir de la
          pantalla.
        </p>

        {errorDescarga && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorDescarga}</p>
          </div>
        )}

        {detalle.hayRespuestas && detalle.totalGrupos > 0 && (
          <p className="mt-3 text-xs text-zinc-500">
            {pluralizarGrupos(detalle.totalGrupos)} ·{" "}
            {pluralizarPersonas(detalle.totalPersonas)}
          </p>
        )}

        {!detalle.hayRespuestas ? (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
            <p className="text-sm font-medium text-zinc-700">
              Aún no hay respuestas
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Cuando las invitaciones se confirmen, aquí aparecerá el detalle
              por grupo.
            </p>
          </div>
        ) : detalle.totalGrupos === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
            <p className="text-sm font-medium text-zinc-700">
              No hay resultados para esta búsqueda o filtro
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Prueba con otro término o cambia el filtro de asistencia.
            </p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-200">
            {detalle.grupos.map((grupo) => (
              <li key={grupo.id} className="py-4">
                <div className="grid gap-3 md:grid-cols-2 md:gap-6">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold text-zinc-800">
                      {grupo.titulo}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {grupo.resumenTexto}
                    </p>
                    {grupo.tieneInconsistencia && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                          Hay respuestas con datos de asistencia incompletos
                          en este grupo.
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="min-w-0">
                    {grupo.integrantes.length > 0 ? (
                      <ul className="space-y-1.5">
                        {grupo.integrantes.map((integrante) => (
                          <li
                            key={integrante.id}
                            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
                          >
                            <span className="min-w-0 break-words text-sm text-zinc-700">
                              {integrante.nombre}
                            </span>
                            <span
                              className={
                                integrante.asiste === true
                                  ? "shrink-0 text-xs font-medium text-eucalipto-700"
                                  : integrante.asiste === false
                                    ? "shrink-0 text-xs font-medium text-rose-600"
                                    : "shrink-0 text-xs font-medium text-amber-700"
                              }
                            >
                              {etiquetaAsiste(integrante.asiste)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-zinc-400">
                        Sin respuestas individuales registradas en este grupo.
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-zinc-800 [&::-webkit-details-marker]:hidden">
            <span>
              Invitaciones sin responder ({sinResponderOrdenadas.length})
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 group-open:rotate-180" />
          </summary>
          <ul className="mt-3 space-y-2">
            {sinResponderOrdenadas.map((invitacion) => (
              <li
                key={invitacion.id}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-zinc-100 pb-2 last:border-b-0 last:pb-0"
              >
                <span className="min-w-0 break-words text-sm text-zinc-700">
                  {invitacion.titulo}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {invitacion.totalPersonas === 1
                    ? "1 persona"
                    : `${invitacion.totalPersonas} personas`}
                </span>
              </li>
            ))}
            {sinResponderOrdenadas.length === 0 && (
              <li className="text-sm text-zinc-500">
                No hay invitaciones sin responder.
              </li>
            )}
          </ul>
        </details>
      </section>
    </div>
  );
}
