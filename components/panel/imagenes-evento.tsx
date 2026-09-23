"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  agregarFotoGaleria,
  eliminarFotoGaleria,
  eliminarFotoPrincipal,
  eliminarFotoSede,
  guardarFotoPrincipal,
  guardarFotoSede,
  moverFotoGaleria,
  type ResultadoImagen,
} from "@/lib/acciones-imagenes";
import {
  MAX_FOTOS_GALERIA,
  MAX_TAMANO_IMAGEN_BYTES,
  tipoImagenPermitido,
} from "@/lib/imagenes-evento";
import { useUploadThing } from "@/lib/uploadthing";

type FotoGaleriaVista = { id: string; url: string; orden: number };

const MENSAJES: Record<
  Extract<ResultadoImagen, { ok: false }>["motivo"],
  string
> = {
  "no-autenticado": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "no-encontrada": "No hay un evento vinculado a tu cuenta.",
  "datos-invalidos": "La imagen no es válida. Usa JPG, PNG o WebP de hasta 4 MB.",
  "limite-galeria": `La galería ya tiene el máximo de ${MAX_FOTOS_GALERIA} fotos.`,
  "no-autorizado": "No tienes permiso para modificar esta imagen.",
  fallo: "Ocurrió un error inesperado. Vuelve a intentarlo.",
};

const ACEPTA = "image/jpeg,image/png,image/webp";

