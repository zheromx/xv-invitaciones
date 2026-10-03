import { obtenerEventoSegunSesion } from "@/lib/invitaciones-panel";
import { ImportadorInvitaciones } from "@/components/panel/importador-invitaciones";

export const dynamic = "force-dynamic";

export default async function PaginaImportarInvitaciones() {
  const evento = await obtenerEventoSegunSesion();
  return <ImportadorInvitaciones hayEvento={Boolean(evento)} />;
}
