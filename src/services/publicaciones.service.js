import axios from "axios";

const PUBLICACIONES_URL = `${import.meta.env.VITE_API_URL}/publicaciones`;

// GET /publicaciones?autoId= → lista completa o filtrada por auto
export const getPublicaciones = async (autoId) => {
	const params = autoId ? { autoId } : {};
	const response = await axios.get(PUBLICACIONES_URL, { params });
	return response.data;
};

// GET /publicaciones/cupo → { gold, silver } disponibles este mes
export const getCupoPublicaciones = async () => {
	const response = await axios.get(`${PUBLICACIONES_URL}/cupo`);
	return response.data;
};

// GET /publicaciones/autos-publicados → [autoId, autoId, ...] con publicación
// activa/pausada en MercadoLibre — liviano, para el badge "ML" del Stock.
export const getAutosPublicadosIds = async () => {
	const response = await axios.get(`${PUBLICACIONES_URL}/autos-publicados`);
	return response.data;
};

// POST /publicaciones → Body: { autoId, titulo?, descripcion? }
export const crearPublicacion = async (data) => {
	const response = await axios.post(PUBLICACIONES_URL, data);
	return response.data;
};

// PUT /publicaciones/:id/pausar
export const pausarPublicacion = async (id) => {
	const response = await axios.put(`${PUBLICACIONES_URL}/${id}/pausar`);
	return response.data;
};

// PUT /publicaciones/:id/cerrar
export const cerrarPublicacion = async (id) => {
	const response = await axios.put(`${PUBLICACIONES_URL}/${id}/cerrar`);
	return response.data;
};

// PUT /publicaciones/:id/eliminar
export const eliminarPublicacion = async (id) => {
	const response = await axios.put(`${PUBLICACIONES_URL}/${id}/eliminar`);
	return response.data;
};

// PUT /publicaciones/:id/reactivar
export const reactivarPublicacion = async (id) => {
	const response = await axios.put(`${PUBLICACIONES_URL}/${id}/reactivar`);
	return response.data;
};

// POST /publicaciones/:id/republicar
export const republicarPublicacion = async (id) => {
	const response = await axios.post(`${PUBLICACIONES_URL}/${id}/republicar`);
	return response.data;
};

// DELETE /publicaciones/:id — borra el registro (solo si ya está "eliminada")
export const borrarRegistroPublicacion = async (id) => {
	const response = await axios.delete(`${PUBLICACIONES_URL}/${id}`);
	return response.data;
};
