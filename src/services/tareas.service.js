import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/tareas`;

export const getTareas = async (filtros = {}) => {
	try {
		const params = new URLSearchParams();
		if (filtros.estado) params.append("estado", filtros.estado);
		if (filtros.prioridad) params.append("prioridad", filtros.prioridad);
		if (filtros.tipo) params.append("tipo", filtros.tipo);
		if (filtros.creadoPor) params.append("creadoPor", filtros.creadoPor);
		if (filtros.search) params.append("search", filtros.search);
		if (filtros.orderBy) params.append("orderBy", filtros.orderBy);
		if (filtros.orderDir) params.append("orderDir", filtros.orderDir);

		const query = params.toString();
		const response = await axios.get(`${API_URL}${query ? `?${query}` : ""}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const getTareaById = async (id) => {
	try {
		const response = await axios.get(`${API_URL}/${id}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const createTarea = async (data) => {
	try {
		const response = await axios.post(API_URL, data);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const updateTarea = async (id, data) => {
	try {
		const response = await axios.put(`${API_URL}/${id}`, data);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const deleteTarea = async (id) => {
	try {
		const response = await axios.delete(`${API_URL}/${id}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};
