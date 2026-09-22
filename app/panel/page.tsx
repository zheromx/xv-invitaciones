import {
  CheckCircle2,
  Clock3,
  Info,
  Mail,
  Plus,
  UserX,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { obtenerMetricasDashboard } from "@/lib/dashboard-panel";

export const dynamic = "force-dynamic";

function TarjetaMetrica({
  etiqueta,
  valor,
  detalle,
  icono: Icono,
  chipClass,
}: {
  etiqueta: string;
  valor: number;
  detalle: string;
  icono: LucideIcon;
  chipClass: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          {etiqueta}
        </p>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${chipClass}`}
        >
          <Icono className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-serif text-3xl leading-none text-eucalipto-800">
        {valor}
      </p>
      <p className="mt-1.5 text-xs text-zinc-500">{detalle}</p>
    </div>
  );
}

export default async function PaginaPanel() {
  const resumen = await obtenerMetricasDashboard();
  if (resumen === null) redirect("/login");

  if (!resumen.eventoPresente) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl text-eucalipto-700">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Confirmaciones y asistencia en tiempo real.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-serif text-lg text-eucalipto-700">
            Aún no hay evento vinculado
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
            La configuración del evento se habilita en un entregable posterior.
            En desarrollo, ejecuta el seed para crear las invitaciones de
            prueba.
          </p>
        </div>
      </div>
    );
  }

  const {
    eventoNombre,
    totalInvitaciones,
    respondidas,
    sinResponder,
    confirmadas,
    declinadas,
    enInvitacionesSinResponder,
  } = resumen;

  const pluralInvitacion = (n: number) =>
    n === 1 ? "1 invitación creada" : `${n} invitaciones creadas`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-eucalipto-700">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Confirmaciones y asistencia en tiempo real
            {eventoNombre ? ` de ${eventoNombre}` : ""}.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/panel/configuracion"
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
          >
            Configuración
          </a>
          <a
            href="/panel/invitaciones"
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
          >
            Invitaciones
          </a>
          <a
            href="/panel/invitaciones/nueva"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-eucalipto-700 px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Nueva invitación
          </a>
        </div>
      </div>

      {totalInvitaciones === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center">
          <p className="text-sm font-medium text-zinc-700">
            Todavía no hay invitaciones.
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Crea la primera para empezar a recibir confirmaciones.
          </p>
          <a
            href="/panel/invitaciones/nueva"
            className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-full bg-eucalipto-700 px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Crear invitación
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <TarjetaMetrica
          etiqueta="Invitaciones totales"
          valor={totalInvitaciones}
          detalle={pluralInvitacion(totalInvitaciones)}
          icono={Mail}
          chipClass="bg-zinc-100 text-zinc-600"
        />
        <TarjetaMetrica
          etiqueta="Respondidas"
          valor={respondidas}
          detalle="confirmaciones recibidas"
          icono={CheckCircle2}
          chipClass="bg-eucalipto-100 text-eucalipto-700"
        />
        <TarjetaMetrica
          etiqueta="Sin responder"
          valor={sinResponder}
          detalle="en espera de respuesta"
          icono={Clock3}
          chipClass="bg-amber-100 text-amber-700"
        />
        <TarjetaMetrica
          etiqueta="Personas confirmadas"
          valor={confirmadas}
          detalle="asistencia confirmada"
          icono={Users}
          chipClass="bg-eucalipto-100 text-eucalipto-700"
        />
        <TarjetaMetrica
          etiqueta="No asistirán"
          valor={declinadas}
          detalle="declinaron la invitación"
          icono={UserX}
          chipClass="bg-rose-100 text-rose-700"
        />
      </div>

      {enInvitacionesSinResponder > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          <p>
            <span className="font-medium text-zinc-800">
              Personas en invitaciones sin responder: {enInvitacionesSinResponder}
            </span>{" "}
            — dato contextual: aún no han confirmado ningún estado. El dashboard
            refleja los datos actuales; las invitaciones sin responder no cambian
            de estado automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}
