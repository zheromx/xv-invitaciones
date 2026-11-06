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
  mesa: number | null;
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
  mesa: number | null;
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
        mesa: persona.mesa,
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

// ---------------------------------------------------------------------------
// Filtro por mesa y listado agrupado por mesa (solo lectura).
// El ámbito de mesa es SIEMPRE: invitación respondida + persona asiste===true.
// Los declinados y las invitaciones sin responder nunca entran en "sin mesa".
// ---------------------------------------------------------------------------

export type FiltroMesa = "todas" | "sin-mesa" | `mesa:${number}`;

export function esFiltroMesa(valor: string): valor is FiltroMesa {
  if (valor === "todas" || valor === "sin-mesa") return true;
  const coincidencia = /^mesa:(\d+)$/.exec(valor);
  if (!coincidencia) return false;
  const numero = Number(coincidencia[1]);
  return Number.isInteger(numero) && numero > 0 && numero <= 2147483647;
}

export function numeroDeMesa(filtro: FiltroMesa): number | null {
  if (!filtro.startsWith("mesa:")) return null;
  return Number(filtro.slice(5));
}

// El filtro de mesa no aplica a las respuestas negativas. Se suspende sin
// borrar la selección para recuperarla al volver a un filtro compatible.
export function resolverFiltroMesaEfectivo(
  filtroAsistencia: FiltroAsistencia,
  filtroMesa: FiltroMesa
): FiltroMesa {
  return filtroAsistencia === "no-asistiran" ? "todas" : filtroMesa;
}

export type PestanaAsistencia = "asignar" | "listado";

// La pestaña "Listado por mesa" ignora el filtro de asistencia y usa siempre
// la selección de mesa tal cual; así se recupera al cambiar de pestaña.
export function resolverFiltroMesaVisible(
  pestana: PestanaAsistencia,
  filtroAsistencia: FiltroAsistencia,
  filtroMesa: FiltroMesa
): FiltroMesa {
  return pestana === "asignar"
    ? resolverFiltroMesaEfectivo(filtroAsistencia, filtroMesa)
    : filtroMesa;
}

// La exportación existente solo conoce el filtro de asistencia y la búsqueda;
// se deshabilita cuando el filtro de mesa efectivo restringe la vista.
export function exportacionHabilitada(
  filtroMesaEfectivo: FiltroMesa,
  totalPersonas: number
): boolean {
  return filtroMesaEfectivo === "todas" && totalPersonas > 0;
}

// Opciones derivadas de TODOS los asistentes confirmados cargados (no de los
// resultados de búsqueda), en orden numérico.
export function derivarOpcionesMesa(
  invitaciones: AsistenciaInvitacion[]
): number[] {
  const mesas = new Set<number>();
  for (const invitacion of invitaciones) {
    for (const persona of invitacion.personas) {
      if (persona.asiste === true && persona.mesa !== null) {
        mesas.add(persona.mesa);
      }
    }
  }
  return [...mesas].sort((a, b) => a - b);
}

// Conserva temporalmente la opción seleccionada aunque ya no tenga integrantes
// (p. ej. tras reasignar al último asistente de esa mesa). No restablece nada.
export function opcionesMesaConSeleccion(
  opciones: number[],
  filtroMesa: FiltroMesa
): number[] {
  const numero = numeroDeMesa(filtroMesa);
  if (numero === null || opciones.includes(numero)) return opciones;
  return [...opciones, numero].sort((a, b) => a - b);
}

function resumenMesaFiltrada(cantidad: number, numero: number | null): string {
  const personas = cantidad === 1 ? "1 persona" : `${cantidad} personas`;
  return numero === null
    ? `${personas} sin mesa asignada`
    : `${personas} en esta mesa`;
}

// Filtra el detalle de asistencia por mesa sin tocar `construirDetalle`.
// Con "todas" devuelve la MISMA instancia para conservar exactamente el
// comportamiento, el orden y las alertas actuales.
export function filtrarDetallePorMesa(
  detalle: ResumenDetalle,
  filtroMesa: FiltroMesa
): ResumenDetalle {
  if (filtroMesa === "todas") return detalle;

  const numero = numeroDeMesa(filtroMesa);
  const grupos: GrupoResumen[] = [];

  for (const grupo of detalle.grupos) {
    const integrantes = grupo.integrantes.filter(
      (persona) => persona.asiste === true && persona.mesa === numero
    );
    if (integrantes.length === 0) continue;

    grupos.push({
      ...grupo,
      totalPersonas: integrantes.length,
      totalAsisten: integrantes.length,
      totalNoAsisten: 0,
      totalInconsistentes: 0,
      tieneInconsistencia: false,
      integrantes,
      resumenTexto: resumenMesaFiltrada(integrantes.length, numero),
    });
  }

  return {
    grupos,
    totalGrupos: grupos.length,
    totalPersonas: grupos.reduce(
      (suma, grupo) => suma + grupo.integrantes.length,
      0
    ),
    hayRespuestas: detalle.hayRespuestas,
    hayInconsistencias: detalle.hayInconsistencias,
  };
}

export type PersonaListadoMesa = {
  id: string;
  nombre: string;
};

export type GrupoListadoMesa = {
  id: string;
  titulo: string;
  totalPersonas: number;
  personas: PersonaListadoMesa[];
};

export type MesaListado = {
  mesa: number | null;
  totalPersonas: number;
  totalGrupos: number;
  grupos: GrupoListadoMesa[];
};

