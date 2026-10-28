import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UtensilsCrossed, ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const registro = await prisma.invitacion.findUnique({
    where: { token },
    include: { evento: { select: { nombreQuinceanera: true } } },
  });
  if (!registro) return {};

  const nombre = registro.evento.nombreQuinceanera;
  const title = `Asignación de Mesa | XV de ${nombre}`;
  const description = `Consulta de mesa asignada para los XV años de ${nombre}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { title, description },
  };
}

export default async function PaginaConsultaMesas({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const registro = await prisma.invitacion.findUnique({
    where: { token },
    include: {
      personas: { orderBy: { id: "asc" } },
      evento: { select: { nombreQuinceanera: true, fecha: true } },
    },
  });

  if (!registro) notFound();

  const asistentes = registro.personas.filter((p) => p.asiste === true);
  const todosDeclinados =
    registro.respondida &&
    registro.personas.length > 0 &&
    registro.personas.every((p) => p.asiste === false);

  return (
    <main className="min-h-screen bg-marfil-claro px-4 py-8 text-zinc-800">
      <div className="mx-auto max-w-[420px] space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-eucalipto-100 text-eucalipto-800">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-2xl text-eucalipto-800">
            Asignación de Mesa
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            XV Años de {registro.evento.nombreQuinceanera}
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-eucalipto-700">
            {registro.titulo}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          {!registro.respondida ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-lg text-zinc-800">
                Invitación pendiente de respuesta
              </h2>
              <p className="text-sm text-zinc-500">
                Aún no se ha confirmado la asistencia para este grupo. Una vez confirmada, aquí podrás consultar el número de mesa asignado.
              </p>
            </div>
          ) : todosDeclinados ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <XCircle className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-lg text-zinc-800">
                Asistencia declinada
              </h2>
              <p className="text-sm text-zinc-500">
                Se indicó que ningún integrante de este grupo asistirá al evento, por lo que no hay lugares ni mesas asignadas.
              </p>
            </div>
          ) : asistentes.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <h2 className="font-serif text-lg text-zinc-800">
                Sin asistentes confirmados
              </h2>
              <p className="text-sm text-zinc-500">
                No hay personas confirmadas en este grupo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-eucalipto-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Lugares confirmados ({asistentes.length})</span>
              </div>
              <ul className="divide-y divide-zinc-100">
                {asistentes.map((persona) => (
                  <li
                    key={persona.id}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-zinc-800 pr-3">
                      {persona.nombre}
                    </span>
                    <span
                      className={
                        persona.mesa !== null
                          ? "shrink-0 rounded-full bg-eucalipto-100 px-3 py-1 text-xs font-semibold text-eucalipto-800"
                          : "shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 italic"
                      }
                    >
                      {persona.mesa !== null ? `Mesa ${persona.mesa}` : "Mesa por asignar"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="text-center">
          <a
            href={`/invitacion/${token}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-eucalipto-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la invitación
          </a>
        </div>
      </div>
    </main>
  );
}
