// Funciones puras (sin Prisma ni I/O) para agrupar, filtrar, ordenar y
// resumir la asistencia del panel. La lectura autorizada vive en
// `lib/dashboard-panel.ts` y la interacción en
// `components/panel/detalle-asistencia.tsx`.
//
// Reglas no negociables modeladas aquí:
// - La agrupación es SIEMPRE por `Invitacion.id` (nunca por título/nombre).
// - `asiste === null` nunca se convierte en `false` ni se etiqueta como
//   negativa; dentro de una invitación respondida se reporta como dato
//   inconsistente sin repararlo.
// - Búsqueda y filtros no alteran las métricas globales del dashboard.

export type FiltroAsistencia = "todas" | "asistiran" | "no-asistiran";

// Política de longitud de búsqueda compartida entre la UI y el endpoint de
// exportación. Es explícita y consistente: el buscador limita la entrada y el
// endpoint rechaza (no trunca en silencio) cualquier valor que la exceda.
export const MAX_LONGITUD_BUSQUEDA = 200;

export type AsistenciaPersona = {
  id: string;
  nombre: string;
  asiste: boolean | null;
};

export type AsistenciaInvitacion = {
  id: string;
  titulo: string;
  respondidaEn?: string | Date | null;
  personas: AsistenciaPersona[];
};

export type InvitacionSinResponder = {
  id: string;
  titulo: string;
  creadaEn?: string | Date;
  totalPersonas: number;
};

export type IntegranteResumen = {
  id: string;
  nombre: string;
  asiste: boolean | null;
};

export type GrupoResumen = {
  id: string;
  titulo: string;
  totalPersonas: number;
  totalAsisten: number;
  totalNoAsisten: number;
  totalInconsistentes: number;
  tieneInconsistencia: boolean;
  integrantes: IntegranteResumen[];
  resumenTexto: string;
};

export type ResumenDetalle = {
  grupos: GrupoResumen[];
  totalGrupos: number;
  totalPersonas: number;
  hayRespuestas: boolean;
  hayInconsistencias: boolean;
};

// Normaliza para comparar/buscar: sin tildes, minúsculas (es-MX) y sin
// espacios en los extremos. No se usa para mostrar, solo para comparar.
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
    .trim();
}

function compararPorTexto(a: string, b: string): number {
  const comparacion = normalizarTexto(a).localeCompare(
    normalizarTexto(b),
    "es-MX",
    { sensitivity: "base", numeric: true }
  );
  return comparacion;
}

// Orden estable: por fecha de confirmación (respondidaEn) ascendente,
// luego por título (es-MX, sin tildes/mayúsculas) y desempate por id.
function compararInvitaciones(
  a: AsistenciaInvitacion,
  b: AsistenciaInvitacion
): number {
  const fechaA = a.respondidaEn ? new Date(a.respondidaEn).getTime() : 0;
  const fechaB = b.respondidaEn ? new Date(b.respondidaEn).getTime() : 0;
  if (fechaA !== fechaB) return fechaA - fechaB;

  const porTitulo = compararPorTexto(a.titulo, b.titulo);
  return porTitulo !== 0 ? porTitulo : a.id.localeCompare(b.id);
}

function compararPersonas(
  a: AsistenciaPersona,
  b: AsistenciaPersona
): number {
  const porNombre = compararPorTexto(a.nombre, b.nombre);
  return porNombre !== 0 ? porNombre : a.id.localeCompare(b.id);
}

function resumenTodas(
  asisten: number,
  noAsisten: number,
  incompleto: boolean
): string {
  const parteAsisten = asisten === 1 ? "1 asistirá" : `${asisten} asistirán`;
  const parteNoAsisten =
    noAsisten === 1 ? "1 no asistirá" : `${noAsisten} no asistirán`;
  const sufijo = incompleto ? " · datos incompletos" : "";
  return `${parteAsisten} · ${parteNoAsisten}${sufijo}`;
}

function resumenFiltrado(
  conteo: number,
  total: number,
  negativo: boolean,
  incompleto: boolean
): string {
  const personas = total === 1 ? "1 persona" : `${total} personas`;
  const etiqueta = negativo
    ? conteo === 1
      ? "1 no asistirá"
      : `${conteo} no asistirán`
    : conteo === 1
      ? "1 asistirá"
      : `${conteo} asistirán`;
  const sufijo = incompleto ? " · datos incompletos" : "";
  return `${etiqueta} de ${personas}${sufijo}`;
}

function etiquetaAsiste(asiste: boolean | null): string {
  if (asiste === true) return "Asistirá";
  if (asiste === false) return "No asistirá";
  return "Sin dato";
}

export { etiquetaAsiste };

