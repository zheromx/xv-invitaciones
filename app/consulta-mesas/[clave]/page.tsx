import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerDatosConsultaHostess } from "@/lib/consulta-mesas-hostess";
import { VistaConsultaMesasHostess } from "@/components/panel/listado-mesas-lectura";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clave: string }>;
}): Promise<Metadata> {
  const { clave } = await params;
  const datos = await obtenerDatosConsultaHostess(clave);
  if (!datos) return { robots: { index: false, follow: false, nocache: true } };

  const nombre = datos.eventoNombre ?? "";
  const title = nombre ? `Consulta de Mesas | XV de ${nombre}` : "Consulta de Mesas";

  return {
    title,
    description: "Listado de mesas y asistentes confirmados",
    robots: { index: false, follow: false, nocache: true },
    other: { "referrer": "no-referrer" },
  };
}

export default async function PaginaConsultaMesasHostess({
  params,
}: {
  params: Promise<{ clave: string }>;
}) {
  const { clave } = await params;
  const datos = await obtenerDatosConsultaHostess(clave);
  if (!datos) notFound();

  return (
    <VistaConsultaMesasHostess
      invitacionesRespondidas={datos.invitacionesRespondidas}
      eventoNombre={datos.eventoNombre}
      hayRespuestas={datos.hayRespuestas}
    />
  );
}
