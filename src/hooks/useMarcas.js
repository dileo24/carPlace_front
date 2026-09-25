import { useState, useEffect } from "react";
import { getMarcasCatalogo } from "../services/marcas.service";

// Catálogo de marcas (nombre + foto) gestionado desde el módulo admin
// "Marcas" — reemplaza a la lista estática que antes vivía en data/marcas.js.
// Se pide fresco en cada componente que lo usa (sin cache global) para que un
// alta/edición/borrado hecho desde el admin se vea sin recargar la página.
export function useMarcas() {
	const [marcas, setMarcas] = useState([]);
	const [cargando, setCargando] = useState(true);

	useEffect(() => {
		let activo = true;
		getMarcasCatalogo()
			.then((data) => {
				if (activo) setMarcas(data?.resp ?? []);
			})
			.catch(() => {
				if (activo) setMarcas([]);
			})
			.finally(() => {
				if (activo) setCargando(false);
			});
		return () => {
			activo = false;
		};
	}, []);

	return { marcas, cargando };
}
