"use client";

import { useActionState } from "react";
import { iniciarSesion } from "@/lib/acciones-auth";

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, {});

  return (
    <form
      action={accion}
      className="w-full max-w-sm rounded-2xl border border-dorado/25 bg-white p-6 shadow-sm"
    >
      <h1 className="font-serif text-2xl text-eucalipto-700">
        Acceso al panel
      </h1>
      <p className="mt-1 text-xs text-zinc-500">
        Área del organizador — usa tus credenciales de administración.
      </p>
      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Correo</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-zinc-600">Contraseña</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1 h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
          />
        </label>
      </div>
      {estado?.error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-left text-xs leading-5 text-red-700"
        >
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-eucalipto-700 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}