import * as XLSX from "xlsx";

export const LIMITE_FILAS_DATOS = 1000;
export const LIMITE_ARCHIVO_BYTES = 2 * 1024 * 1024;
export const LIMITE_CUERPO_BYTES = 4 * 1024 * 1024;

export const ENCABEZADOS = ["Telefono", "Familia/Grupo", "Nombre Persona"] as const;

export type Celda = { valor: string; formula: boolean };

export type ResultadoHoja =
  | { ok: true; filas: Celda[][]; excedeLimite: boolean }
  | { ok: false; motivo: "firma" | "estructura" };

export function tieneFirmaXlsx(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  );
}

function textoCelda(celda: XLSX.CellObject | undefined): Celda {
  if (!celda) return { valor: "", formula: false };
  const formula = typeof celda.f === "string" && celda.f.length > 0;

  let valor = "";
  if (typeof celda.v === "number") valor = String(celda.v);
  else if (typeof celda.v === "string") valor = celda.v;
  else if (typeof celda.w === "string") valor = celda.w;
  else if (celda.v === undefined || celda.v === null) valor = "";
  else valor = String(celda.v);

  return { valor, formula };
}

function leerFilas(hoja: XLSX.WorkSheet): Celda[][] {
  const rango = XLSX.utils.decode_range(hoja["!ref"] as string);
  const filas: Celda[][] = [];
  for (let r = rango.s.r; r <= rango.e.r; r++) {
    const fila: Celda[] = [];
    for (let c = rango.s.c; c <= rango.e.c; c++) {
      const celda = hoja[XLSX.utils.encode_cell({ r, c })] as
        | XLSX.CellObject
        | undefined;
      fila.push(textoCelda(celda));
    }
    filas.push(fila);
  }
  return filas;
}

function filaConContenido(fila: Celda[] | undefined): boolean {
  return Boolean(fila) && fila!.some((c) => c.valor.trim() !== "");
}

export function leerHoja(buffer: Buffer): ResultadoHoja {
  if (!tieneFirmaXlsx(buffer)) return { ok: false, motivo: "firma" };

  let libro: XLSX.WorkBook;
  try {
    libro = XLSX.read(buffer, {
      type: "buffer",
      sheetRows: LIMITE_FILAS_DATOS + 3,
      cellFormula: true,
    });
  } catch {
    return { ok: false, motivo: "estructura" };
  }

  const nombre = libro.SheetNames[0];
  if (!nombre) return { ok: false, motivo: "estructura" };
  const hoja = libro.Sheets[nombre];
  if (!hoja || !hoja["!ref"]) return { ok: false, motivo: "estructura" };

  const rango = XLSX.utils.decode_range(hoja["!ref"] as string);
  if (rango.e.c - rango.s.c + 1 > 50) return { ok: false, motivo: "estructura" };

  const filas = leerFilas(hoja);

  let ultimaConContenido = 0;
  for (let i = 0; i < filas.length; i++) {
    if (filaConContenido(filas[i])) ultimaConContenido = i + 1;
  }
  const excedeLimite = ultimaConContenido > LIMITE_FILAS_DATOS + 1;

  return { ok: true, filas, excedeLimite };
}

export function generarPlantilla(): Buffer {
  const hoja = XLSX.utils.aoa_to_sheet([[...ENCABEZADOS]]);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Invitaciones");
  return XLSX.write(libro, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