export function BloqueImagenes({
  principalUrl,
  misaFotoUrl,
  recepcionFotoUrl,
  tieneMisa,
  galeria,
}: {
  principalUrl: string | null;
  misaFotoUrl: string | null;
  recepcionFotoUrl: string | null;
  tieneMisa: boolean;
  galeria: FotoGaleriaVista[];
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const principalRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);
  const misaFotoRef = useRef<HTMLInputElement>(null);
  const recepcionFotoRef = useRef<HTMLInputElement>(null);

  const ejecutarAccion = (
    accion: () => Promise<ResultadoImagen>,
    exito: string
  ) => {
    setError(null);
    setMensaje(null);
    startTransition(async () => {
      const resultado = await accion();
      if (resultado.ok) {
        setMensaje(exito);
        router.refresh();
      } else {
        setError(MENSAJES[resultado.motivo]);
      }
    });
  };

  const { startUpload: subirPrincipal, isUploading: subiendoPrincipal } =
    useUploadThing("fotoPrincipal", {
      onClientUploadComplete: (res) => {
        const url = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
        if (!url) {
          setError("La subida no devolvió una URL válida.");
          return;
        }
        ejecutarAccion(() => guardarFotoPrincipal(url), "Foto principal guardada.");
      },
      onUploadError: (e) => {
        setError(e?.message || "No se pudo subir la imagen.");
      },
    });

  const { startUpload: subirGaleria, isUploading: subiendoGaleria } =
    useUploadThing("fotoGaleria", {
      onClientUploadComplete: (res) => {
        const url = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
        if (!url) {
          setError("La subida no devolvió una URL válida.");
          return;
        }
        ejecutarAccion(() => agregarFotoGaleria(url), "Foto agregada a la galería.");
      },
      onUploadError: (e) => {
        setError(e?.message || "No se pudo subir la imagen.");
      },
    });

  const { startUpload: subirSedeMisa, isUploading: subiendoMisa } =
    useUploadThing("fotoSede", {
      onClientUploadComplete: (res) => {
        const url = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
        if (!url) {
          setError("La subida no devolvió una URL válida.");
          return;
        }
        ejecutarAccion(
          () => guardarFotoSede("misa", url),
          "Foto de la ceremonia guardada."
        );
      },
      onUploadError: (e) => {
        setError(e?.message || "No se pudo subir la imagen.");
      },
    });

  const { startUpload: subirSedeRecepcion, isUploading: subiendoRecepcion } =
    useUploadThing("fotoSede", {
      onClientUploadComplete: (res) => {
        const url = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
        if (!url) {
          setError("La subida no devolvió una URL válida.");
          return;
        }
        ejecutarAccion(
          () => guardarFotoSede("recepcion", url),
          "Foto de la recepción guardada."
        );
      },
      onUploadError: (e) => {
        setError(e?.message || "No se pudo subir la imagen.");
      },
    });

  const subiendo =
    subiendoPrincipal || subiendoGaleria || subiendoMisa || subiendoRecepcion;
  const ocupado = pendiente || subiendo;
  const sinCupo = galeria.length >= MAX_FOTOS_GALERIA;

  const validarArchivo = (file: File): boolean => {
    setError(null);
    setMensaje(null);
    if (!tipoImagenPermitido(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG o WebP.");
      return false;
    }
    if (file.size > MAX_TAMANO_IMAGEN_BYTES) {
      setError("La imagen supera el máximo de 4 MB.");
      return false;
    }
    return true;
  };

  const alElegirPrincipal = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const file = evento.target.files?.[0];
    evento.target.value = "";
    if (!file || !validarArchivo(file)) return;
    void subirPrincipal([file]);
  };

  const alElegirGaleria = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const file = evento.target.files?.[0];
    evento.target.value = "";
    if (!file) return;
    if (sinCupo) {
      setError(MENSAJES["limite-galeria"]);
      return;
    }
    if (!validarArchivo(file)) return;
    void subirGaleria([file]);
  };

  const claseSecundario =
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const claseIcono =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-zinc-600 shadow-sm hover:bg-white hover:text-eucalipto-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 disabled:cursor-not-allowed disabled:opacity-40";

  const alElegirSede = (
    evento: React.ChangeEvent<HTMLInputElement>,
    subir: (files: File[]) => void
  ) => {
    const file = evento.target.files?.[0];
    evento.target.value = "";
    if (!file || !validarArchivo(file)) return;
    void subir([file]);
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3 border-b border-zinc-100 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-eucalipto-100 text-eucalipto-700">
          <ImagePlus className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg text-eucalipto-700">
            8. Imágenes
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Foto principal y galería (máximo {MAX_FOTOS_GALERIA} fotos). JPG, PNG
            o WebP de hasta 4 MB.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-6">
        {/* Foto principal */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-800">Foto principal</h3>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-eucalipto-50">
              {principalUrl ? (
                <Image
                  src={principalUrl}
                  alt="Foto principal actual"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[11px] text-zinc-400">
                  Sin foto
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={principalRef}
                type="file"
                accept={ACEPTA}
                onChange={alElegirPrincipal}
                className="sr-only"
                aria-label="Subir foto principal"
              />
              <button
                type="button"
                onClick={() => principalRef.current?.click()}
                disabled={ocupado}
                className={claseSecundario}
              >
                {subiendoPrincipal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {principalUrl ? "Reemplazar" : "Subir foto"}
              </button>
              {principalUrl && (
                <button
                  type="button"
                  onClick={() =>
                    ejecutarAccion(
                      () => eliminarFotoPrincipal(),
                      "Foto principal eliminada."
                    )
                  }
                  disabled={ocupado}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>

        {tieneMisa && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-800">
              Foto de la ceremonia
            </h3>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              Opcional. Se muestra en la tarjeta de la ceremonia de la
              invitación.
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative aspect-[16/10] w-40 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-eucalipto-50">
                {misaFotoUrl ? (
                  <Image
                    src={misaFotoUrl}
                    alt="Foto de la ceremonia"
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[11px] text-zinc-400">
                    Sin foto
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={misaFotoRef}
                  type="file"
                  accept={ACEPTA}
                  onChange={(evento) => alElegirSede(evento, subirSedeMisa)}
                  className="sr-only"
                  aria-label="Subir foto de la ceremonia"
                />
                <button
                  type="button"
                  onClick={() => misaFotoRef.current?.click()}
                  disabled={ocupado}
                  className={claseSecundario}
                >
                  {subiendoMisa ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  {misaFotoUrl ? "Reemplazar" : "Subir foto"}
                </button>
                {misaFotoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      ejecutarAccion(
                        () => eliminarFotoSede("misa"),
                        "Foto de la ceremonia eliminada."
                      )
                    }
                    disabled={ocupado}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-zinc-800">
            Foto de la recepción
          </h3>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            Opcional. Se muestra en la tarjeta de la recepción de la invitación.
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative aspect-[16/10] w-40 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-eucalipto-50">
              {recepcionFotoUrl ? (
                <Image
                  src={recepcionFotoUrl}
                  alt="Foto de la recepción"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[11px] text-zinc-400">
                  Sin foto
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={recepcionFotoRef}
                type="file"
                accept={ACEPTA}
                onChange={(evento) => alElegirSede(evento, subirSedeRecepcion)}
                className="sr-only"
                aria-label="Subir foto de la recepción"
              />
              <button
                type="button"
                onClick={() => recepcionFotoRef.current?.click()}
                disabled={ocupado}
                className={claseSecundario}
              >
                {subiendoRecepcion ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {recepcionFotoUrl ? "Reemplazar" : "Subir foto"}
              </button>
              {recepcionFotoUrl && (
                <button
                  type="button"
                  onClick={() =>
                    ejecutarAccion(
                      () => eliminarFotoSede("recepcion"),
                      "Foto de la recepción eliminada."
                    )
                  }
                  disabled={ocupado}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Galería */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-800">
              Galería{" "}
              <span className="font-normal text-zinc-400">
                ({galeria.length}/{MAX_FOTOS_GALERIA})
              </span>
            </h3>
            <input
              ref={galeriaRef}
              type="file"
              accept={ACEPTA}
              onChange={alElegirGaleria}
              className="sr-only"
              aria-label="Subir foto a la galería"
            />
            <button
              type="button"
              onClick={() => galeriaRef.current?.click()}
              disabled={ocupado || sinCupo}
              className={claseSecundario}
            >
              {subiendoGaleria ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Agregar foto
            </button>
          </div>

          {galeria.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
              Todavía no hay fotos en la galería.
            </p>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {galeria.map((foto, indice) => (
                <li
                  key={foto.id}
                  className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200"
                >
                  <Image
                    src={foto.url}
                    alt={`Foto de galería ${indice + 1}`}
                    fill
                    sizes="(max-width: 640px) 45vw, 180px"
                    className="object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-eucalipto-900/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                    #{indice + 1}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/45 to-transparent p-2">
                    <button
                      type="button"
                      onClick={() =>
                        ejecutarAccion(
                          () => moverFotoGaleria(foto.id, "subir"),
                          "Orden actualizado."
                        )
                      }
                      disabled={ocupado || indice === 0}
                      aria-label={`Subir foto ${indice + 1}`}
                      title="Subir"
                      className={claseIcono}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        ejecutarAccion(
                          () => moverFotoGaleria(foto.id, "bajar"),
                          "Orden actualizado."
                        )
                      }
                      disabled={ocupado || indice === galeria.length - 1}
                      aria-label={`Bajar foto ${indice + 1}`}
                      title="Bajar"
                      className={claseIcono}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        ejecutarAccion(
                          () => eliminarFotoGaleria(foto.id),
                          "Foto eliminada de la galería."
                        )
                      }
                      disabled={ocupado}
                      aria-label={`Eliminar foto ${indice + 1}`}
                      title="Eliminar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white/90 text-red-600 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {sinCupo && (
            <p className="mt-2 text-[11px] text-zinc-400">
              Alcanzaste el máximo de {MAX_FOTOS_GALERIA} fotos. Elimina una para
              agregar otra.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700"
        >
          {error}
        </p>
      )}
      {mensaje && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-eucalipto-100 px-3 py-2 text-sm text-eucalipto-800"
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}
