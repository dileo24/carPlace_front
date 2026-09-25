import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}`;

export const getMensajesPredefinidos = async () => {
	const response = await axios.get(`${API_URL}/configuracion/mensajes_predefinidos`);
	const valor = response.data.resp;
	return typeof valor === "string" ? JSON.parse(valor) : valor;
};

export const updateMensajesPredefinidos = async (mensajes) => {
	const response = await axios.put(`${API_URL}/configuracion/mensajes_predefinidos`, {
		valor: mensajes,
	});
	return response.data.resp;
};
