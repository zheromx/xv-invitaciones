"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  MAX_LONGITUD_BUSQUEDA,
  construirListadoMesas,
  derivarOpcionesMesa,
  esFiltroMesa,
  opcionesMesaConSeleccion,
  type AsistenciaInvitacion,
  type FiltroMesa,
  type MesaListado,
} from "@/lib/asistencia-resumen";

export function pluralizarPersonasCantidad(n: number): string {
  return n === 1 ? "1 persona" : `${n} personas`;
}

export function pluralizarGruposCantidad(n: number): string {
  return n === 1 ? "1 familia/grupo" : `${n} familias/grupos`;
}

export function pluralizarMesas(n: number): string {
  return n === 1 ? "1 mesa" : `${n} mesas`;
}

export function pluralizarAsistentesSinMesa(n: number): string {
  return n === 1 ? "1 asistente sin mesa" : `${n} asistentes sin mesa`;
}

export function pluralizarMesasConAsignacion(n: number): string {
  return n === 1 ? "1 mesa con asignaciones" : `${n} mesas con asignaciones`;
}

export function pluralizarPersonasAsignadas(n: number): string {
  return n === 1 ? "1 persona asignada" : `${n} personas asignadas`;
}

export function EstadoVacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
      <p className="text-sm font-medium text-zinc-700">{titulo}</p>
      <p className="mt-1 text-sm text-zinc-500">{texto}</p>
    </div>
  );
}

export function TarjetaMesa({
  mesa,
  esSinMesa = false,
}: {
  mesa: MesaListado;
  esSinMesa?: boolean;
}) {
  const titulo = esSinMesa ? "SIN MESA ASIGNADA" : `MESA ${mesa.mesa}`;
  return (
    <article className="overflow-hidden rounded-xl border border-eucalipto-200 bg-white">
      <header className="border-b border-eucalipto-200 bg-eucalipto-50 px-4 py-3">
        <h3
          className={`break-words font-serif font-bold uppercase tracking-wide text-eucalipto-900 ${
            esSinMesa ? "text-lg" : "text-xl"
          }`}
        >
          {titulo}
        </h3>
        <p className="mt-1 text-xs text-eucalipto-700">
          {pluralizarPersonasCantidad(mesa.totalPersonas)} ·{" "}
          {pluralizarGruposCantidad(mesa.totalGrupos)}
        </p>
      </header>
      <div className="px-4 py-3">
        <ul className="space-y-3">
          {mesa.grupos.map((grupo) => (
            <li
              key={grupo.id}
              className="border-t border-eucalipto-100 pt-3 first:border-t-0 first:pt-0"
            >
              <h4 className="break-words text-sm font-semibold text-zinc-800">
                {grupo.titulo} —{" "}
                {pluralizarPersonasCantidad(grupo.totalPersonas)}
              </h4>
              <ul className="mt-1.5 space-y-1 pl-3">
                {grupo.personas.map((persona) => (
                  <li
                    key={persona.id}
                    className="min-w-0 break-words text-sm text-zinc-700"
                  >
                    {persona.nombre}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function VistaConsultaMesasHostess({
  invitacionesRespondidas,
  eventoNombre,
  hayRespuestas,
}: {
  invitacionesRespondidas: AsistenciaInvitacion[];
  eventoNombre: string | null;
  hayRespuestas: boolean;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroMesa, setFiltroMesa] = useState<FiltroMesa>("todas");

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

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroMesa("todas");
  };

  const busquedaActiva = busqueda.trim().length > 0;
  const nombreEvento = eventoNombre?.trim() ?? "";
  const tituloEvento = nombreEvento ? `XV de ${nombreEvento}` : "Listado de mesas";

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

  return (
    <main className="min-h-screen bg-marfil-claro px-4 py-8 text-zinc-800">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="border-b border-zinc-200 pb-4 text-center">
          <h1 className="font-serif text-2xl font-bold text-eucalipto-900">
            {tituloEvento}
          </h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-wide text-eucalipto-700">
            Consulta de mesas
          </p>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="buscar-hostess" className="sr-only">
              Buscar persona o invitación
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="buscar-hostess"
              type="search"
              value={busqueda}
              maxLength={MAX_LONGITUD_BUSQUEDA}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar persona o invitación"
              className="h-10 w-full rounded-full border border-zinc-300 bg-white pl-9 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:border-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700/30"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filtrar-mesa-hostess"
                className="text-xs font-medium text-zinc-600"
              >
                Mesa
              </label>
              <select
                id="filtrar-mesa-hostess"
                value={filtroMesa}
                onChange={(e) => {
                  const val = e.target.value;
                  if (esFiltroMesa(val)) setFiltroMesa(val);
                }}
                className="h-10 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm text-zinc-800 focus-visible:border-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700/30 sm:w-48"
              >
                <option value="todas">Todas las mesas</option>
                <option value="sin-mesa">Sin mesa asignada</option>
                {opcionesMesaVisibles.map((num) => (
                  <option key={num} value={`mesa:${num}`}>
                    Mesa {num}
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

        {listado.personasVisibles > 0 && (
          <p className="text-xs text-zinc-500">{resumenListado}</p>
        )}

        {!hayRespuestas ? (
          <EstadoVacio
            titulo="Aún no hay respuestas"
            texto="Cuando las invitaciones comiencen a confirmarse, aquí aparecerá el listado por mesa."
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
          <div className="space-y-4">
            {listado.mesas.map((mesa) => (
              <TarjetaMesa key={`hostess-mesa-${mesa.mesa}`} mesa={mesa} />
            ))}
            {listado.sinMesa && (
              <TarjetaMesa mesa={listado.sinMesa} esSinMesa />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
