import { useMemo } from "react";
import { tiposColor, tiposCombustible, tiposTransmision, categoria, COMBUSTIBLE_SEPARADOR } from "../data/filters";

export function useOpcionesDisponibles(todosLosAutos = [], dolarBlue = null, marcasCatalogo = []) {
	return useMemo(() => {
		if (!todosLosAutos.length) return null;

		// Marcas disponibles — solo las del catálogo (nombre + foto) que
		// efectivamente tienen algún auto cargado.
		const marcasSet = new Set(todosLosAutos.map((a) => a.marca?.toLowerCase()));
		const marcasDisponibles = [
			{ value: "", label: "Todas las marcas" },
			...marcasCatalogo.filter((m) => marcasSet.has(m.nombre.toLowerCase())).map((m) => ({ value: m.nombre, label: m.nombre })),
		];

		// Colores disponibles — el auto trae hex directamente
		const coloresSet = new Set(todosLosAutos.map((a) => a.color?.toUpperCase()).filter(Boolean));
		const coloresDisponibles = tiposColor.filter((c) => coloresSet.has(c.value.toUpperCase()));

		// Combustibles disponibles — un auto puede tener hasta 2 combinados
		// (ej. "Nafta + Eléctrico"), así que hay que separarlos antes de
		// comparar. El separador " + " nunca choca con "Nafta/GNC" (que es una
		// sola opción legacy con "/" adentro), así que ese combo queda intacto.
		const combustiblesSet = new Set(
			todosLosAutos.flatMap((a) => (a.combustible || "").split(COMBUSTIBLE_SEPARADOR)),
		);
		const combustiblesDisponibles = tiposCombustible.filter((c) => c.value === "" || combustiblesSet.has(c.value));

		// Transmisiones disponibles — mismo criterio que combustible: un auto
		// puede tener más de una combinada.
		const transmisionesSet = new Set(
			todosLosAutos.flatMap((a) => (a.transmision || "").split(COMBUSTIBLE_SEPARADOR)),
		);
		const transmisionesDisponibles = tiposTransmision.filter((t) => t.value === "" || transmisionesSet.has(t.value));

		// Categorías — viene como array de objetos [{ id, categ }]
		const categoriasSet = new Set(todosLosAutos.flatMap((a) => (a.categorias ?? []).map((c) => c.categ)));
		const categoriasDisponibles = categoria.filter((c) => c.value === "" || categoriasSet.has(c.value));

		// Años
		const anios = todosLosAutos.map((a) => Number(a.anio)).filter(Boolean);
		const anioMin = Math.min(...anios);
		const anioMax = Math.max(...anios);

		// Un auto sin precio ("Consultar precio") no debería arrastrar el
		// mínimo del slider a $0 — se excluye del cálculo del rango.
		const precios = todosLosAutos
			.filter((a) => a.oferta ? a.precio_oferta : a.precio)
			.map((a) => {
				const raw = String(a.oferta ? a.precio_oferta : a.precio).replace(/\./g, "");
				const base = parseInt(raw, 10) || 0;
				return a.moneda === "U$D" && dolarBlue ? base * dolarBlue : base;
			});
		const precioMin = precios.length ? Math.min(...precios) : 0;
		const precioMax = precios.length ? Math.max(...precios) : 100_000_000;

		// KM — viene como "85.000", hay que sacar los puntos
		const kms = todosLosAutos.map((a) => parseInt(String(a.km).replace(/\./g, ""), 10)).filter((n) => !isNaN(n));
		const kmMin = Math.min(...kms);
		const kmMax = Math.max(...kms);

		return {
			marcasDisponibles,
			coloresDisponibles,
			combustiblesDisponibles,
			transmisionesDisponibles,
			categoriasDisponibles,
			anioMin,
			anioMax,
			precioMin,
			precioMax,
			kmMin,
			kmMax,
		};
	}, [todosLosAutos, dolarBlue, marcasCatalogo]);
}