export type ResumenListadoMesas = {
  mesas: MesaListado[];
  sinMesa: MesaListado | null;
  hayRespuestas: boolean;
  hayAsistentes: boolean;
  filtrosActivos: boolean;
  mesasVisibles: number;
  personasVisibles: number;
  personasSinMesaVisibles: number;
  mesasConAsignacion: number;
  personasAsignadas: number;
  asistentesSinMesa: number;
};

type GrupoCompleto = {
  id: string;
  titulo: string;
  personas: PersonaListadoMesa[];
};

function compararGruposListado(a: GrupoCompleto, b: GrupoCompleto): number {
  const porTitulo = compararPorTexto(a.titulo, b.titulo);
  return porTitulo !== 0 ? porTitulo : a.id.localeCompare(b.id);
}

function compararPersonasListado(
  a: PersonaListadoMesa,
  b: PersonaListadoMesa
): number {
  const porNombre = compararPorTexto(a.nombre, b.nombre);
  return porNombre !== 0 ? porNombre : a.id.localeCompare(b.id);
}

function construirMesaListado(
  mesa: number | null,
  gruposCompletos: GrupoCompleto[],
  consulta: string
): MesaListado | null {
  const grupos: GrupoListadoMesa[] = [];

  for (const grupo of gruposCompletos) {
    const coincide =
      consulta.length === 0 ||
      normalizarTexto(grupo.titulo).includes(consulta) ||
      grupo.personas.some((persona) =>
        normalizarTexto(persona.nombre).includes(consulta)
      );
    if (!coincide) continue;

    const personas = [...grupo.personas].sort(compararPersonasListado);
    grupos.push({
      id: grupo.id,
      titulo: grupo.titulo,
      totalPersonas: personas.length,
      personas,
    });
  }

  if (grupos.length === 0) return null;
  grupos.sort(compararGruposListado);

  return {
    mesa,
    totalPersonas: grupos.reduce(
      (suma, grupo) => suma + grupo.totalPersonas,
      0
    ),
    totalGrupos: grupos.length,
    grupos,
  };
}

// Listado de solo lectura agrupado por mesa y luego por Invitacion.id. Parte de
// TODOS los asistentes confirmados cargados; la búsqueda se evalúa por grupo
// dentro de cada mesa, de modo que un grupo nunca arrastra integrantes de otra
// mesa. No muta las entradas.
export function construirListadoMesas(
  invitaciones: AsistenciaInvitacion[],
  filtroMesa: FiltroMesa,
  busqueda: string
): ResumenListadoMesas {
  const consulta = normalizarTexto(busqueda);
  const filtrosActivos = filtroMesa !== "todas" || consulta.length > 0;

  let personasAsignadas = 0;
  let asistentesSinMesa = 0;
  const mesasConAsignacion = new Set<number>();

  for (const invitacion of invitaciones) {
    for (const persona of invitacion.personas) {
      if (persona.asiste !== true) continue;
      if (persona.mesa === null) {
        asistentesSinMesa += 1;
      } else {
        personasAsignadas += 1;
        mesasConAsignacion.add(persona.mesa);
      }
    }
  }

  const hayAsistentes = personasAsignadas + asistentesSinMesa > 0;

  const porMesa = new Map<number | null, Map<string, GrupoCompleto>>();
  for (const invitacion of invitaciones) {
    for (const persona of invitacion.personas) {
      if (persona.asiste !== true) continue;

      let grupos = porMesa.get(persona.mesa);
      if (!grupos) {
        grupos = new Map();
        porMesa.set(persona.mesa, grupos);
      }
      let grupo = grupos.get(invitacion.id);
      if (!grupo) {
        grupo = {
          id: invitacion.id,
          titulo: invitacion.titulo,
          personas: [],
        };
        grupos.set(invitacion.id, grupo);
      }
      grupo.personas.push({ id: persona.id, nombre: persona.nombre });
    }
  }

  const mesas: MesaListado[] = [];
  let sinMesa: MesaListado | null = null;

  if (filtroMesa === "todas") {
    const numeros = [...porMesa.keys()]
      .filter((mesa): mesa is number => mesa !== null)
      .sort((a, b) => a - b);
    for (const numero of numeros) {
      const mesa = construirMesaListado(
        numero,
        [...(porMesa.get(numero)?.values() ?? [])],
        consulta
      );
      if (mesa) mesas.push(mesa);
    }
  } else if (filtroMesa !== "sin-mesa") {
    const numero = numeroDeMesa(filtroMesa);
    if (numero !== null) {
      const mesa = construirMesaListado(
        numero,
        [...(porMesa.get(numero)?.values() ?? [])],
        consulta
      );
      if (mesa) mesas.push(mesa);
    }
  }

  if (filtroMesa === "todas" || filtroMesa === "sin-mesa") {
    sinMesa = construirMesaListado(
      null,
      [...(porMesa.get(null)?.values() ?? [])],
      consulta
    );
  }

  const personasEnMesas = mesas.reduce(
    (suma, mesa) => suma + mesa.totalPersonas,
    0
  );
  const personasSinMesaVisibles = sinMesa?.totalPersonas ?? 0;

  return {
    mesas,
    sinMesa,
    hayRespuestas: invitaciones.length > 0,
    hayAsistentes,
    filtrosActivos,
    mesasVisibles: mesas.length,
    personasVisibles: personasEnMesas + personasSinMesaVisibles,
    personasSinMesaVisibles,
    mesasConAsignacion: mesasConAsignacion.size,
    personasAsignadas,
    asistentesSinMesa,
  };
}
