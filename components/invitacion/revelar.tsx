"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Observer reutilizable: revela una sola vez al entrar al viewport y luego se
// desconecta. Solo anima opacity/translate. Con `prefers-reduced-motion: reduce`
// no registra observer (la visibilidad la resuelve el CSS `motion-reduce:*`).
export function useEnViewport<T extends Element>() {
  const ref = useRef<T>(null);
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Fallback sin IntersectionObserver: revelar de inmediato (asíncrono).
    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setRevelado(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            setRevelado(true);
            observer.unobserve(entrada.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  return { ref, revelado };
}

// Capa de revelado ligera para bloques principales.
export function Revelar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, revelado } = useEnViewport<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`xv-revelar transition-[opacity,transform,translate] duration-500 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
        revelado ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
