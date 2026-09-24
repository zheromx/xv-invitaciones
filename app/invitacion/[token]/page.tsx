import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EleganteEucalipto } from "@/components/templates/elegante-eucalipto";
import { obtenerInvitacionPorToken } from "@/lib/invitacion";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const datos = await obtenerInvitacionPorToken(token);
  if (!datos) return {};

  const nombre = datos.evento.nombreQuinceanera;
  const title = `XV de ${nombre} | Invitación`;
  const description = `Te invitamos a celebrar los XV años de ${nombre}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { title, description },
  };
}

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