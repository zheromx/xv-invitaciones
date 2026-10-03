import { validarTelefono } from "@/lib/telefono";
import { ENCABEZADOS, type Celda } from "@/lib/xlsx-import";

export const LIMITE_PERSONAS_GRUPO = 25;
export const LIMITE_TITULO = 120;
export const LIMITE_NOMBRE = 120;

export type ErrorFila = { fila: number; columna: string; mensaje: string };
export type GrupoImportado = {
  telefono: string;
  titulo: string;
  personas: string[];
  filas: number[];
};

export type Analisis =
  | { ok: true; grupos: GrupoImportado[]; resumen: { grupos: number; personas: number } }
  | { ok: false; errores: ErrorFila[] };

export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/\s+/g, " ")
    .trim();
}

function filaVacia(fila: Celda[] | undefined): boolean {
  return !fila || fila.every((c) => c.valor.trim() === "");
}

const MENSAJE_TELEFONO: Record<string, string> = {
  vacio: "Falta el teléfono.",
  caracteres: "Teléfono inválido: sin letras, extensiones ni símbolos.",
  largo: "Teléfono inválido: usa 10 dígitos o 52 + 10.",
  "521": "Quita el 1 que sigue al 52: +52 933 987 6543.",
};

export function analizar(filas: Celda[][]): Analisis {
  if (filas.length === 0) {
    return {
      ok: false,
      errores: [{ fila: 1, columna: "$encabezado", mensaje: "El archivo no tiene filas." }],
    };
  }

  const encabezado = filas[0].map((c) => normalizarTexto(c.valor));
  const indices: number[] = [];
  const erroresEncabezado: ErrorFila[] = [];
  for (const esperado of ENCABEZADOS) {
    const idx = encabezado.indexOf(normalizarTexto(esperado));
    if (idx === -1) {
      erroresEncabezado.push({
        fila: 1,
        columna: esperado,
        mensaje: `Falta la columna obligatoria "${esperado}" en la fila 1.`,
      });
    }
    indices.push(idx);
  }
  if (erroresEncabezado.length > 0) return { ok: false, errores: erroresEncabezado };

  const [iTel, iTit, iNom] = indices;
  const errores: ErrorFila[] = [];
  const mapa = new Map<string, GrupoImportado>();

  for (let r = 1; r < filas.length; r++) {
    const fila = filas[r];
    const numero = r + 1;
    if (filaVacia(fila)) continue;

    const celTel = fila[iTel];
    const celTit = fila[iTit];
    const celNom = fila[iNom];

    if (celTel?.formula) {
      errores.push({
        fila: numero,
        columna: "Telefono",
        mensaje:
          "La celda es una fórmula. Pega el valor (Inicio → Pegar → Valores). El prefijo +52 no es una fórmula.",
      });
      continue;
    }
    if (celTit?.formula) {
      errores.push({
        fila: numero,
        columna: "Familia/Grupo",
        mensaje: "La celda es una fórmula; pega solo el valor.",
      });
      continue;
    }
    if (celNom?.formula) {
      errores.push({
        fila: numero,
        columna: "Nombre Persona",
        mensaje: "La celda es una fórmula; pega solo el valor.",
      });
      continue;
    }

    const telefonoBruto = (celTel?.valor ?? "").trim();
    const titulo = (celTit?.valor ?? "").trim();
    const nombre = (celNom?.valor ?? "").trim();

    let filaOk = true;

    const resultadoTelefono = validarTelefono(telefonoBruto);
    if (!resultadoTelefono.ok) {
      filaOk = false;
      errores.push({
        fila: numero,
        columna: "Telefono",
        mensaje: MENSAJE_TELEFONO[resultadoTelefono.motivo] ?? "Teléfono inválido.",
      });
    }

    if (!titulo) {
      filaOk = false;
      errores.push({ fila: numero, columna: "Familia/Grupo", mensaje: "Falta el grupo o familia." });
    } else if (titulo.length > LIMITE_TITULO) {
      filaOk = false;
      errores.push({
        fila: numero,
        columna: "Familia/Grupo",
        mensaje: `Máximo ${LIMITE_TITULO} caracteres.`,
      });
    }

    if (!nombre) {
      filaOk = false;
      errores.push({ fila: numero, columna: "Nombre Persona", mensaje: "Falta el nombre de la persona." });
    } else if (nombre.length > LIMITE_NOMBRE) {
      filaOk = false;
      errores.push({
        fila: numero,
        columna: "Nombre Persona",
        mensaje: `Máximo ${LIMITE_NOMBRE} caracteres.`,
      });
    }

    if (!filaOk) continue;

    const telefono = resultadoTelefono.ok ? resultadoTelefono.e164 : "";
    const clave = `${telefono}\u0000${normalizarTexto(titulo)}`;
    const existente = mapa.get(clave);
    if (existente) {
      existente.personas.push(nombre);
      existente.filas.push(numero);
    } else {
      mapa.set(clave, { telefono, titulo, personas: [nombre], filas: [numero] });
    }
  }

  if (errores.length > 0) return { ok: false, errores };

  const grupos = [...mapa.values()];
  const erroresGrupo: ErrorFila[] = [];
  for (const grupo of grupos) {
    if (grupo.personas.length > LIMITE_PERSONAS_GRUPO) {
      erroresGrupo.push({
        fila: grupo.filas[0],
        columna: "Nombre Persona",
        mensaje: `El grupo "${grupo.titulo}" tiene ${grupo.personas.length} personas; el máximo es ${LIMITE_PERSONAS_GRUPO}.`,
      });
    }
    const vistos = new Set<string>();
    for (let i = 0; i < grupo.personas.length; i++) {
      const clave = normalizarTexto(grupo.personas[i]);
      if (vistos.has(clave)) {
        erroresGrupo.push({
          fila: grupo.filas[i],
          columna: "Nombre Persona",
          mensaje: `"${grupo.personas[i]}" está repetido en el grupo "${grupo.titulo}".`,
        });
      } else {
        vistos.add(clave);
      }
    }
  }
  if (erroresGrupo.length > 0) return { ok: false, errores: erroresGrupo };

  const personas = grupos.reduce((total, g) => total + g.personas.length, 0);
  return { ok: true, grupos, resumen: { grupos: grupos.length, personas } };
}
