"use client";

import { Loader2, Lock, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import {
  crearInvitacion,
  editarInvitacion,
  type ResultadoInvitacion,
} from "@/lib/acciones-invitaciones";
import { ConfirmacionBorrado } from "@/components/panel/confirmacion-borrado";

export type PersonaInicial = { id?: string; nombre: string };

type Fila = { clave: string; id?: string; nombre: string };

const MENSAJES: Record<
  Extract<ResultadoInvitacion, { ok: false }>["motivo"],
  string
> = {
  "no-event": "No hay un evento vinculado a tu cuenta.",
  "no-autorizado": "No tienes permiso para modificar esta invitación.",
  "ya-respondida": "Esta invitación ya fue confirmada y está en solo lectura.",
  "datos-invalidos":
    "Revisa el título y la lista de personas (mínimo 1, máximo 25; sin nombres repetidos).",
  "no-encontrada": "La invitación ya no existe.",
  fallo: "Ocurrió un error inesperado. Vuelve a intentarlo.",
};

let sigClave = 0;

export function FormularioInvitacion({
  modo,
  invitacionId,
  tituloInicial,
  personasIniciales,
  confirmadasIniciales,
}: {
  modo: "crear" | "editar" | "solo-lectura";
  invitacionId?: string;
  tituloInicial?: string;
  personasIniciales?: PersonaInicial[];
  confirmadasIniciales?: number;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(tituloInicial ?? "");
  const [filas, setFilas] = useState<Fila[]>(() => {
    const iniciales: PersonaInicial[] =
      personasIniciales && personasIniciales.length > 0
        ? personasIniciales
        : [{ nombre: "" }];
    return iniciales.map((p) => ({
      clave: `p-${sigClave++}`,
      id: p.id,
      nombre: p.nombre,
    }));
  });
  const [eliminadas, setEliminadas] = useState<string[]>([]);
  const bloqueado = modo === "solo-lectura";

  const accion =
    modo === "editar" && invitacionId
      ? editarInvitacion.bind(null, invitacionId)
      : crearInvitacion;
  const [estado, accionForm, pendiente] = useActionState<
    ResultadoInvitacion | null,
    FormData
  >(accion, null);

  const agregarPersona = () => {
    if (bloqueado) return;
    setFilas((actual) => [...actual, { clave: `p-${sigClave++}`, nombre: "" }]);
  };

  const quitarPersona = (clave: string) => {
    if (bloqueado) return;
    setFilas((actual) => {
      const fila = actual.find((f) => f.clave === clave);
      if (fila?.id) {
        setEliminadas((actualIds) => [...actualIds, fila.id!]);
      }
      return actual.filter((f) => f.clave !== clave);
    });
  };

  const cambiarNombre = (clave: string, nombre: string) => {
    setFilas((actual) =>
      actual.map((f) => (f.clave === clave ? { ...f, nombre } : f))
    );
  };

  const estadoError =
    estado && "ok" in estado && !estado.ok ? estado : null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl text-eucalipto-700">
          {modo === "crear" ? "Nueva invitación" : "Editar invitación"}
        </h1>
        <p className="text-sm text-zinc-500">
          {modo === "crear"
            ? "Configura el pase familiar o grupal y define a las personas del RSVP."
            : "El enlace público no cambia al editar; solo se ajustan el título y las personas."}
        </p>
      </div>

      {modo === "solo-lectura" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-dorado/30 bg-dorado/10 px-4 py-3 text-sm text-eucalipto-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-eucalipto-700" />
          <p>
            Esta invitación ya fue confirmada desde la vista pública. Queda en
            <strong> solo lectura permanente</strong> y no se puede editar. La
            única corrección administrativa es eliminar la invitación; si se
            necesita reemplazarla, se crea una nueva con su propio enlace.
          </p>
        </div>
      )}

      <form action={accionForm} className="mt-6 space-y-5">
        <fieldset disabled={bloqueado || pendiente} className="space-y-5">
          <label className="block">
            <span className="text-xs font-semibold text-zinc-700">
              Título de la invitación o grupo
            </span>
            <input
              type="text"
              name="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Familia Rodríguez"
              maxLength={120}
              required
              className="mt-1.5 h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-70"
            />
            <span className="mt-1 block text-[11px] text-zinc-400">
              Se muestra en el panel y en el saludo de la invitación pública.
            </span>
          </label>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-zinc-700">
              Personas invitadas
            </legend>
            <p className="text-[11px] text-zinc-400">
              Cada nombre se convierte en una casilla seleccionable en el RSVP.
            </p>

            {filas.map((fila, i) => (
              <div key={fila.clave} className="flex items-center gap-2">
                <input
                  type="hidden"
                  name="persona_id"
                  value={fila.id ?? ""}
                />
                <input
                  type="text"
                  name="persona"
                  value={fila.nombre}
                  onChange={(e) => cambiarNombre(fila.clave, e.target.value)}
                  placeholder={`Persona ${i + 1} — nombre completo`}
                  maxLength={120}
                  required
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-70"
                />
                <button
                  type="button"
                  onClick={() => quitarPersona(fila.clave)}
                  disabled={filas.length === 1 || bloqueado || pendiente}
                  title="Eliminar persona"
                  aria-label="Eliminar persona"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {eliminadas.map((id) => (
              <input key={id} type="hidden" name="persona_eliminada" value={id} />
            ))}

            <button
              type="button"
              onClick={agregarPersona}
              disabled={bloqueado || pendiente}
              className={`inline-flex items-center gap-1.5 rounded-full border border-dorado/50 px-3.5 py-2 text-xs font-semibold text-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:opacity-50 ${
                bloqueado ? "hidden" : "hover:bg-dorado/10"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar persona
            </button>
            <p className="text-[11px] text-zinc-400">
              {filas.length} {filas.length === 1 ? "persona" : "personas"} · mínimo 1 requerida
            </p>
          </fieldset>
        </fieldset>

        {estadoError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-left text-xs leading-5 text-red-700"
          >
            {MENSAJES[estadoError.motivo]}
          </p>
        )}

        <div className="flex items-center gap-3">
          {!bloqueado && (
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
              {modo === "crear" ? "Guardar invitación" : "Guardar cambios"}
            </button>
          )}
          <a
            href="/panel/invitaciones"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
          >
            Volver
          </a>
        </div>
      </form>

      {modo === "solo-lectura" && invitacionId && (
        <div className="mt-8 border-t border-zinc-200 pt-6">
          <h2 className="font-serif text-lg text-red-800">Zona de eliminación</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Solo para correcciones administrativas. La invitación respondida no
            puede editarse; borrarla elimina también su RSVP y el enlace dejará
            de funcionar.
          </p>
          <div className="mt-3">
            <ConfirmacionBorrado
              invitacionId={invitacionId}
              titulo={tituloInicial ?? ""}
              totalPersonas={personasIniciales?.length ?? 0}
              respondida
              confirmadas={confirmadasIniciales}
              onEliminada={() => router.push("/panel/invitaciones")}
            />
          </div>
        </div>
      )}
    </div>
  );
}