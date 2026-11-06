"use client";

import { ChevronDown, Download, Info, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  MAX_LONGITUD_BUSQUEDA,
  construirDetalle,
  construirListadoMesas,
  derivarOpcionesMesa,
  esFiltroMesa,
  etiquetaAsiste,
  exportacionHabilitada,
  filtrarDetallePorMesa,
  opcionesMesaConSeleccion,
  ordenarInvitacionesSinResponder,
  resolverFiltroMesaVisible,
  type AsistenciaInvitacion,
  type FiltroAsistencia,
  type FiltroMesa,
  type InvitacionSinResponder,
  type MesaListado,
} from "@/lib/asistencia-resumen";
import { guardarMesaPersonaAction } from "@/lib/acciones-mesas";

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

function InputMesa({
  personaId,
  mesaInicial,
}: {
  personaId: string;
  mesaInicial: number | null;
}) {
  const [valor, setValor] = useState(
    mesaInicial !== null ? String(mesaInicial) : ""
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const guardar = async (nuevoValor: string) => {
    setGuardando(true);
    setError(false);
    try {
      const res = await guardarMesaPersonaAction(personaId, nuevoValor);
      if (!res.ok) {
        setError(true);
      } else {
        // La acción ya revalida /panel; refrescar garantiza props frescas y
        // que la persona salga del filtro activo si ya no lo cumple.
        router.refresh();
      }
    } catch {
      setError(true);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={`mesa-${personaId}`} className="sr-only">
        Número de mesa
      </label>
      <input
        id={`mesa-${personaId}`}
        type="number"
        min="1"
        max="2147483647"
        value={valor}
        placeholder="Mesa"
        onChange={(e) => setValor(e.target.value)}
        onBlur={() => guardar(valor)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        disabled={guardando}
        className={`h-7 w-16 rounded-md border px-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-eucalipto-700 ${
          error ? "border-rose-300 bg-rose-50" : "border-zinc-300 bg-white"
        }`}
      />
      {guardando && <span className="text-[10px] text-zinc-400">…</span>}
    </div>
  );
}

const PESTANAS = [
  { id: "asignar", etiqueta: "Asignar mesas" },
  { id: "listado", etiqueta: "Listado por mesa" },
] as const;

type Pestana = (typeof PESTANAS)[number]["id"];

function pluralizarPersonasCantidad(n: number): string {
  return n === 1 ? "1 persona" : `${n} personas`;
}

function pluralizarGruposCantidad(n: number): string {
  return n === 1 ? "1 familia/grupo" : `${n} familias/grupos`;
}

function pluralizarMesas(n: number): string {
  return n === 1 ? "1 mesa" : `${n} mesas`;
}

function pluralizarAsistentesSinMesa(n: number): string {
  return n === 1 ? "1 asistente sin mesa" : `${n} asistentes sin mesa`;
}

function pluralizarMesasConAsignacion(n: number): string {
  return n === 1 ? "1 mesa con asignaciones" : `${n} mesas con asignaciones`;
}

function pluralizarPersonasAsignadas(n: number): string {
  return n === 1 ? "1 persona asignada" : `${n} personas asignadas`;
}

function EstadoVacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
      <p className="text-sm font-medium text-zinc-700">{titulo}</p>
      <p className="mt-1 text-sm text-zinc-500">{texto}</p>
    </div>
  );
}

function TarjetaMesa({
  mesa,
  esSinMesa = false,
}: {
  mesa: MesaListado;
  esSinMesa?: boolean;
}) {
  const titulo = esSinMesa ? "Sin mesa asignada" : `Mesa ${mesa.mesa}`;
  return (
    <article className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-serif text-base text-eucalipto-800">{titulo}</h3>
        <p className="text-xs text-zinc-500">
          {pluralizarPersonasCantidad(mesa.totalPersonas)} ·{" "}
          {pluralizarGruposCantidad(mesa.totalGrupos)}
        </p>
      </header>
      <ul className="mt-3 space-y-3">
        {mesa.grupos.map((grupo) => (
          <li
            key={grupo.id}
            className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <h4 className="break-words text-sm font-semibold text-zinc-800">
                {grupo.titulo}
              </h4>
              <span className="shrink-0 text-xs text-zinc-500">
                {pluralizarPersonasCantidad(grupo.totalPersonas)}
              </span>
            </div>
            <ul className="mt-1.5 space-y-1">
              {grupo.personas.map((persona) => (
                <li
                  key={persona.id}
                  className="break-words text-sm text-zinc-700"
                >
                  {persona.nombre}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </article>
  );
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
  const [filtroMesa, setFiltroMesa] = useState<FiltroMesa>("todas");
  const [pestana, setPestana] = useState<Pestana>("asignar");
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);
  const refsPestanas = useRef<Record<Pestana, HTMLButtonElement | null>>({
    asignar: null,
    listado: null,
  });

  // En "No asistirán" el filtro de mesa se suspende sin borrar la selección.
  // En "Listado por mesa" el filtro de asistencia se ignora por completo.
  const mesaSuspendida = pestana === "asignar" && filtro === "no-asistiran";
  const filtroMesaEfectivo = resolverFiltroMesaVisible(
    pestana,
    filtro,
    filtroMesa
  );

  const detalle = useMemo(() => {
    const base = construirDetalle(invitacionesRespondidas, filtro, busqueda);
    return filtrarDetallePorMesa(base, filtroMesaEfectivo);
  }, [invitacionesRespondidas, filtro, busqueda, filtroMesaEfectivo]);

  const listado = useMemo(
    () => construirListadoMesas(invitacionesRespondidas, filtroMesa, busqueda),
    [invitacionesRespondidas, filtroMesa, busqueda]
  );

  const opcionesMesa = useMemo(
    () => derivarOpcionesMesa(invitacionesRespondidas),
    [invitacionesRespondidas]
  );
  const opcionesMesaVisibles = useMemo(
    () => opcionesMesaConSeleccion(opcionesMesa, filtroMesa),
    [opcionesMesa, filtroMesa]
  );

  const puedeExportar = exportacionHabilitada(
    filtroMesaEfectivo,
    detalle.totalPersonas
  );

  const sinResponderOrdenadas = useMemo(
    () => ordenarInvitacionesSinResponder(invitacionesSinResponder),
    [invitacionesSinResponder]
  );

  const activarPestana = (id: Pestana, enfocar = false) => {
    setPestana(id);
    if (enfocar) {
      requestAnimationFrame(() => refsPestanas.current[id]?.focus());
    }
  };

  const manejarTeclaPestana = (
    evento: KeyboardEvent<HTMLButtonElement>,
    indice: number
  ) => {
    let destino: number | null = null;
    if (evento.key === "ArrowRight") {
      destino = (indice + 1) % PESTANAS.length;
    } else if (evento.key === "ArrowLeft") {
      destino = (indice - 1 + PESTANAS.length) % PESTANAS.length;
    } else if (evento.key === "Home") {
      destino = 0;
    } else if (evento.key === "End") {
      destino = PESTANAS.length - 1;
    }
    if (destino === null) return;
    evento.preventDefault();
    activarPestana(PESTANAS[destino].id, true);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroMesa("todas");
  };

  const busquedaActiva = busqueda.trim().length > 0;

  const resumenListado = !listado.filtrosActivos
    ? `${pluralizarMesasConAsignacion(
        listado.mesasConAsignacion
      )} · ${pluralizarPersonasAsignadas(
        listado.personasAsignadas
      )} · ${pluralizarAsistentesSinMesa(listado.asistentesSinMesa)}`
    : filtroMesa === "sin-mesa"
      ? `Mostrando ${pluralizarAsistentesSinMesa(
          listado.personasSinMesaVisibles
        )}`
      : [
          `Mostrando ${pluralizarMesas(listado.mesasVisibles)}`,
          pluralizarPersonasCantidad(listado.personasVisibles),
          ...(listado.personasSinMesaVisibles > 0
            ? [`${listado.personasSinMesaVisibles} sin mesa`]
            : []),
        ].join(" · ");

  const exportar = async () => {
    if (!puedeExportar || descargando) return;
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

        <div
          role="tablist"
          aria-label="Vistas de mesas"
          className="mt-4 flex flex-wrap gap-2"
        >
          {PESTANAS.map((opcion, indice) => {
            const activa = pestana === opcion.id;
            return (
              <button
                key={opcion.id}
                ref={(elemento) => {
                  refsPestanas.current[opcion.id] = elemento;
                }}
                type="button"
                role="tab"
                id={`tab-${opcion.id}`}
                aria-selected={activa}
                aria-controls={`panel-${opcion.id}`}
                tabIndex={activa ? 0 : -1}
                onClick={() => activarPestana(opcion.id)}
                onKeyDown={(evento) => manejarTeclaPestana(evento, indice)}
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

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filtrar-mesa"
                className="text-xs font-medium text-zinc-600"
              >
                Mesa
              </label>
              <select
                id="filtrar-mesa"
                value={filtroMesa}
                onChange={(evento) => {
                  const valor = evento.target.value;
                  if (esFiltroMesa(valor)) setFiltroMesa(valor);
                }}
                disabled={mesaSuspendida}
                className="h-10 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm text-zinc-800 focus-visible:border-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700/30 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 sm:w-48"
              >
                <option value="todas">Todas las mesas</option>
                <option value="sin-mesa">Sin mesa asignada</option>
                {opcionesMesaVisibles.map((numero) => (
                  <option key={numero} value={`mesa:${numero}`}>
                    Mesa {numero}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={busqueda.length === 0 && filtroMesa === "todas"}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {mesaSuspendida && (
          <p className="mt-2 text-xs text-zinc-500">
            El filtro de mesa solo aplica a asistentes confirmados.
          </p>
        )}

        <div
          role="tabpanel"
          id="panel-asignar"
          aria-labelledby="tab-asignar"
          tabIndex={0}
          hidden={pestana !== "asignar"}
          className="mt-4"
        >
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

            <button
              type="button"
              onClick={exportar}
              disabled={!puedeExportar || descargando}
              aria-label="Exportar vista a Excel"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              {descargando ? "Generando…" : "Exportar vista a Excel"}
            </button>
          </div>

          {filtroMesaEfectivo !== "todas" && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Para exportar el detalle de asistencia, selecciona Todas las
                mesas.
              </p>
            </div>
          )}

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
              {filtroMesaEfectivo !== "todas"
                ? "Prueba con otro término, cambia la mesa seleccionada o limpia los filtros."
                : "Prueba con otro término o cambia el filtro de asistencia."}
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
                            <div className="flex items-center gap-2 shrink-0">
                              {integrante.asiste === true && (
                                <InputMesa
                                  key={`${integrante.id}-${
                                    integrante.mesa ?? "sin"
                                  }`}
                                  personaId={integrante.id}
                                  mesaInicial={integrante.mesa}
                                />
                              )}
                              <span
                                className={
                                  integrante.asiste === true
                                    ? "text-xs font-medium text-eucalipto-700"
                                    : integrante.asiste === false
                                      ? "text-xs font-medium text-rose-600"
                                      : "text-xs font-medium text-amber-700"
                                }
                              >
                                {etiquetaAsiste(integrante.asiste)}
                              </span>
                            </div>
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
        </div>

        <div
          role="tabpanel"
          id="panel-listado"
          aria-labelledby="tab-listado"
          tabIndex={0}
          hidden={pestana !== "listado"}
          className="mt-4"
        >
          {!listado.hayRespuestas ? (
            <EstadoVacio
              titulo="Aún no hay respuestas"
              texto="Cuando las invitaciones se confirmen, aquí aparecerá el listado por mesa."
            />
          ) : !listado.hayAsistentes ? (
            <EstadoVacio
              titulo="No hay asistentes confirmados"
              texto="Las invitaciones respondidas no tienen personas con asistencia confirmada."
            />
          ) : listado.personasVisibles === 0 ? (
            <EstadoVacio
              titulo={
                filtroMesa === "sin-mesa" && !busquedaActiva
                  ? "No hay asistentes sin mesa"
                  : filtroMesa !== "todas" && !busquedaActiva
                    ? "La mesa seleccionada no tiene asistentes"
                    : "No hay resultados para esta búsqueda o filtro"
              }
              texto={
                filtroMesa === "sin-mesa" && !busquedaActiva
                  ? "Todos los asistentes confirmados tienen mesa asignada."
                  : filtroMesa !== "todas" && !busquedaActiva
                    ? "Puedes elegir otra mesa o limpiar los filtros."
                    : "Prueba con otro término, cambia la mesa seleccionada o limpia los filtros."
              }
            />
          ) : (
            <>
              <p className="text-xs text-zinc-500">{resumenListado}</p>
              <div className="mt-4 space-y-4">
                {listado.mesas.map((mesa) => (
                  <TarjetaMesa key={`mesa-${mesa.mesa}`} mesa={mesa} />
                ))}
                {listado.sinMesa && (
                  <TarjetaMesa mesa={listado.sinMesa} esSinMesa />
                )}
              </div>
            </>
          )}
        </div>
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
