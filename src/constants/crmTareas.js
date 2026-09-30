// constants/crmTareas.js

export const ESTADOS = ["pendiente", "en_progreso", "completada", "cancelada"];

export const PRIORIDADES = ["alta", "media", "baja"];

export const TIPOS = ["papeles", "administrativo", "alistaje", "fotos_publicar", "contactar", "seguimiento"];

export const PRIORIDAD_COLORS = {
	alta: "#cc0000",
	media: "#ffc107",
	baja: "#4caf50",
};

export const ESTADO_COLORS = {
	pendiente: "#ffc107",
	en_progreso: "#6495ed",
	completada: "#4caf50",
	cancelada: "#6b7280",
};

export const TIPO_COLORS = {
	papeles: "#ce93d8",
	administrativo: "#6495ed",
	alistaje: "#f97316",
	fotos_publicar: "#22d3ee",
	contactar: "#ffc107",
	seguimiento: "#4caf50",
};

export const ESTADO_LABELS = {
	pendiente: "Pendiente",
	en_progreso: "En progreso",
	completada: "Completada",
	cancelada: "Cancelada",
};

export const TIPO_LABELS = {
	papeles: "Papeles",
	administrativo: "Administrativo",
	alistaje: "Alistaje",
	fotos_publicar: "Fotos / Publicar",
	contactar: "Contactar",
	seguimiento: "Seguimiento",
};

export const PRIORIDAD_LABELS = {
	alta: "Alta",
	media: "Media",
	baja: "Baja",
};

