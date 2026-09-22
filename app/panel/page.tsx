import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function PanelPage() {
  const sesion = await auth();
  if (!sesion?.user) redirect("/login");

  const evento = await prisma.evento.findFirst({
    where: { usuarioId: sesion.user.id },
    select: { id: true },
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="font-serif text-2xl text-eucalipto-700">
        Bitácora de administración
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Este entregable aterriza la protección del panel y el login del
        organizador, y el CRUD de invitaciones en{" "}
        <a
          href="/panel/invitaciones"
          className="font-medium text-eucalipto-700 underline underline-offset-4"
        >
          Invitaciones
        </a>
        . El dashboard con métricas llega en los siguientes pasos.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Evento
          </p>
          <p className="mt-1 text-sm text-zinc-800">
            {evento
              ? "Configuración de evento encontrada y vinculada a tu cuenta."
              : "Aún no hay evento vinculado a esta cuenta."}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Sesión
          </p>
          <p className="mt-1 text-sm text-zinc-800">
            Autenticado con Auth.js (JWT). El acceso está limitado a /panel.
          </p>
        </div>
      </div>
    </div>
  );
}