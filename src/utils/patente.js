// Patente argentina: AA123BB (Mercosur) o ABC123 (vieja). Se aceptan 6–7
// caracteres alfanuméricos. Es opcional.
export const PATENTE_ERROR = "La patente debe tener 6 o 7 letras/números (ej: AB123CD o ABC123).";

export function normalizarPatente(valor) {
	return String(valor ?? "")
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, "");
}

// Devuelve "" si es válida (o vacía), o el mensaje de error.
export function validarPatente(valor) {
	const p = normalizarPatente(valor);
	if (!p) return "";
	return /^[A-Z0-9]{6,7}$/.test(p) ? "" : PATENTE_ERROR;
}
