import { formatearLista } from "../../../data/filters";

export const DASH = "—";

export function cap(s) {
	if (!s) return "";
	return String(s)
		.split(" ")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

export function formatMonto(n) {
	if (n === null || n === undefined || n === "") return null;
	return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Snapshot del auto vendido (sin fotos). null en ventas anteriores.
export function getAutoDatos(venta) {
	let d = venta?.autoDatos;
	if (typeof d === "string") {
		try {
			d = JSON.parse(d);
		} catch {
			d = null;
		}
	}
	return d && typeof d === "object" ? d : null;
}

export function tituloVehiculo(venta) {
	const d = getAutoDatos(venta);
	if (d && (d.marca || d.modelo)) {
		return [cap(d.marca), d.modelo, d.anio].filter(Boolean).join(" ");
	}
	return venta?.vehiculoVendido || DASH;
}

export function valorOGuion(v, suffix = "") {
	if (v === null || v === undefined || v === "") return DASH;
	return `${v}${suffix}`;
}

export function listaOGuion(v) {
	return v ? formatearLista(v) : DASH;
}
