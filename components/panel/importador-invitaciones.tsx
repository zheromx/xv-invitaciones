"use client";

import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { useRef, useState } from "react";
import type { ErrorFila } from "@/lib/importacion-invitaciones";

type Resumen = { grupos: number; personas: number };
type GrupoPreview = { titulo: string; telefono: string; personas: string[] };
type Conflicto = { titulo: string; telefono: string };
type Advertencia = { titulo: string };
type Analisis = {
  resumen: Resumen;
  grupos: GrupoPreview[];
  bloqueantes: Conflicto[];
  advertencias: Advertencia[];
};

const MENSAJES: Record<string, string> = {
  "no-autorizado": "Tu sesión expiró. Vuelve a iniciar sesión.",
  extension: "Solo se admiten archivos con extensión .xlsx.",
  firma: "El archivo no es un .xlsx válido.",
  estructura: "El archivo no tiene una hoja de cálculo válida.",
  tamano: "El archivo supera el límite de 2 MB.",
  cuerpo: "El archivo es demasiado grande para procesarlo.",
  filas: "El archivo supera el límite de 1000 filas de datos.",
  archivo: "No se recibió ningún archivo.",
  operacion: "Operación no reconocida.",
  fallo: "Ocurrió un error inesperado al importar.",
};

export function ImportadorInvitaciones({ hayEvento }: { hayEvento: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [errores, setErrores] = useState<ErrorFila[]>([]);
  const [conflictos, setConflictos] = useState<Conflicto[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState("");
  const [creadas, setCreadas] = useState<number | null>(null);

  const limpiar = () => {
    setAnalisis(null);
    setErrores([]);
    setConflictos([]);
    setMensaje(null);
    setConfirmacion("");
  };

  const elegirArchivo = (file: File | null) => {
    setArchivo(file);
    setCreadas(null);
    limpiar();
  };

  const enviar = async (operacion: "analizar" | "confirmar") => {
    if (!archivo) {
      setMensaje("Selecciona primero un archivo .xlsx.");
      return;
    }
    setCargando(true);
    setMensaje(null);
    try {
      const datos = new FormData();
      datos.set("operacion", operacion);
      datos.set("archivo", archivo);
      const respuesta = await fetch("/api/panel/invitaciones/importar", {
        method: "POST",
        body: datos,
      });
      const cuerpo = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        setAnalisis(null);
        setErrores([]);
        setConflictos([]);
        if (cuerpo.error === "validacion") {
          setErrores((cuerpo.errores as ErrorFila[]) ?? []);
        } else if (cuerpo.error === "duplicados") {
          setConflictos((cuerpo.conflictos as Conflicto[]) ?? []);
          setMensaje(
            "El archivo coincide con invitaciones ya existentes. No se creó ninguna invitación."
          );
        } else {
          setMensaje(MENSAJES[cuerpo.error as string] ?? MENSAJES.fallo);
        }
        return;
      }

      if (operacion === "analizar") {
        setErrores([]);
        setConflictos([]);
        setAnalisis(cuerpo as Analisis);
      } else {
        setCreadas((cuerpo.creadas as number) ?? 0);
        setAnalisis(null);
      }
    } catch {
      setMensaje("No se pudo procesar el archivo.");
    } finally {
      setCargando(false);
    }
  };

  if (!hayEvento) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="font-serif text-lg text-eucalipto-700">Aún no hay evento vinculado</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
          La importación se habilita cuando existe un evento vinculado a tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-eucalipto-700">Importar invitaciones</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Sube un archivo .xlsx con una persona por fila. Solo se crean invitaciones nuevas: no
          se actualiza, fusiona ni sobrescribe nada existente.
        </p>
      </div>

      {creadas !== null ? (
        <div className="rounded-2xl border border-eucalipto-200 bg-eucalipto-50 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-eucalipto-700" />
            <div>
              <p className="font-serif text-lg text-eucalipto-800">
                {creadas} {creadas === 1 ? "invitación creada" : "invitaciones creadas"}
              </p>
              <p className="mt-1 text-sm text-eucalipto-700">
                Cada grupo quedó con su enlace propio y listo para compartir.
              </p>
              <a
                href="/panel/invitaciones"
                className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-eucalipto-700 px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
              >
                Volver a invitaciones
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
              <FileSpreadsheet className="h-4 w-4 text-eucalipto-700" />
              1. Plantilla y archivo
            </h2>

            <details className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              <summary className="cursor-pointer font-medium text-zinc-700">
                Cómo llenar el archivo
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                <li>Usa una sola hoja con los encabezados exactos en la fila 1: Telefono, Familia/Grupo, Nombre Persona.</li>
                <li>Cada fila representa a una persona. Puedes repetir el teléfono y el grupo en varias filas.</li>
                <li>Teléfono: 10 dígitos o 52 + 10 dígitos. Sin letras ni extensiones. No uses el formato 521 (quita el 1 posterior al 52).</li>
                <li>Máximo 25 personas por grupo, 1000 filas de datos y 2 MB de archivo.</li>
                <li>No uses fórmulas: pega solo valores.</li>
              </ul>
            </details>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="/api/panel/invitaciones/importar"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-dorado/50 px-4 text-sm font-semibold text-eucalipto-700 hover:bg-dorado/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
              >
                <Download className="h-4 w-4" />
                Descargar plantilla .xlsx
              </a>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                onChange={(e) => elegirArchivo(e.target.files?.[0] ?? null)}
                className="block w-full max-w-xs text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-eucalipto-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-eucalipto-800"
              />
            </div>
          </section>

          {archivo && !analisis && (
            <button
              type="button"
              onClick={() => enviar("analizar")}
              disabled={cargando}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-eucalipto-700 px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Analizar archivo (sin guardar)
            </button>
          )}

          {mensaje && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {mensaje}
            </p>
          )}

          {errores.length > 0 && (
            <section className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red-800">
                <TriangleAlert className="h-4 w-4" />
                {errores.length} {errores.length === 1 ? "error" : "errores"} por corregir
              </h2>
              <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-xs text-red-700">
                {errores.map((error, i) => (
                  <li key={`${error.fila}-${error.columna}-${i}`}>
                    <span className="font-semibold">Fila {error.fila}</span> · {error.columna}:{" "}
                    {error.mensaje}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {conflictos.length > 0 && (
            <section className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red-800">
                <TriangleAlert className="h-4 w-4" />
                Invitaciones ya existentes
              </h2>
              <ul className="mt-3 space-y-1 text-xs text-red-700">
                {conflictos.map((c, i) => (
                  <li key={`${c.telefono}-${i}`}>
                    {c.titulo} · +52 {c.telefono.slice(-10)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {analisis && (
            <>
              <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-zinc-800">2. Previsualización</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {analisis.resumen.grupos}{" "}
                  {analisis.resumen.grupos === 1 ? "grupo" : "grupos"} ·{" "}
                  {analisis.resumen.personas}{" "}
                  {analisis.resumen.personas === 1 ? "persona" : "personas"}
                </p>

                {analisis.advertencias.length > 0 && (
                  <ul className="mt-3 space-y-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {analisis.advertencias.map((a, i) => (
                      <li key={`${a.titulo}-${i}`}>
                        Ya existe «{a.titulo}» sin teléfono de contacto; se creará una invitación
                        aparte.
                      </li>
                    ))}
                  </ul>
                )}

                {analisis.bloqueantes.length > 0 ? (
                  <div className="mt-3 space-y-1 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {analisis.bloqueantes.map((c, i) => (
                      <p key={`${c.telefono}-${i}`}>
                        Ya existe «{c.titulo}» con el mismo teléfono. Corrige el archivo para
                        continuar.
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-zinc-500">
                        <tr className="border-b border-zinc-200">
                          <th className="py-2 pr-3 font-semibold">Grupo</th>
                          <th className="py-2 pr-3 font-semibold">Teléfono</th>
                          <th className="py-2 font-semibold">Personas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {analisis.grupos.map((grupo, i) => (
                          <tr key={`${grupo.telefono}-${i}`}>
                            <td className="py-2 pr-3 text-zinc-800">{grupo.titulo}</td>
                            <td className="whitespace-nowrap py-2 pr-3 text-zinc-600">
                              +52 {grupo.telefono.slice(-10)}
                            </td>
                            <td className="py-2 text-zinc-600">{grupo.personas.join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {analisis.resumen.grupos > analisis.grupos.length && (
                      <p className="mt-2 text-[11px] text-zinc-400">
                        Mostrando {analisis.grupos.length} de {analisis.resumen.grupos} grupos.
                      </p>
                    )}
                  </div>
                )}
              </section>

              {analisis.bloqueantes.length === 0 && (
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-zinc-800">3. Confirmar</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    Se crearán {analisis.resumen.grupos}{" "}
                    {analisis.resumen.grupos === 1 ? "invitación nueva" : "invitaciones nuevas"}.
                    No se modifica ni se elimina ninguna invitación existente.
                  </p>
                  <label className="mt-3 block">
                    <span className="text-xs font-semibold text-zinc-700">
                      Escribe IMPORTAR para confirmar
                    </span>
                    <input
                      type="text"
                      value={confirmacion}
                      onChange={(e) => setConfirmacion(e.target.value)}
                      placeholder="IMPORTAR"
                      className="mt-1.5 h-10 w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => enviar("confirmar")}
                    disabled={cargando || confirmacion.trim() !== "IMPORTAR"}
                    className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-eucalipto-700 px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Importar {analisis.resumen.grupos}{" "}
                    {analisis.resumen.grupos === 1 ? "invitación" : "invitaciones"}
                  </button>
                </section>
              )}
            </>
          )}
        </>
      )}

      <a
        href="/panel/invitaciones"
        className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
      >
        Volver
      </a>
    </div>
  );
}
