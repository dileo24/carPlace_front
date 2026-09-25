import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/autos`;

export const getAutosDestacados = async () => {
	try {
		const response = await axios.get(`${API_URL}/destacados`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const getAutos = async (filtros = {}) => {
	const params = new URLSearchParams();

	if (filtros.searchText) params.append("search", filtros.searchText);
	if (filtros.marca) params.append("marca", filtros.marca);
	if (filtros.categoria) params.append("categoria", filtros.categoria);
	if (filtros.anioDesde) params.append("anioDesde", filtros.anioDesde);
	if (filtros.anioHasta) params.append("anioHasta", filtros.anioHasta);
	if (filtros.transmision) params.append("transmision", filtros.transmision);
	if (filtros.combustible) params.append("combustible", filtros.combustible);
	if (filtros.traccion) params.append("traccion", filtros.traccion);
	if (filtros.color) params.append("color", filtros.color);
	if (filtros.oferta !== "" && filtros.oferta !== undefined) params.append("oferta", filtros.oferta);
	if (filtros.oferta_reventa !== "" && filtros.oferta_reventa !== undefined) params.append("oferta_reventa", filtros.oferta_reventa);
	if (filtros.kmDesde) params.append("kmDesde", filtros.kmDesde);
	if (filtros.kmHasta) params.append("kmHasta", filtros.kmHasta);
	if (filtros.precioDesde) params.append("precioDesde", filtros.precioDesde);
	if (filtros.precioHasta) params.append("precioHasta", filtros.precioHasta);
	if (filtros.orderBy) params.append("orderBy", filtros.orderBy);
	if (filtros.orderDir) params.append("orderDir", filtros.orderDir);
	if (filtros.visible !== undefined) params.append("visible", filtros.visible);
	if (filtros.condicion) params.append("condicion", filtros.condicion);
	if (filtros.tipo) params.append("tipo", filtros.tipo);
	if (filtros.en_alistaje !== undefined) params.append("en_alistaje", filtros.en_alistaje);

	const query = params.toString();
	const url = `${API_URL}/${query ? `?${query}` : ""}`;

	// Antes usaba fetch() directo, que NUNCA manda el JWT (el interceptor de
	// axios en AuthContext.jsx es lo único que lo agrega). Eso hacía que el
	// backend jamás viera req.user en esta llamada — daba lo mismo mientras
	// el filtro de "visible" dependía de un query param explícito, pero al
	// pasar a exigir sesión para ver autos ocultos (ver allAutos.js), Stock
	// (que reusa esta misma función) empezó a tratarse como visitante público
	// y perdía los autos ocultos de su propio listado interno.
	const response = await axios.get(url);
	return response.data;
};

export const getMarcas = async () => {
	try {
		const response = await axios.get(`${API_URL}/marcas`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const getAutoById = async (id) => {
	try {
		const response = await axios.get(`${API_URL}/${id}`);
		return response;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const getAutosRelacionados = async (idCateg) => {
	try {
		const response = await axios.post(`${API_URL}/relacionados`, {
			id_categ: idCateg.map(String),
		});
		return response.data.resp;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const postAuto = async (formData) => {
	try {
		const response = await axios.post(`${API_URL}`, formData);
		return response;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const postImagen = async (file) => {
	try {
		const response = await axios.post(`${import.meta.env.VITE_API_URL}/files`, file, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const updateAuto = async (id, data) => {
	try {
		const response = await axios.put(`${API_URL}/${id}`, data);
		return response;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const deleteAuto = async (id) => {
	try {
		const response = await axios.delete(`${API_URL}/${id}`);
		return response;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const updateImgInAuto = async (id, updatedImages) => {
	try {
		const response = await axios.put(`${API_URL}/${id}`, {
			img: updatedImages,
		});
		return response;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const syncTareasAlistaje = async (autoId, tareas) => {
	try {
		const response = await axios.put(`${API_URL}/${autoId}/tareas/sync`, { tareas });
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const toggleTareaAlistaje = async (autoId, tareaId, hecha) => {
	try {
		const response = await axios.patch(`${API_URL}/${autoId}/tareas/${tareaId}`, { hecha });
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};
