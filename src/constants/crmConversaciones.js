// ─── ESTADOS ──────────────────────────────────────────────────────────────────
export const ESTADOS_CONVERSACION = {
	bot: {
		label: "Bot",
		color: "#3b82f6",
		bg: "rgba(59,130,246,0.12)",
	},
	asesor: {
		label: "Asesor",
		color: "#f97316",
		bg: "rgba(249,115,22,0.12)",
	},
	cerrada: {
		label: "Cerrada",
		color: "#6b7280",
		bg: "rgba(107,114,128,0.12)",
	},
};

// ─── CANALES ──────────────────────────────────────────────────────────────────
export const CANALES = ["WhatsApp", "Instagram"];

// ─── FILTROS ──────────────────────────────────────────────────────────────────
export const FILTROS_ESTADO = [
	{ value: "todos", label: "Todos" },
	{ value: "bot", label: "Bot" },
	{ value: "asesor", label: "Asesor" },
	{ value: "cerrada", label: "Cerradas" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function formatTiempoRelativo(isoString) {
	const fecha = new Date(isoString);
	const ahora = new Date();
	const diffMs = ahora - fecha;
	const diffMin = Math.floor(diffMs / 60000);
	const diffHrs = Math.floor(diffMs / 3600000);
	const diffDias = Math.floor(diffMs / 86400000);

	if (diffMin < 1) return "ahora";
	if (diffMin < 60) return `hace ${diffMin} min`;
	if (diffHrs < 24) return `hace ${diffHrs}h`;
	if (diffDias === 1) return "ayer";
	return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export function formatHora(timestamp) {
	if (!timestamp) return "";
	return new Date(timestamp).toLocaleTimeString("es-AR", {
		timeZone: "America/Argentina/Cordoba",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

const ZONA_HORARIA_LOCAL = "America/Argentina/Cordoba";

// Clave de día calendario en la zona horaria del negocio (Córdoba), sin
// importar en qué zona horaria esté configurado el navegador de quien mira
// el CRM — si no, "Hoy"/"Ayer" podían calcularse mal comparados contra la
// hora local de la PC del admin en vez de la del negocio.
function claveFechaLocal(fechaOTimestamp) {
	return new Date(fechaOTimestamp).toLocaleDateString("en-CA", { timeZone: ZONA_HORARIA_LOCAL });
}

export function formatSeparadorFecha(isoString) {
	const clave = claveFechaLocal(isoString);
	if (clave === claveFechaLocal(Date.now())) return "Hoy";
	if (clave === claveFechaLocal(Date.now() - 24 * 60 * 60 * 1000)) return "Ayer";
	return new Date(isoString).toLocaleDateString("es-AR", {
		timeZone: ZONA_HORARIA_LOCAL,
		day: "numeric",
		month: "long",
	});
}

export function getMensajesConSeparadores(mensajes) {
	const resultado = [];
	let ultimaFecha = null;

	for (const mensaje of mensajes) {
		const fechaActual = claveFechaLocal(mensaje.timestamp);
		if (fechaActual !== ultimaFecha) {
			resultado.push({
				id: `sep-${mensaje.id}`,
				tipo: "separador",
				label: formatSeparadorFecha(mensaje.timestamp),
			});
			ultimaFecha = fechaActual;
		}
		resultado.push(mensaje);
	}

	return resultado;
}

export function getMetricas(conversaciones, userId, esVendedor, esAdmin) {
	const activas = conversaciones.filter((c) => c.estado === "bot" || c.estado === "asesor").length;

	const sinAtender = conversaciones.filter((c) => (esAdmin ? c.adminNoLeido : c.noLeido > 0)).length;

	const misConversaciones = esVendedor ? conversaciones.filter((c) => String(c.asesorId) === String(userId)).length : null;

	return { activas, sinAtender, misConversaciones };
}

// Próxima visita agendada (pendiente/confirmada) cuya fecha aún no pasó.
// Visitas ya realizadas/canceladas o cuya fecha ya pasó no cuentan como "pendientes"
// para destacar — esas se ven reflejadas en el resumen/notas de la conversación.
export function getVisitaPendiente(conversacion) {
	const eventos = conversacion?.consulta?.eventos ?? [];
	if (!eventos.length) return null;

	const ahora = new Date();
	const futuras = eventos.filter((e) => {
		if (e.estado !== "pendiente" && e.estado !== "confirmada") return false;
		return new Date(`${e.fecha}T${e.horaInicio || "00:00"}`) >= ahora;
	});
	if (!futuras.length) return null;

	return [...futuras].sort(
		(a, b) => new Date(`${a.fecha}T${a.horaInicio || "00:00"}`) - new Date(`${b.fecha}T${b.horaInicio || "00:00"}`),
	)[0];
}

export function formatFechaCorta(fechaISO) {
	if (!fechaISO) return "";
	const [y, m, d] = fechaISO.split("-");
	return `${d}/${m}`;
}

export function formatTelefono(telefono) {
	if (!telefono) return "";
	const t = String(telefono).replace(/\D/g, "");

	if (t.startsWith("549") && t.length >= 12) {
		const sinPrefijo = t.slice(3); // quita 549
		const area = sinPrefijo.slice(0, 3); // 3 dígitos de área
		const parte1 = sinPrefijo.slice(3, 6); // siguientes 3
		const parte2 = sinPrefijo.slice(6); // resto
		return `+54 9 ${area} ${parte1} ${parte2}`;
	}

	return telefono;
}
