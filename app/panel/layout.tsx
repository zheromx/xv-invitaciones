import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cerrarSesion } from "@/lib/acciones-auth";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await auth();
  if (!sesion?.user) redirect("/login");

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <p className="font-serif text-lg text-eucalipto-700">
              Panel del organizador
            </p>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/panel" className="font-medium text-zinc-600 hover:text-eucalipto-700">
                Resumen
              </a>
              <a
                href="/panel/invitaciones"
                className="font-medium text-zinc-600 hover:text-eucalipto-700"
              >
                Invitaciones
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-xs font-medium text-zinc-800">
                {sesion.user.name}
              </p>
              <p className="text-[11px] text-zinc-500">{sesion.user.email}</p>
            </div>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}