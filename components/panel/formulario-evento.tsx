"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Church,
  Clock,
  Info,
  Loader2,
  MapPin,
  Palette,
  Plus,
  Save,
  Shirt,
  Trash2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { actualizarEvento, type ResultadoEvento } from "@/lib/acciones-evento";
import { PLANTILLAS, PLANTILLA_PREDETERMINADA } from "@/lib/plantillas";

export type MomentoInicial = {
  id?: string;
  hora: string;
  titulo: string;
  icono: string;
};

export type ValoresInicialesEvento = {
  nombreQuinceanera: string;
  nombrePadre: string;
  nombreMadre: string;
  nombrePadrinos: string;
  mensajePadres: string;
  fecha: string;
  fechaLimiteRsvp: string;
  tieneMisa: boolean;
  misaLugar: string;
  misaDireccion: string;
  misaHora: string;
  misaMapaUrl: string;
  recepcionLugar: string;
  recepcionDireccion: string;
  recepcionHora: string;
  recepcionMapaUrl: string;
  codigoVestimenta: string;
  infoAdicional: string;
  plantilla: string;
  momentos: MomentoInicial[];
};

type FilaMomento = {
  clave: string;
  id?: string;
  hora: string;
  titulo: string;
  icono: string;
};

const MENSAJES: Record<
  Extract<ResultadoEvento, { ok: false }>["motivo"],
  string
> = {
  "no-autenticado": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "no-encontrada": "No hay un evento vinculado a tu cuenta.",
  "datos-invalidos":
    "Revisa los campos obligatorios (quinceañera, fecha, recepción y, si la misa está activa, sus datos). El cronograma no admite filas incompletas.",
  "no-autorizado": "No tienes permiso para modificar este evento.",
  fallo: "Ocurrió un error inesperado. Vuelve a intentarlo.",
};

const claseInput =
  "mt-1.5 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-70";
const claseArea =
  "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-70";
const claseEtiqueta = "block";
const claseTitulo = "text-xs font-semibold text-zinc-700";

let sigClave = 0;

