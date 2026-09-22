import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { EleganteEucalipto } from "@/components/templates/elegante-eucalipto";
import { obtenerVistaPreviaSesion } from "@/lib/evento-panel";

export const dynamic = "force-dynamic";

export default async function PaginaVistaPreviaEvento() {
  const datos = await obtenerVistaPreviaSesion();
  if (!datos) redirect("/panel/configuracion");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-eucalipto-700">Vista previa</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Misma plantilla pública con los datos actuales del evento.
          </p>
        </div>
        <a
          href="/panel/configuracion"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalipto-700 focus-visible:ring-offset-2"
        >
          Volver a configuración
        </a>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-dorado/30 bg-dorado/10 px-4 py-3 text-sm text-eucalipto-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-eucalipto-700" />
        <span>
          Esta vista previa reutiliza el componente de la invitación real. El
          RSVP está desactivado: no envía respuestas ni modifica datos.
        </span>
      </p>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-marfil shadow-sm">
        <EleganteEucalipto
          evento={datos.evento}
          invitacion={datos.invitacion}
          demostracion
        />
      </div>
    </div>
  );
}
