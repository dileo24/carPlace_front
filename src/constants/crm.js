export const PIPELINE_ESTADOS = ["nuevo", "con_oferta", "seguimiento", "cerrado", "perdido"];

export const ESTADOS = ["todos", ...PIPELINE_ESTADOS];

export const ESTADO_LABEL = {
	todos: "Todos los estados",
	nuevo: "Nuevo",
	con_oferta: "Con oferta",
	seguimiento: "Seguimiento",
	cerrado: "Cerrado",
	perdido: "Perdido",
};

export const ESTADO_COLOR = {
	nuevo: "#6495ed",
	con_oferta: "#ce93d8",
	seguimiento: "#ff9800",
	cerrado: "#4caf50",
	perdido: "#6b7280",
};

export const ORIGENES = ["WhatsApp", "Instagram", "Facebook", "Web", "Teléfono", "Presencial", "Referido", "Otro"];

export const ORIGENES_FORM = ORIGENES;

export const FORMAS_PAGO = ["contado", "financiado", "usado", "a_definir"];
export const FORMAS_PAGO_LABEL = {
	contado: "Contado",
	financiado: "Financiado",
	usado: "Entrega usado",
	a_definir: "A definir",
};

export const CATEGORIAS = [
	{ value: "SUV", label: "SUV" },
	{ value: "Pick Up", label: "Pick Up" },
	{ value: "Sedán", label: "Sedán" },
	{ value: "Hatchback", label: "Hatchback" },
	{ value: "Utilitario", label: "Utilitario" },
	{ value: "0km", label: "0 km" },
];

export const BADGE_TOOLTIP = {
	estado: "Estado actual en el proceso comercial",
	origen: "Canal por el que llegó la consulta",
	calificado: "Consulta validada como interés real",
	manual: "Cargada manualmente por un asesor",
};

export const HISTORIAL_ICON = {
	whatsapp: "💬",
	llamada: "📞",
	visita: "🤝",
	respuesta: "✉️",
	facebook: "👍",
	instagram: "📸",
	sistema: "⚙️",
	otro: "📌",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export function origenKey(origen) {
	if (!origen) return "otro";
	return origen.toLowerCase().replace(/\s+/g, "").replace(/é/g, "e").replace(/ó/g, "o");
}

const CARGADO_POR_LABEL = {
	bot: "Bot",
	admin: "Admin",
	usuario: "Asesor",
};

export function formatAsesor(consultaONombre, apellido) {
	if (consultaONombre && typeof consultaONombre === "object") {
		const { asesorNombre, asesorApellido, cargadoPor } = consultaONombre;
		if (asesorNombre) {
			return asesorApellido ? `${asesorNombre} ${asesorApellido}` : asesorNombre;
		}
		return `Cargada por ${CARGADO_POR_LABEL[cargadoPor] || "desconocido"}`;
	}

	if (!consultaONombre) return "Sin asignar";
	return apellido ? `${consultaONombre} ${apellido}` : consultaONombre;
}

export function formatFechaCorta(fecha) {
	if (!fecha) return "—";
	const d = new Date(fecha);
	return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function formatFechaLarga(fecha) {
	if (!fecha) return "—";
	const d = new Date(fecha);
	return d.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatPresupuesto(n) {
	if (!n) return "—";
	return `USD ${Number(n).toLocaleString("es-AR")}`;
}

export function todayISO() {
	return new Date().toISOString().split("T")[0];
}

export function genId() {
	return `C${Date.now()}`;
}

// Asesores — en producción vendrían de la API de usuarios
export const ASESORES = [];
