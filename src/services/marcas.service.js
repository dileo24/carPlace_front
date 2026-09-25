import axios from "axios";

const MARCAS_URL = `${import.meta.env.VITE_API_URL}/marcas`;

// GET /marcas → catálogo completo (nombre + foto), fuente de verdad para el
// selector de autos, el carrusel y el filtro del catálogo público.
export const getMarcasCatalogo = async () => {
	const response = await axios.get(MARCAS_URL);
	return response.data;
};

// GET /marcas/:id/autos → autos cargados con esa marca (solo modelo + año)
export const getAutosPorMarca = async (id) => {
	const response = await axios.get(`${MARCAS_URL}/${id}/autos`);
	return response.data;
};

// POST /marcas → Body: { nombre, fotoUrl, fotoPublicId }
export const createMarca = async (data) => {
	const response = await axios.post(MARCAS_URL, data);
	return response.data;
};

// PUT /marcas/:id → Body: { nombre, fotoUrl?, fotoPublicId? }
export const updateMarca = async (id, data) => {
	const response = await axios.put(`${MARCAS_URL}/${id}`, data);
	return response.data;
};

// DELETE /marcas/:id
export const deleteMarca = async (id) => {
	const response = await axios.delete(`${MARCAS_URL}/${id}`);
	return response.data;
};
