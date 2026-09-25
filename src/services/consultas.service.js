import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/consultas`;

export const getConsultas = async (filtros = {}) => {
	try {
		const params = new URLSearchParams();
		if (filtros.estado) params.append("estado", filtros.estado);
		if (filtros.origen) params.append("origen", filtros.origen);
		if (filtros.busqueda) params.append("busqueda", filtros.busqueda);
		if (filtros.page) params.append("page", filtros.page);
		if (filtros.limit) params.append("limit", filtros.limit);
		const query = params.toString();

		const response = await axios.get(`${API_URL}${query ? `?${query}` : ""}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const getConsultaById = async (id) => {
	try {
		const response = await axios.get(`${API_URL}/${id}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const createConsulta = async (data) => {
	try {
		const response = await axios.post(API_URL, data);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const updateConsulta = async (id, data) => {
	try {
		const response = await axios.put(`${API_URL}/${id}`, data);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const deleteConsulta = async (id) => {
	try {
		const response = await axios.delete(`${API_URL}/${id}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const getMetricasConsultas = async () => {
	try {
		const response = await axios.get(`${API_URL}/metricas`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const createHistorial = async (consultaId, data) => {
	try {
		const response = await axios.post(`${API_URL}/${consultaId}/historial`, data);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const deleteHistorial = async (consultaId, entradaId) => {
	try {
		const response = await axios.delete(`${API_URL}/${consultaId}/historial/${entradaId}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const updateHistorial = async (consultaId, entradaId, data) => {
	try {
		const response = await axios.put(`${API_URL}/${consultaId}/historial/${entradaId}`, data);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};