function Seccion({
  icono: Icono,
  titulo,
  descripcion,
  children,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3 border-b border-zinc-100 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-eucalipto-100 text-eucalipto-700">
          <Icono className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg text-eucalipto-700">{titulo}</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{descripcion}</p>
        </div>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function FormularioEvento({
  inicial,
}: {
  inicial: ValoresInicialesEvento;
}) {
  const [tieneMisa, setTieneMisa] = useState(inicial.tieneMisa);
  const [filas, setFilas] = useState<FilaMomento[]>(() =>
    inicial.momentos.map((momento) => ({
      clave: `m-${sigClave++}`,
      id: momento.id,
      hora: momento.hora,
      titulo: momento.titulo,
      icono: momento.icono,
    }))
  );

  const [estado, accionForm, pendiente] = useActionState<
    ResultadoEvento | null,
    FormData
  >(actualizarEvento, null);

  const estadoError = estado && !estado.ok ? estado : null;

  const agregarMomento = () => {
    setFilas((actual) => [
      ...actual,
      { clave: `m-${sigClave++}`, hora: "", titulo: "", icono: "" },
    ]);
  };

  const eliminarMomento = (clave: string) => {
    setFilas((actual) => actual.filter((fila) => fila.clave !== clave));
  };

  const cambiarMomento = (
    clave: string,
    campo: "hora" | "titulo" | "icono",
    valor: string
  ) => {
    setFilas((actual) =>
      actual.map((fila) => (fila.clave === clave ? { ...fila, [campo]: valor } : fila))
    );
  };

  const moverMomento = (indice: number, direccion: -1 | 1) => {
    setFilas((actual) => {
      const destino = indice + direccion;
      if (destino < 0 || destino >= actual.length) return actual;
      const copia = [...actual];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  };

  return (
    <form action={accionForm} className="space-y-6">
      <fieldset disabled={pendiente} className="space-y-6">
        <Seccion
          icono={UserRound}
          titulo="1. Información general"
          descripcion="Festejada, padres y padrinos. La quinceañera es obligatoria."
        >
          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Nombre de la quinceañera</span>
            <input
              type="text"
              name="nombreQuinceanera"
              defaultValue={inicial.nombreQuinceanera}
              maxLength={120}
              required
              className={claseInput}
            />
          </label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className={claseEtiqueta}>
              <span className={claseTitulo}>Nombre del padre (opcional)</span>
              <input
                type="text"
                name="nombrePadre"
                defaultValue={inicial.nombrePadre}
                maxLength={120}
                className={claseInput}
              />
            </label>
            <label className={claseEtiqueta}>
              <span className={claseTitulo}>Nombre de la madre (opcional)</span>
              <input
                type="text"
                name="nombreMadre"
                defaultValue={inicial.nombreMadre}
                maxLength={120}
                className={claseInput}
              />
            </label>
          </div>
          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Padrinos de honor (opcional)</span>
            <input
              type="text"
              name="nombrePadrinos"
              defaultValue={inicial.nombrePadrinos}
              maxLength={200}
              placeholder="Ej. Roberto Herrera y Daniela Garza"
              className={claseInput}
            />
          </label>
          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Mensaje de los padres (opcional)</span>
            <textarea
              name="mensajePadres"
              defaultValue={inicial.mensajePadres}
              maxLength={1000}
              rows={3}
              placeholder="Ej. Con la bendición de Dios y la alegría de nuestras familias…"
              className={claseArea}
            />
            <span className="mt-1 block text-[11px] text-zinc-400">
              Si lo dejas vacío se usa el mensaje predeterminado. Se conservan
              los saltos de línea.
            </span>
          </label>
        </Seccion>

        <Seccion
          icono={CalendarDays}
          titulo="2. Fecha y confirmación (RSVP)"
          descripcion="Fecha principal del evento y fecha límite informativa de respuesta."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className={claseEtiqueta}>
              <span className={claseTitulo}>Fecha y hora del evento</span>
              <input
                type="datetime-local"
                name="fecha"
                defaultValue={inicial.fecha}
                required
                className={claseInput}
              />
            </label>
            <label className={claseEtiqueta}>
              <span className={claseTitulo}>Fecha límite de RSVP (opcional)</span>
              <input
                type="date"
                name="fechaLimiteRsvp"
                defaultValue={inicial.fechaLimiteRsvp}
                className={claseInput}
              />
              <span className="mt-1 block text-[11px] text-zinc-400">
                Solo informativa: no cierra ni borra invitaciones automáticamente.
              </span>
            </label>
          </div>
        </Seccion>

        <Seccion
          icono={Church}
          titulo="3. Ceremonia religiosa"
          descripcion="Actívala solo si habrá misa. Si no, los datos se guardan vacíos."
        >
          <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-zinc-800">
              <Church className="h-4 w-4 text-eucalipto-700" />
              Incluir ceremonia religiosa
            </span>
            <input
              type="checkbox"
              name="tieneMisa"
              checked={tieneMisa}
              onChange={(evento) => setTieneMisa(evento.target.checked)}
              className="h-5 w-5 rounded border-zinc-300 text-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
            />
          </label>

          {tieneMisa && (
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className={`${claseEtiqueta} md:col-span-2`}>
                  <span className={claseTitulo}>Templo o parroquia</span>
                  <input
                    type="text"
                    name="misaLugar"
                    defaultValue={inicial.misaLugar}
                    maxLength={200}
                    required
                    className={claseInput}
                  />
                </label>
                <label className={claseEtiqueta}>
                  <span className={claseTitulo}>Hora</span>
                  <input
                    type="text"
                    name="misaHora"
                    defaultValue={inicial.misaHora}
                    maxLength={40}
                    placeholder="18:00 HRS"
                    required
                    className={claseInput}
                  />
                </label>
              </div>
              <label className={claseEtiqueta}>
                <span className={claseTitulo}>Dirección</span>
                <input
                  type="text"
                  name="misaDireccion"
                  defaultValue={inicial.misaDireccion}
                  maxLength={200}
                  required
                  className={claseInput}
                />
              </label>
              <label className={claseEtiqueta}>
                <span className={claseTitulo}>
                  URL de Google Maps (opcional)
                </span>
                <input
                  type="url"
                  name="misaMapaUrl"
                  defaultValue={inicial.misaMapaUrl}
                  maxLength={2048}
                  placeholder="https://maps.app.goo.gl/…"
                  className={claseInput}
                />
                <span className="mt-1 block text-[11px] text-zinc-400">
                  Pega el enlace exacto de “Compartir” de Google Maps. Si lo
                  dejas vacío, se usará una búsqueda por la dirección.
                </span>
              </label>
            </div>
          )}
        </Seccion>

        <Seccion
          icono={MapPin}
          titulo="4. Recepción"
          descripcion="Sede y horario de la fiesta. Los tres campos son obligatorios."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className={`${claseEtiqueta} md:col-span-2`}>
              <span className={claseTitulo}>Salón, quinta o hacienda</span>
              <input
                type="text"
                name="recepcionLugar"
                defaultValue={inicial.recepcionLugar}
                maxLength={200}
                required
                className={claseInput}
              />
            </label>
            <label className={claseEtiqueta}>
              <span className={claseTitulo}>Hora</span>
              <input
                type="text"
                name="recepcionHora"
                defaultValue={inicial.recepcionHora}
                maxLength={40}
                placeholder="20:00 HRS"
                required
                className={claseInput}
              />
            </label>
          </div>
          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Dirección</span>
            <input
              type="text"
              name="recepcionDireccion"
              defaultValue={inicial.recepcionDireccion}
              maxLength={200}
              required
              className={claseInput}
            />
          </label>
          <label className={claseEtiqueta}>
            <span className={claseTitulo}>URL de Google Maps (opcional)</span>
            <input
              type="url"
              name="recepcionMapaUrl"
              defaultValue={inicial.recepcionMapaUrl}
              maxLength={2048}
              placeholder="https://maps.app.goo.gl/…"
              className={claseInput}
            />
            <span className="mt-1 block text-[11px] text-zinc-400">
              Pega el enlace exacto de “Compartir” de Google Maps. Si lo dejas
              vacío, se usará una búsqueda por la dirección.
            </span>
          </label>
        </Seccion>

        <Seccion
          icono={Shirt}
          titulo="5. Protocolo"
          descripcion="Código de vestimenta y notas adicionales para los invitados."
        >
          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Código de vestimenta (opcional)</span>
            <input
              type="text"
              name="codigoVestimenta"
              defaultValue={inicial.codigoVestimenta}
              maxLength={200}
              placeholder="Ej. Formal / Rigurosa etiqueta"
              className={claseInput}
            />
          </label>
          <label className={claseEtiqueta}>
            <span className={claseTitulo}>Información adicional (opcional)</span>
            <textarea
              name="infoAdicional"
              defaultValue={inicial.infoAdicional}
              maxLength={500}
              rows={3}
              placeholder="Ej. No se admiten niños, estacionamiento disponible…"
              className={claseArea}
            />
          </label>
        </Seccion>

        <Seccion
          icono={Clock}
          titulo="6. Cronograma"
          descripcion="Momentos del evento en orden. Usa Subir/Bajar para reordenar."
        >
          {filas.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
              Todavía no hay momentos. Agrega el primero para mostrarlo en la
              invitación.
            </p>
          )}

          <div className="space-y-3">
            {filas.map((fila, indice) => (
              <div
                key={fila.clave}
                className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3"
              >
                <input type="hidden" name="momento_id" value={fila.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className={`${claseEtiqueta} sm:w-28`}>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Hora
                    </span>
                    <input
                      type="text"
                      name="momento_hora"
                      value={fila.hora}
                      onChange={(evento) =>
                        cambiarMomento(fila.clave, "hora", evento.target.value)
                      }
                      maxLength={40}
                      placeholder="18:00 HRS"
                      className={claseInput}
                    />
                  </label>
                  <label className={`${claseEtiqueta} flex-1`}>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Título
                    </span>
                    <input
                      type="text"
                      name="momento_titulo"
                      value={fila.titulo}
                      onChange={(evento) =>
                        cambiarMomento(fila.clave, "titulo", evento.target.value)
                      }
                      maxLength={120}
                      placeholder="Ej. Ceremonia religiosa"
                      className={claseInput}
                    />
                  </label>
                  <label className={`${claseEtiqueta} sm:w-32`}>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Ícono (opc.)
                    </span>
                    <input
                      type="text"
                      name="momento_icono"
                      value={fila.icono}
                      onChange={(evento) =>
                        cambiarMomento(fila.clave, "icono", evento.target.value)
                      }
                      maxLength={40}
                      placeholder="church"
                      className={claseInput}
                    />
                  </label>
                  <div className="flex items-center gap-1 pb-0.5">
                    <button
                      type="button"
                      onClick={() => moverMomento(indice, -1)}
                      disabled={indice === 0}
                      aria-label="Subir momento"
                      title="Subir"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moverMomento(indice, 1)}
                      disabled={indice === filas.length - 1}
                      aria-label="Bajar momento"
                      title="Bajar"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarMomento(fila.clave)}
                      aria-label="Eliminar momento"
                      title="Eliminar"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarMomento}
            className="inline-flex items-center gap-1.5 rounded-full border border-dorado/50 px-3.5 py-2 text-xs font-semibold text-eucalipto-700 hover:bg-dorado/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar momento
          </button>
          <p className="text-[11px] text-zinc-400">
            {filas.length} de 30 momentos · hora y título obligatorios por fila
          </p>
        </Seccion>

        <Seccion
          icono={Palette}
          titulo="7. Plantilla"
          descripcion="Solo Elegante Eucalipto está disponible hoy. Las demás llegan después."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PLANTILLAS.map((opcion) => {
              const activa =
                (inicial.plantilla || PLANTILLA_PREDETERMINADA) === opcion.valor;
              return (
                <label
                  key={opcion.valor}
                  className={`flex flex-col rounded-xl border p-4 transition-colors ${
                    opcion.disponible
                      ? "cursor-pointer border-eucalipto-300 bg-eucalipto-50/50"
                      : "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-70"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span>
                      <span className="block text-sm font-semibold text-zinc-800">
                        {opcion.nombre}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-zinc-500">
                        {opcion.estilo}
                      </span>
                    </span>
                    <input
                      type="radio"
                      name="plantilla"
                      value={opcion.valor}
                      defaultChecked={activa && opcion.disponible}
                      disabled={!opcion.disponible}
                      className="mt-0.5 h-4 w-4 text-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
                    />
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-zinc-500">
                    {opcion.descripcion}
                  </span>
                  <span
                    className={`mt-3 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      opcion.disponible
                        ? "bg-eucalipto-100 text-eucalipto-700"
                        : "bg-zinc-200 text-zinc-500"
                    }`}
                  >
                    {opcion.disponible ? "En uso" : "Próximamente"}
                  </span>
                </label>
              );
            })}
          </div>
        </Seccion>
      </fieldset>

      {estadoError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700"
        >
          {MENSAJES[estadoError.motivo]}
        </p>
      )}

      {estado?.ok && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg bg-eucalipto-100 px-3 py-2 text-sm text-eucalipto-800"
        >
          <Info className="h-4 w-4 shrink-0" />
          Cambios guardados. La invitación pública ya muestra estos datos.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pendiente}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-eucalipto-700 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendiente ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar cambios
        </button>
        <a
          href="/panel"
          className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
        >
          Volver al dashboard
        </a>
      </div>
    </form>
  );
}
