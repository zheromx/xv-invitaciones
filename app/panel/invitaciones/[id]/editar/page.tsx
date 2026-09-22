import { redirect } from "next/navigation";
import { detalleInvitacionParaEditar, obtenerEventoSegunSesion } from "@/lib/invitaciones-panel";
import { FormularioInvitacion } from "@/components/panel/formulario-invitacion";

export const dynamic = "force-dynamic";

export default async function PaginaEditarInvitacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await obtenerEventoSegunSesion();
  if (!evento) redirect("/panel/invitaciones");

  const detalle = await detalleInvitacionParaEditar(evento.id, id);
  if (!detalle || detalle.eventoId !== evento.id) {
    redirect("/panel/invitaciones");
  }

  const confirmadas = detalle.personas.filter((p) => p.asiste === true).length;

  return (
    <FormularioInvitacion
      modo={detalle.respondida ? "solo-lectura" : "editar"}
      invitacionId={detalle.id}
      tituloInicial={detalle.titulo}
      personasIniciales={detalle.personas.map((p) => ({
        id: p.id,
        nombre: p.nombre,
      }))}
      confirmadasIniciales={detalle.respondida ? confirmadas : undefined}
    />
  );
}