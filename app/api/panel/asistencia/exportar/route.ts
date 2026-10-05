import {
  MAX_LONGITUD_BUSQUEDA,
  construirDetalle,
  construirFilasExportacion,
  type FiltroAsistencia,
} from "@/lib/asistencia-resumen";
import { obtenerDetalleAsistencia } from "@/lib/dashboard-panel";
import {
  generarXlsxAsistencia,
  nombreArchivoAsistencia,
} from "@/lib/xlsx-export";

export const runtime = "nodejs";

const FILTROS: readonly FiltroAsistencia[] = [
  "todas",
  "asistiran",
  "no-asistiran",
];

function json(body: unknown, status: number) {
  return Response.json(body, { status });
}

function esFiltroValido(valor: string | null): valor is FiltroAsistencia {
  return valor !== null && (FILTROS as readonly string[]).includes(valor);
}

// Exporta la vista filtrada del detalle de asistencia. El navegador solo
// envía `filtro` y `busqueda`; las personas a exportar se recalculan en el
// servidor con la MISMA lógica pura que la UI. El evento y la autorización se
// derivan dentro de `obtenerDetalleAsistencia` (session.user.id), sin IDs del
// cliente y sin una segunda resolución de Evento.
export async function GET(request: Request) {
  const detalle = await obtenerDetalleAsistencia();
  if (detalle === null) return json({ error: "no-autorizado" }, 401);

  const { searchParams } = new URL(request.url);
  const filtroParam = searchParams.get("filtro");
  const busqueda = searchParams.get("busqueda") ?? "";

  if (!esFiltroValido(filtroParam)) return json({ error: "filtro-invalido" }, 400);
  if (busqueda.length > MAX_LONGITUD_BUSQUEDA) {
    return json({ error: "busqueda-invalida" }, 400);
  }

  if (!detalle.eventoPresente) return json({ error: "sin-evento" }, 404);

  const vista = construirDetalle(
    detalle.invitacionesRespondidas,
    filtroParam,
    busqueda
  );
  const filas = construirFilasExportacion(vista);
  if (filas.length === 0) return json({ error: "sin-datos" }, 400);

  const buffer = generarXlsxAsistencia(filas);
  const nombre = nombreArchivoAsistencia(filtroParam, new Date());

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "no-store",
    },
  });
}
