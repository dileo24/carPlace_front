// constants/crmStock.js
// ⚠️ Sin JSX — solo datos, constantes y helpers puros

// ---------------------------------------------------------------------------
// ESTADOS DE STOCK
// ---------------------------------------------------------------------------
export const ESTADOS_STOCK = [
	{ id: "disponible", label: "Disponible", color: "#4caf50" },
	{ id: "senado", label: "Señado", color: "#ffc107" },
	{
		id: "no_disponible",
		label: "No disponible",
		color: "#cc0000",
	},
];

export function getEstado(id) {
	return ESTADOS_STOCK.find((e) => e.id === id) || ESTADOS_STOCK[0];
}

export const TIPOS_OPCIONES = [
	{ id: "patrimonio", label: "Patrimonio propio" },
	{ id: "consignacion", label: "Consignación" },
	{ id: "consignacion_online", label: "Consignación online" },
];

export const CONDICION_OPCIONES = [
	{ id: "nuevo", label: "0 km" },
	{ id: "usado", label: "Usado" },
];

// ---------------------------------------------------------------------------
// TAREAS DE ALISTAJE (templates)
// ---------------------------------------------------------------------------
export const TAREAS_ALISTAJE_TEMPLATES = [
	"Actualizar precio en web",
	"Batería",
	"Cambiar 2 neumáticos",
	"Cambiar 4 neumáticos",
	"Cambio de aceite",
	"Carga de combustible",
	"Chapista",
	"Fotografía para publicación",
	"Patente",
	"Pintar llantas",
	"Pulido",
	"Pulido ópticas",
	"Revisión mecánica",
	"Tapizado",
	"Tasación",
	"Verificar documentación",
	"Volante",
];

/**
 * Merges la lista de autos del servicio con la meta local.
 * Cualquier auto sin meta recibe valores por defecto.
 */
export function mergeConMeta(autos, metaMap) {
	return autos.map((auto) => {
		const meta = metaMap[auto.id] || {
			estados: ["disponible"],
			esPatrimonio: false,
			enAlistaje: false,
			tareasAlistaje: [],
			notas: "",
		};
		return { ...auto, ...meta };
	});
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Capitaliza la primera letra de cada palabra */
export function titleCase(str) {
	if (!str) return "";
	return str
		.split(" ")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

/** Formatea precio con separadores de miles */
export function formatPrecio(moneda, precio) {
	if (!precio) return "—";
	return `${moneda || "$"} ${precio}`;
}

/** Genera ID de tarea */
export function generateTareaId() {
	return "ta-" + Date.now().toString().slice(-6);
}

// ---------------------------------------------------------------------------
// PROPUESTAS DE COMPRA MOCK (clientes que quieren vender su auto)
// ---------------------------------------------------------------------------
export const PROPUESTAS_MOCK = [
	{
		id: "PC001",
		clienteNombre: "Marcela",
		clienteApellido: "Fuentes",
		telefono: "+54 9 351 711-2233",
		vehiculo: "Renault Sandero 2020",
		km: "45.000",
		precio: "$12.000.000",
		fecha: "2026-05-14",
		estado: "pendiente",
	},
	{
		id: "PC002",
		clienteNombre: "Ariel",
		clienteApellido: "Coppola",
		telefono: "+54 9 351 855-4411",
		vehiculo: "Toyota Etios 2019",
		km: "88.000",
		precio: "$9.500.000",
		fecha: "2026-05-16",
		estado: "en revisión",
	},
	{
		id: "PC003",
		clienteNombre: "Natalia",
		clienteApellido: "Bravo",
		telefono: "+54 9 351 933-7788",
		vehiculo: "Chevrolet Onix 2021",
		km: "31.000",
		precio: "$17.200.000",
		fecha: "2026-05-17",
		estado: "pendiente",
	},
];

// ---------------------------------------------------------------------------
// VENTAS RECIENTES MOCK
// ---------------------------------------------------------------------------
// Historial de ventas cerradas del mes — montos independientes del inventario actual.
// El valor de patrimonio refleja los autos que AÚN están en stock;
// la facturación refleja los que ya se vendieron y salieron del inventario.
export const VENTAS_MOCK = [
	{
		id: "V001",
		vehiculo: "VW Taos Comfortline 2024",
		cliente: "Fernando Acosta",
		fecha: "2026-05-10",
		monto: "$38.500.000",
		tipo: "contado",
	},
	{
		id: "V002",
		vehiculo: "VW Polo Track 2023",
		cliente: "Camila Ibáñez",
		fecha: "2026-05-07",
		monto: "$22.000.000",
		tipo: "financiado",
	},
	{
		id: "V003",
		vehiculo: "Fiat Argo Drive 2022",
		cliente: "Leandro Pereyra",
		fecha: "2026-05-03",
		monto: "$18.900.000",
		tipo: "contado",
	},
	{
		id: "V004",
		vehiculo: "Renault Kangoo 2023",
		cliente: "Patricia Olmedo",
		fecha: "2026-05-01",
		monto: "$29.800.000",
		tipo: "financiado",
	},
];
