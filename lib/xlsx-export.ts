// Generación de XLSX de asistencia. EXCLUSIVAMENTE de servidor: importa
// SheetJS (`xlsx`), que no debe entrar al bundle cliente. No lee ni escribe
// base de datos ni disco: construye el archivo en memoria a partir de filas
// puras.

import * as XLSX from "xlsx";
import type { FilaExportacion, FiltroAsistencia } from "./asistencia-resumen";

export const HOJA_ASISTENCIA = "Asistencia";
export const ENCABEZADOS_ASISTENCIA = [
  "Invitación",
  "Persona",
  "Asistencia",
] as const;

// Celda de texto explícita: t "s", con `v` string y SIN campos `f`, `F` ni `l`.
// Así los valores se conservan exactos (incluidos los que empiezan con
// =, +, - o @) sin anteponer apóstrofos, sin fórmulas y sin hipervínculos.
function celdaTexto(valor: string): XLSX.CellObject {
  return { t: "s", v: valor };
}

export function generarXlsxAsistencia(filas: FilaExportacion[]): Buffer {
  const matriz: string[][] = [
    [...ENCABEZADOS_ASISTENCIA],
    ...filas.map((fila) => [fila.invitacion, fila.persona, fila.asistencia]),
  ];

  const hoja: XLSX.WorkSheet = {};
  for (let r = 0; r < matriz.length; r++) {
    for (let c = 0; c < matriz[r].length; c++) {
      hoja[XLSX.utils.encode_cell({ r, c })] = celdaTexto(matriz[r][c]);
    }
  }

  hoja["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: matriz.length - 1, c: ENCABEZADOS_ASISTENCIA.length - 1 },
  });
  hoja["!cols"] = [{ wch: 40 }, { wch: 40 }, { wch: 16 }];

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, HOJA_ASISTENCIA);
  return XLSX.write(libro, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;
}

// Nombre de archivo seguro: identifica el filtro y la fecha (UTC), sin nombres
// personales ni el texto buscado.
export function nombreArchivoAsistencia(
  filtro: FiltroAsistencia,
  fecha: Date
): string {
  const etiqueta =
    filtro === "asistiran"
      ? "asistiran"
      : filtro === "no-asistiran"
        ? "no-asistiran"
        : "todas";
  const anio = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  return `asistencia-${etiqueta}-${anio}${mes}${dia}.xlsx`;
}
