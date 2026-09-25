import { createContext, useState, useEffect, useContext } from "react";

const FiltrosContext = createContext();

// Única fuente de verdad para el estado "sin filtros" — usada acá y en
// cualquier vista que necesite resetear/inicializar (Home, Filtros).
export const getFiltrosVacios = () => ({
	anioDesde: "",
	anioHasta: "",
	kmDesde: "",
	kmHasta: "",
	precioDesde: "",
	precioHasta: "",
	transmision: "",
	combustible: "",
	traccion: "",
	categoria: "",
	color: "",
	marca: "",
	oferta: "",
	ordenamiento: "",
	searchText: "",
});

export const FiltrosProvider = ({ children }) => {
	const cargarFiltrosIniciales = () => {
		if (typeof window !== "undefined") {
			try {
				const guardados = localStorage.getItem("catalogoFilters");
				return guardados ? JSON.parse(guardados) : getFiltrosVacios();
			} catch {
				return getFiltrosVacios();
			}
		}
		return getFiltrosVacios();
	};

	const [filtros, _setFiltros] = useState(cargarFiltrosIniciales());

	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("catalogoFilters", JSON.stringify(filtros));
		}
	}, [filtros]);

	const setFiltros = (nuevosFiltros) => {
		_setFiltros(nuevosFiltros);
	};

	return (
		<FiltrosContext.Provider value={{ filtros, setFiltros }}>
			{children}
		</FiltrosContext.Provider>
	);
};

export const useFiltros = () => useContext(FiltrosContext);
