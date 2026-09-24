"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Music2, Pause } from "lucide-react";

type ContextoAudio = {
  iniciar: () => void;
  alternar: () => void;
  activo: boolean;
  abierto: boolean;
};

const NOOP: ContextoAudio = {
  iniciar: () => {},
  alternar: () => {},
  activo: false,
  abierto: false,
};

const ContextoMusica = createContext<ContextoAudio>(NOOP);

// Hook para disparar la música desde el gesto de "Abrir invitación".
export function useAudioMusica() {
  return useContext(ContextoMusica);
}

// Provee el <audio> (loop, sin autoplay) y el control compacto pausar/reanudar.
// Solo se activa en la ruta pública real con `musicaUrl` presente; en demo y
// vista previa `esReal` es false y no se renderiza audio ni control.
export function AudioMusica({
  musicaUrl,
  esReal,
  children,
}: {
  musicaUrl: string | null;
  esReal: boolean;
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(false);

  const activoReal = esReal && Boolean(musicaUrl);

  const iniciar = useCallback(() => {
    if (!activoReal) return;
    setAbierto(true);
    const audio = audioRef.current;
    if (!audio) return;
    const promesa = audio.play();
    if (promesa && typeof promesa.then === "function") {
      promesa.then(() => setActivo(true)).catch(() => setActivo(false));
    }
  }, [activoReal]);

  const alternar = useCallback(() => {
    if (!activoReal) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const promesa = audio.play();
      if (promesa && typeof promesa.then === "function") {
        promesa.then(() => setActivo(true)).catch(() => setActivo(false));
      }
    } else {
      audio.pause();
      setActivo(false);
    }
  }, [activoReal]);

  const valor = useMemo(
    () => ({ iniciar, alternar, activo, abierto }),
    [iniciar, alternar, activo, abierto]
  );

  return (
    <ContextoMusica.Provider value={valor}>
      {children}

      {activoReal && (
        <audio
          ref={audioRef}
          src={musicaUrl ?? undefined}
          loop
          preload="none"
          className="hidden"
        />
      )}

      {activoReal && abierto && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[50] flex justify-center">
          <div
            className="flex w-full max-w-[420px] justify-end px-5"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              onClick={alternar}
              aria-label={activo ? "Pausar música" : "Reproducir música"}
              title={activo ? "Pausar música" : "Reproducir música"}
              className="pointer-events-auto inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-dorado/40 bg-white/95 text-eucalipto-700 shadow-md hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
            >
              {activo ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Music2 className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      )}
    </ContextoMusica.Provider>
  );
}
