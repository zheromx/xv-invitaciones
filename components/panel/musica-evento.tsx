"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Music, Trash2, Upload } from "lucide-react";
import {
  eliminarMusica,
  guardarMusica,
  type ResultadoMusica,
} from "@/lib/acciones-musica";
import { MAX_TAMANO_MUSICA_BYTES, MIME_MUSICA } from "@/lib/musica-evento";
import { useUploadThing } from "@/lib/uploadthing";

const MENSAJES: Record<
  Extract<ResultadoMusica, { ok: false }>["motivo"],
  string
> = {
  "no-autenticado": "Tu sesión expiró. Vuelve a iniciar sesión.",
  "no-encontrada": "No hay un evento vinculado a tu cuenta.",
  "datos-invalidos": "El archivo no es válido. Usa un MP3 de hasta 12 MB.",
  fallo: "Ocurrió un error inesperado. Vuelve a intentarlo.",
};

export function BloqueMusica({ musicaUrl }: { musicaUrl: string | null }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const ejecutar = (accion: () => Promise<ResultadoMusica>, exito: string) => {
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

  const { startUpload, isUploading } = useUploadThing("musicaEvento", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
      if (!url) {
        setError("La subida no devolvió una URL válida.");
        return;
      }
      ejecutar(() => guardarMusica(url), "Música guardada.");
    },
    onUploadError: (e) => {
      setError(e?.message || "No se pudo subir el archivo.");
    },
  });

  const ocupado = pendiente || isUploading;

  const alElegir = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const file = evento.target.files?.[0];
    evento.target.value = "";
    setError(null);
    setMensaje(null);
    if (!file) return;
    if (file.type !== MIME_MUSICA) {
      setError("Formato no permitido. Usa un archivo MP3.");
      return;
    }
    if (file.size > MAX_TAMANO_MUSICA_BYTES) {
      setError("El archivo supera el máximo de 12 MB.");
      return;
    }
    void startUpload([file]);
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3 border-b border-zinc-100 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-eucalipto-100 text-eucalipto-700">
          <Music className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg text-eucalipto-700">9. Música</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Pista de fondo opcional. MP3, máximo 12 MB. Recomendado: breve y
            optimizado.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="audio/mpeg"
          onChange={alElegir}
          className="sr-only"
          aria-label="Subir música"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={ocupado}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {musicaUrl ? "Reemplazar MP3" : "Subir MP3"}
        </button>
        {musicaUrl && (
          <button
            type="button"
            onClick={() =>
              ejecutar(() => eliminarMusica(), "Música eliminada.")
            }
            disabled={ocupado}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        )}
      </div>

      <p className="mt-3 text-[11px] text-zinc-400">
        {musicaUrl
          ? "Hay una pista cargada. Sonará solo cuando el invitado abra la invitación."
          : "Sin música."}
      </p>

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
