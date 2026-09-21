import { notFound } from "next/navigation";
import { EleganteEucalipto } from "@/components/templates/elegante-eucalipto";
import { obtenerInvitacionPorToken } from "@/lib/invitacion";

export default async function PaginaInvitacion({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const datos = await obtenerInvitacionPorToken(token);
  if (!datos) notFound();
  return (
    <EleganteEucalipto
      evento={datos.evento}
      invitacion={datos.invitacion}
      token={token}
    />
  );
}