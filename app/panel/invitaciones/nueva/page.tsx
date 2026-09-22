import { obtenerEventoSegunSesion } from "@/lib/invitaciones-panel";
import { FormularioInvitacion } from "@/components/panel/formulario-invitacion";

export const dynamic = "force-dynamic";

export default async function PaginaNuevaInvitacion() {
  const evento = await obtenerEventoSegunSesion();
  if (!evento) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="font-serif text-lg text-eucalipto-700">
          Aún no hay evento vinculado
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
          La configuración del evento se habilita en un entregable posterior.
        </p>
      </div>
    );
  }

  return <FormularioInvitacion modo="crear" />;
}