import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/conversaciones`;

export const getConversaciones = async ({ estado, canal, page, limit } = {}) => {
	try {
		const params = new URLSearchParams();
		if (estado) params.append("estado", estado);
		if (canal) params.append("canal", canal);
		if (page) params.append("page", page);
		if (limit) params.append("limit", limit);
		const query = params.toString();
		const response = await axios.get(`${API_URL}${query ? `?${query}` : ""}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const getConversacionById = async (id) => {
	try {
		const response = await axios.get(`${API_URL}/${id}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const updateEstado = async (id, nuevoEstado, estadoConsulta) => {
	try {
		const body = { estado: nuevoEstado };
		if (estadoConsulta) body.estadoConsulta = estadoConsulta;
		const response = await axios.patch(`${API_URL}/${id}/estado`, body);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const tomarConversacion = async (id) => {
	try {
		const response = await axios.patch(`${API_URL}/${id}/tomar`, {});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const marcarLeido = async (id) => {
	try {
		const response = await axios.patch(
			`${API_URL}/${id}/leido`,
			{},
			{ timeout: 6000 },
		);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const eliminarConversacion = async (id) => {
	try {
		const response = await axios.delete(`${API_URL}/${id}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const enviarMensaje = async (id, texto) => {
	try {
		const response = await axios.post(`${API_URL}/${id}/mensaje`, { texto });
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const generarConsulta = async (id) => {
	try {
		const response = await axios.post(`${API_URL}/${id}/consulta`, {});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const enviarAudio = async (convId, blob) => {
	const formData = new FormData();
	formData.append("audio", blob, "audio.mp3");
	try {
		const response = await axios.post(`${API_URL}/${convId}/audio`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const generarResumen = async (id, { forzar = false } = {}) => {
	try {
		const response = await axios.post(`${API_URL}/${id}/generar-resumen`, { forzar });
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const enviarMedia = async (convId, formData) => {
	try {
		const response = await axios.post(`${API_URL}/${convId}/media`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const marcarNoLeido = async (id) => {
	try {
		const response = await axios.patch(`${API_URL}/${id}/no-leido`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const iniciarConversacion = async ({ telefono, nombre, apellido, consultaId, vehiculo, eventoId }) => {
	try {
		const response = await axios.post(`${API_URL}/iniciar`, {
			telefono,
			nombre,
			apellido,
			consultaId,
			vehiculo,
			eventoId,
		});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const soltarConversacion = async (id) => {
	try {
		const response = await axios.patch(`${API_URL}/${id}/soltar`, {});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const toggleOcultoMensaje = async (conversacionId, mensajeId) => {
	try {
		const response = await axios.patch(`${API_URL}/${conversacionId}/mensaje/${mensajeId}/ocultar`, {});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const createConversacionNota = async (conversacionId, data) => {
	try {
		const response = await axios.post(`${API_URL}/${conversacionId}/notas`, data);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const updateConversacionNota = async (conversacionId, notaId, data) => {
	try {
		const response = await axios.put(`${API_URL}/${conversacionId}/notas/${notaId}`, data);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const deleteConversacionNota = async (conversacionId, notaId) => {
	try {
		const response = await axios.delete(`${API_URL}/${conversacionId}/notas/${notaId}`);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};
