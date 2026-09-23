"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const suscripcionVacia = () => () => {};

export type FotoVisor = { url: string; alt: string };

// Componente cliente aislado: solo renderiza las fotos reales de la galería
// (con URL útil) como celda interactiva y gestiona el visor ligero. Los
// placeholders/mock de demo viven en el Server Component padre y nunca abren
// visor.
export function GaleriaInteractiva({ fotos }: { fotos: FotoVisor[] }) {
  const [abierto, setAbierto] = useState<number | null>(null);
  const botonesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const cerrarRef = useRef<HTMLButtonElement | null>(null);
  const ultimoRef = useRef<number | null>(null);
  // El portal solo se habilita tras montar en cliente: `false` en SSR y en el
  // primer render de hidratación, `true` una vez montado (sin tocar `document`
  // durante SSR ni provocar cascadas de render).
  const montado = useSyncExternalStore(
    suscripcionVacia,
    () => true,
    () => false
  );

  const abrir = (indice: number) => {
    ultimoRef.current = indice;
    setAbierto(indice);
  };

  const mover = useCallback(
    (delta: number) => {
      setAbierto((actual) =>
        actual === null ? actual : (actual + delta + fotos.length) % fotos.length
      );
    },
    [fotos.length]
  );

  // Cierra y devuelve el foco al trigger que abrió el visor.
  const cerrar = useCallback(() => {
    setAbierto(null);
    const indice = ultimoRef.current;
    if (indice !== null) {
      requestAnimationFrame(() => botonesRef.current[indice]?.focus());
    }
  }, []);

  useEffect(() => {
    if (abierto === null) return;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") cerrar();
      else if (evento.key === "ArrowLeft") mover(-1);
      else if (evento.key === "ArrowRight") mover(1);
    };
    window.addEventListener("keydown", alTeclear);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierto, cerrar, mover]);

  if (fotos.length === 0) return null;

  const fotoActual = abierto === null ? null : fotos[abierto];

  return (
    <>
      {fotos.map((foto, indice) => (
        <button
          key={foto.url}
          ref={(elemento) => {
            botonesRef.current[indice] = elemento;
          }}
          type="button"
          onClick={() => abrir(indice)}
          aria-label={`Ampliar: ${foto.alt}`}
          className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
        >
          <Image
            src={foto.url}
            alt={foto.alt}
            fill
            sizes="(max-width: 420px) 45vw, 200px"
            className="object-cover"
          />
        </button>
      ))}

      {montado &&
        fotoActual &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Visor de galería"
            onClick={cerrar}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          >
            <div
              className="relative h-[80vh] w-[90vw] max-w-3xl"
              onClick={(evento) => evento.stopPropagation()}
            >
              <Image
                src={fotoActual.url}
                alt={fotoActual.alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <button
              ref={cerrarRef}
              type="button"
              onClick={cerrar}
              aria-label="Cerrar visor"
              className="absolute right-4 top-4 inline-flex h-11 items-center justify-center rounded-full bg-white/90 px-4 text-sm font-semibold text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Cerrar
            </button>

            {fotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(evento) => {
                    evento.stopPropagation();
                    mover(-1);
                  }}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(evento) => {
                    evento.stopPropagation();
                    mover(1);
                  }}
                  aria-label="Foto siguiente"
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
