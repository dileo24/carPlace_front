export const categoria = [
	{ value: "", label: "Todas" },
	{ value: "SUV", label: "SUV" },
	{ value: "Pick Up", label: "Pick Up" },
	{ value: "Hatchback", label: "Hatchback" },
	{ value: "Sedán", label: "Sedán" },
	{ value: "Utilitario", label: "Utilitario" },
	{ value: "0km", label: "0km" },
	{ value: "Moto", label: "Moto" },
];

export const categoriaToCreate = [
	{ value: "1", label: "SUV" },
	{ value: "2", label: "Pick Up" },
	{ value: "6", label: "Utilitario" },
	{ value: "7", label: "0km" },
	{ value: "8", label: "Moto" },
	{ value: "10", label: "Sedán" },
	{ value: "11", label: "Hatchback" },
];

export const tiposCombustible = [
	{ value: "", label: "Todos" },
	{ value: "Nafta", label: "Nafta" },
	{ value: "Nafta/GNC", label: "Nafta/GNC" },
	{ value: "Diésel", label: "Diésel" },
	{ value: "Híbrido enchufable", label: "Híbrido enchufable" },
	{ value: "Híbrido auto recargable", label: "Híbrido auto recargable" },
	{ value: "Eléctrico", label: "Eléctrico" },
];

// Máximo de tipos de combustible que se pueden combinar en un mismo auto
// (ej. un híbrido que también tiene nafta) — ver EditSpecsGrid/NuevoAuto.
export const MAX_COMBUSTIBLES = 3;

// Separador genérico para combinar varios valores en un solo string guardado
// en BD (combustible, tracción, transmisión). Deliberadamente distinto de
// "/" porque ese caracter ya forma parte de una opción existente
// ("Nafta/GNC") — con " + " nunca hay ambigüedad al separar de nuevo los
// valores elegidos al editar un auto.
export const MULTI_SEPARADOR = " + ";
// Alias histórico — mismo separador, ya usado en varios lugares para combustible.
export const COMBUSTIBLE_SEPARADOR = MULTI_SEPARADOR;

// Versión legible para mostrar al público (Card/detalle) — "Nafta, Diésel y
// Eléctrico" en vez del " + " crudo que se usa solo para guardar en BD.
// Sirve para cualquier campo combinado (combustible, tracción, transmisión).
export function formatearLista(valor) {
	if (!valor) return valor;
	const partes = valor.split(MULTI_SEPARADOR).filter(Boolean);
	if (partes.length <= 1) return valor;
	if (partes.length === 2) return `${partes[0]} y ${partes[1]}`;
	return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}
export const formatearCombustible = formatearLista;

export const tiposTransmision = [
	{ value: "", label: "Todas" },
	{ value: "Manual", label: "Manual" },
	{ value: "Automática", label: "Automática" },
];
// Máximo de transmisiones combinables (ej. una versión que viene en Manual y
// Automática según el año) — igual criterio que combustible.
export const MAX_TRANSMISIONES = 2;

export const tiposTraccion = [
	{ value: "", label: "Todas" },
	{ value: "4x4", label: "4x4" },
	{ value: "4x2", label: "4x2" },
];
export const MAX_TRACCIONES = 2;

export const oferta = [
	{ value: "", label: "Todas" },
	{ value: true, label: "Sí" },
	{ value: false, label: "No" },
];

export const ordenamientos = [
	{ value: "precio-asc", label: "Precio: Menor a Mayor" },
	{ value: "precio-desc", label: "Precio: Mayor a Menor" },
];

export const tiposColor = [
  { value: "#000000", label: "Negro" },
  { value: "#FFFFFF", label: "Blanco" },
  { value: "#C0C0C0", label: "Plateado" },
  { value: "#808080", label: "Gris" },
  { value: "#FF0000", label: "Rojo" },
  { value: "#0000FF", label: "Azul" },
  { value: "#8B0000", label: "Bordó" },
  { value: "#7e4d0e", label: "Marrón" },
  { value: "#f1e7c6", label: "Crema" },
  { value: "#088a1e", label: "Verde" },
  { value: "#FFA500", label: "Naranja" },
  // No es un color real: para 0km donde el cliente elige el color al
  // pedirlo a fábrica. No tiene un hex propio — se muestra con un ícono
  // especial en los selects (ver COLOR_A_PEDIDO abajo).
  { value: "a_pedido", label: "A pedido" },
];

export const COLOR_A_PEDIDO = "a_pedido";