export const TAREAS_MOCK = [
	{
		id: "T001",
		titulo: "Preparar cotización para Ferreyra",
		descripcion: "Armar propuesta con financiación a 36 cuotas y opción de toma de usado.",
		tipo: "comercial",
		prioridad: "alta",
		estado: "pendiente",
		fechaVencimiento: "2026-05-20",
		creadoEn: "2026-05-17T09:00:00Z",
		creadoPor: "usuario",
		notas: [],
	},
	{
		id: "T002",
		titulo: "Llamar a Morales por test drive",
		descripcion: "Confirmar turno para prueba de manejo del Amarok V6.",
		tipo: "llamada",
		prioridad: "alta",
		estado: "pendiente",
		fechaVencimiento: "2026-05-16",
		creadoEn: "2026-05-14T11:30:00Z",
		creadoPor: "bot",
		notas: [{ id: "n1", texto: "El cliente prefiere mañana a la tarde.", autor: "Valentina Cruz", creadoEn: "2026-05-14T12:00:00Z" }],
	},
	{
		id: "T003",
		titulo: "Gestionar patentamiento Sánchez",
		descripcion: "Tramitar documentación ante el registro para transferencia del vehículo entregado.",
		tipo: "administrativa",
		prioridad: "media",
		estado: "en_progreso",
		fechaVencimiento: "2026-05-22",
		creadoEn: "2026-05-15T08:00:00Z",
		creadoPor: "usuario",
		notas: [{ id: "n2", texto: "Falta el formulario 08.", autor: "Tomás Herrera", creadoEn: "2026-05-15T09:00:00Z" }],
	},
	{
		id: "T004",
		titulo: "Alistaje unidad para entrega",
		descripcion: "Preparar Nivus para entrega el viernes: lavado, llenado de combustible y verificación de accesorios.",
		tipo: "alistaje",
		prioridad: "alta",
		estado: "en_progreso",
		fechaVencimiento: "2026-05-23",
		creadoEn: "2026-05-16T10:00:00Z",
		creadoPor: "usuario",
		notas: [],
	},
	{
		id: "T005",
		titulo: "Seguimiento post-venta Rodríguez",
		descripcion: "Contactar al cliente para encuesta de satisfacción a los 30 días de la entrega.",
		tipo: "seguimiento",
		prioridad: "baja",
		estado: "pendiente",
		fechaVencimiento: "2026-05-30",
		creadoEn: "2026-05-01T14:00:00Z",
		creadoPor: "bot",
		notas: [],
	},
	{
		id: "T006",
		titulo: "Actualizar catálogo de precios",
		descripcion: "Revisar y actualizar lista de precios vigente en el sistema tras ajuste de mayo.",
		tipo: "administrativa",
		prioridad: "media",
		estado: "completada",
		fechaVencimiento: "2026-05-10",
		creadoEn: "2026-05-05T09:00:00Z",
		creadoPor: "usuario",
		notas: [{ id: "n3", texto: "Actualizado con valores al 08/05.", autor: "Tomás Herrera", creadoEn: "2026-05-10T10:00:00Z" }],
	},
	{
		id: "T007",
		titulo: "Enviar propuesta financiación Gómez",
		descripcion: "Preparar y enviar comparativa de planes de financiación disponibles.",
		tipo: "comercial",
		prioridad: "alta",
		estado: "completada",
		fechaVencimiento: "2026-05-12",
		creadoEn: "2026-05-08T16:00:00Z",
		creadoPor: "usuario",
		notas: [{ id: "n4", texto: "Enviada por WhatsApp y email.", autor: "Mateo Ríos", creadoEn: "2026-05-12T11:00:00Z" }],
	},
	{
		id: "T008",
		titulo: "Reunión con proveedor de accesorios",
		descripcion: "Acordar condiciones para pedido de accesorios OEM del mes de junio.",
		tipo: "otro",
		prioridad: "baja",
		estado: "cancelada",
		fechaVencimiento: "2026-05-08",
		creadoEn: "2026-05-03T11:00:00Z",
		creadoPor: "usuario",
		notas: [{ id: "n5", texto: "Cancelada por ausencia del proveedor.", autor: "Valentina Cruz", creadoEn: "2026-05-08T14:00:00Z" }],
	},
	{
		id: "T009",
		titulo: "Llamar a Pereyra — recordatorio cuota",
		descripcion: "Avisar al cliente que la cuota 3 vence en 5 días.",
		tipo: "llamada",
		prioridad: "media",
		estado: "pendiente",
		fechaVencimiento: "2026-05-13",
		creadoEn: "2026-05-12T08:30:00Z",
		creadoPor: "bot",
		notas: [],
	},
	{
		id: "T010",
		titulo: "Seguimiento lead Ibáñez",
		descripcion: "Retomar contacto con prospecto que visitó el salón la semana pasada.",
		tipo: "seguimiento",
		prioridad: "alta",
		estado: "pendiente",
		fechaVencimiento: "2026-05-15",
		creadoEn: "2026-05-13T10:00:00Z",
		creadoPor: "usuario",
		notas: [{ id: "n6", texto: "Muy interesado, frenó por el precio.", autor: "Mateo Ríos", creadoEn: "2026-05-13T10:30:00Z" }],
	},
	{
		id: "T011",
		titulo: "Preparar informe de ventas mensual",
		descripcion: "Consolidar métricas de mayo para presentar al gerente.",
		tipo: "administrativa",
		prioridad: "media",
		estado: "en_progreso",
		fechaVencimiento: "2026-05-31",
		creadoEn: "2026-05-17T07:00:00Z",
		creadoPor: "usuario",
		notas: [],
	},
	{
		id: "T012",
		titulo: "Verificar stock para entrega Vera",
		descripcion: "Confirmar disponibilidad del color solicitado antes de firmar el contrato.",
		tipo: "alistaje",
		prioridad: "alta",
		estado: "pendiente",
		fechaVencimiento: "2026-05-14",
		creadoEn: "2026-05-13T15:00:00Z",
		creadoPor: "usuario",
		notas: [{ id: "n7", texto: "Requiere color blanco platino.", autor: "Tomás Herrera", creadoEn: "2026-05-13T15:30:00Z" }],
	},
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getMetrics(tareas) {
	const total = tareas.length;
	const completadas = tareas.filter((t) => t.estado === "completada").length;
	const pendientes = tareas.filter((t) => t.estado === "pendiente").length;
	return { total, completadas, pendientes, vencidas: 0 };
}

export function filterTareas(tareas, { prioridad, tipo }) {
	return tareas.filter((t) => {
		if (prioridad && prioridad !== "todas" && t.prioridad !== prioridad) return false;
		if (tipo && tipo !== "todos" && t.tipo !== tipo) return false;
		return true;
	});
}

export function sortByCreacion(tareas, orden = "desc") {
	return [...tareas].sort((a, b) => {
		const da = new Date(a.creadoEn).getTime();
		const db = new Date(b.creadoEn).getTime();
		return orden === "asc" ? da - db : db - da;
	});
}

// Orden automático: prioridad alta → media → baja; a igual prioridad, la más reciente primero.
const PESO_PRIORIDAD = { alta: 0, media: 1, baja: 2 };
export function sortByPrioridad(tareas) {
	return [...tareas].sort((a, b) => {
		const pa = PESO_PRIORIDAD[a.prioridad] ?? 1;
		const pb = PESO_PRIORIDAD[b.prioridad] ?? 1;
		if (pa !== pb) return pa - pb;
		return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
	});
}

// Alias para no romper imports existentes (Tareas.jsx llama sortByVencimiento)
export const sortByVencimiento = sortByCreacion;

export function getNextEstados(estadoActual) {
	const map = {
		pendiente: ["en_progreso", "cancelada"],
		en_progreso: ["completada", "cancelada"],
		completada: [],
		cancelada: [],
	};
	return map[estadoActual] ?? [];
}

export const ACCION_LABELS = {
	en_progreso: "Iniciar",
	completada: "Completar",
	cancelada: "Cancelar",
};

export const KANBAN_COLUMNS = [
	{ key: "pendiente", label: "Pendiente" },
	{ key: "en_progreso", label: "En progreso" },
	{ key: "completada", label: "Completada" },
	{ key: "cancelada", label: "Cancelada" },
];
