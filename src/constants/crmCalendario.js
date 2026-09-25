// constants/crmCalendario.js
// ⚠️ Sin JSX — solo datos, constantes y helpers puros

// ---------------------------------------------------------------------------
// COLORES SEMÁNTICOS
// ---------------------------------------------------------------------------
export const TIPO_COLORS = {
  visita: '#6495ed',
  llamada: '#ffc107',
  reunion: '#ce93d8',
  entrega: '#4caf50',
  mecanico: '#f97316',
  inspeccion: '#22d3ee',
  otro: '#94a3b8',
};

export const ESTADO_COLORS = {
  confirmada: '#4caf50',
  pendiente: '#ffc107',
  cancelada: '#6b7280',
  realizada: '#cc0000',
};

// ---------------------------------------------------------------------------
// LABELS
// ---------------------------------------------------------------------------
export const TIPO_LABELS = {
  visita: 'Visita',
  llamada: 'Llamada',
  reunion: 'Reunión',
  entrega: 'Entrega',
  mecanico: 'Mecánico',
  inspeccion: 'Inspección',
  otro: 'Otro',
};

export const ESTADO_LABELS = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
  realizada: 'Realizada',
};

// ---------------------------------------------------------------------------
// ASESORES MOCK
// ---------------------------------------------------------------------------
export const ASESORES_MOCK = [
  { id: 'todos', nombre: 'Todos' },
  { id: 'a1', nombre: 'Tomás Herrera' },
  { id: 'a2', nombre: 'Valentina Cruz' },
  { id: 'a3', nombre: 'Mateo Ríos' },
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Retorna los días del mes como array de objetos { date, isCurrentMonth } */
export function buildCalendarDays(year, month) {
  // month: 0-indexed (Date estándar)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Lunes como primer día de semana (0=lun…6=dom)
  let startDow = firstDay.getDay(); // 0=dom,1=lun…
  startDow = startDow === 0 ? 6 : startDow - 1; // convertir a lun-base

  const days = [];

  // Días del mes anterior
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }

  // Días del mes actual
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Días del mes siguiente para completar la grilla (múltiplo de 7)
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }
  }

  return days;
}

/** Formatea fecha Date → 'YYYY-MM-DD' */
export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Nombre del mes en español */
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
export function mesNombre(month) {
  return MESES[month];
}

/** Iniciales de un nombre completo */
export function getInitials(nombre, apellido) {
  return `${(nombre || '')[0] || ''}${(apellido || '')[0] || ''}`.toUpperCase();
}

/** Genera ID único simple para citas nuevas */
export function generateCitaId() {
  return 'CT' + Date.now().toString().slice(-6);
}
/**
 * Retorna true si el evento ya pasó (fecha < hoy) y no está finalizado
 * (estado !== 'realizada' && estado !== 'cancelada')
 */
export function isPasadoSinFinalizar(cita) {
  const today = toDateStr(new Date());
  return cita.fecha < today && cita.estado !== 'realizada' && cita.estado !== 'cancelada';
}