// Construye el detalle visible según el filtro y la búsqueda.
//
// Visibilidad de grupos:
// - "todas": todo grupo respondido con al menos una persona. Si todos sus
//   integrantes son `null`, el grupo sigue visible para no ocultar la
//   inconsistencia (sin filas de integrantes).
// - "asistiran" / "no-asistiran": solo grupos con al menos un integrante que
//   coincida con el filtro. Las inconsistencias globales se advierten aparte.
//
// Búsqueda: por título o por nombre de cualquier integrante; si coincide una
// persona se conserva el grupo completo (con los integrantes que permita el
// filtro activo). No anula el filtro.
export function construirDetalle(
  invitaciones: AsistenciaInvitacion[],
  filtro: FiltroAsistencia,
  busqueda: string
): ResumenDetalle {
  const consulta = normalizarTexto(busqueda);
  const hayInconsistencias = invitaciones.some((inv) =>
    inv.personas.some((persona) => persona.asiste === null)
  );

  const ordenadas = [...invitaciones].sort(compararInvitaciones);
  const grupos: GrupoResumen[] = [];

  for (const invitacion of ordenadas) {
    const totalPersonas = invitacion.personas.length;
    // Una invitación respondida sin personas no aporta nada al detalle.
    if (totalPersonas === 0) continue;

    const coincideBusqueda =
      consulta.length === 0 ||
      normalizarTexto(invitacion.titulo).includes(consulta) ||
      invitacion.personas.some((persona) =>
        normalizarTexto(persona.nombre).includes(consulta)
      );
    if (!coincideBusqueda) continue;

    let totalAsisten = 0;
    let totalNoAsisten = 0;
    let totalInconsistentes = 0;
    for (const persona of invitacion.personas) {
      if (persona.asiste === true) totalAsisten += 1;
      else if (persona.asiste === false) totalNoAsisten += 1;
      else totalInconsistentes += 1;
    }
    const tieneInconsistencia = totalInconsistentes > 0;

    const integrantesOrdenados = [...invitacion.personas].sort(
      compararPersonas
    );
    const integrantes: IntegranteResumen[] = integrantesOrdenados
      .filter((persona) => {
        if (filtro === "todas") return persona.asiste !== null;
        if (filtro === "asistiran") return persona.asiste === true;
        return persona.asiste === false;
      })
      .map((persona) => ({
        id: persona.id,
        nombre: persona.nombre,
        asiste: persona.asiste,
      }));

    // En "todas" el grupo siempre es visible; en los filtros de asistencia
    // solo si conserva al menos un integrante que coincide.
    const visible =
      filtro === "todas" ? true : integrantes.length > 0;
    if (!visible) continue;

    const resumenTexto =
      filtro === "todas"
        ? resumenTodas(totalAsisten, totalNoAsisten, tieneInconsistencia)
        : resumenFiltrado(
            filtro === "asistiran" ? totalAsisten : totalNoAsisten,
            totalPersonas,
            filtro === "no-asistiran",
            tieneInconsistencia
          );

    grupos.push({
      id: invitacion.id,
      titulo: invitacion.titulo,
      totalPersonas,
      totalAsisten,
      totalNoAsisten,
      totalInconsistentes,
      tieneInconsistencia,
      integrantes,
      resumenTexto,
    });
  }

  const totalPersonasVisibles = grupos.reduce(
    (suma, grupo) => suma + grupo.integrantes.length,
    0
  );

  return {
    grupos,
    totalGrupos: grupos.length,
    totalPersonas: totalPersonasVisibles,
    hayRespuestas: invitaciones.length > 0,
    hayInconsistencias,
  };
}

// Ordena las invitaciones sin responder por fecha de creación (creadaEn)
// ascendente, luego por título (es-MX, sin tildes) con desempate estable por id.
export function ordenarInvitacionesSinResponder(
  invitaciones: InvitacionSinResponder[]
): InvitacionSinResponder[] {
  return [...invitaciones].sort((a, b) => {
    const fechaA = a.creadaEn ? new Date(a.creadaEn).getTime() : 0;
    const fechaB = b.creadaEn ? new Date(b.creadaEn).getTime() : 0;
    if (fechaA !== fechaB) return fechaA - fechaB;

    const porTitulo = compararPorTexto(a.titulo, b.titulo);
    return porTitulo !== 0 ? porTitulo : a.id.localeCompare(b.id);
  });
}

export type FilaExportacion = {
  invitacion: string;
  persona: string;
  asistencia: string;
};

// Deriva las filas de exportación EXACTAMENTE de la vista visible que calcula
// `construirDetalle`: una fila por integrante visible, conservando el orden de
// grupos e integrantes. Las personas con `asiste === null` no aparecen (si no
// son fila visible en la UI, no se inventan al exportar) y nunca se convierten
// en negativa. No incluye invitaciones sin responder.
export function construirFilasExportacion(
  detalle: ResumenDetalle
): FilaExportacion[] {
  const filas: FilaExportacion[] = [];
  for (const grupo of detalle.grupos) {
    for (const integrante of grupo.integrantes) {
      if (integrante.asiste !== true && integrante.asiste !== false) continue;
      filas.push({
        invitacion: grupo.titulo,
        persona: integrante.nombre,
        asistencia: etiquetaAsiste(integrante.asiste),
      });
    }
  }
  return filas;
}
