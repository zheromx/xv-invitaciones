import { revalidatePath } from "next/cache";
import { obtenerEventoSegunSesion } from "@/lib/invitaciones-panel";
import {
  LIMITE_ARCHIVO_BYTES,
  LIMITE_CUERPO_BYTES,
  LIMITE_FILAS_DATOS,
  generarPlantilla,
  leerHoja,
} from "@/lib/xlsx-import";
import { analizar } from "@/lib/importacion-invitaciones";
import {
  ImportacionDuplicada,
  detectarConflictos,
  ejecutarImportacion,
} from "@/lib/importacion-nucleo";

export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

export async function GET() {
  const evento = await obtenerEventoSegunSesion();
  if (!evento) return json({ error: "no-autorizado" }, 401);

  const buffer = generarPlantilla();
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="plantilla-invitaciones.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const evento = await obtenerEventoSegunSesion();
  if (!evento) return json({ error: "no-autorizado" }, 401);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > LIMITE_CUERPO_BYTES) return json({ error: "cuerpo" }, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "cuerpo" }, 400);
  }

  const operacion = form.get("operacion");
  if (operacion !== "analizar" && operacion !== "confirmar") {
    return json({ error: "operacion" }, 400);
  }

  const archivo = form.get("archivo");
  if (!(archivo instanceof File)) return json({ error: "archivo" }, 400);
  if (!archivo.name.toLowerCase().endsWith(".xlsx")) {
    return json({ error: "extension" }, 400);
  }
  if (archivo.size > LIMITE_ARCHIVO_BYTES) return json({ error: "tamano" }, 413);

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const hoja = leerHoja(buffer);
  if (!hoja.ok) return json({ error: hoja.motivo }, 400);
  if (hoja.excedeLimite) {
    return json({ error: "filas", limite: LIMITE_FILAS_DATOS }, 400);
  }

  const analisis = analizar(hoja.filas);
  if (!analisis.ok) return json({ error: "validacion", errores: analisis.errores }, 422);

  if (operacion === "analizar") {
    const { bloqueantes, advertencias } = await detectarConflictos(
      evento.id,
      analisis.grupos
    );
    return json({
      resumen: analisis.resumen,
      grupos: analisis.grupos.slice(0, 20).map((grupo) => ({
        titulo: grupo.titulo,
        telefono: grupo.telefono,
        personas: grupo.personas,
      })),
      bloqueantes,
      advertencias,
    });
  }

  try {
    const resultado = await ejecutarImportacion(evento.id, analisis.grupos);
    revalidatePath("/panel/invitaciones");
    return json({ creadas: resultado.creadas });
  } catch (error) {
    if (error instanceof ImportacionDuplicada) {
      return json({ error: "duplicados", conflictos: error.conflictos }, 409);
    }
    console.error("Error al importar invitaciones:", error);
    return json({ error: "fallo" }, 500);
  }
}
