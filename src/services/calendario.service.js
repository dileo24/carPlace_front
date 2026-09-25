// services/calendario.service.js
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/eventos`;

export async function getEventos(params = {}) {
	const { data } = await axios.get(BASE_URL, { params });
	return data;
}

export async function getEventoById(id) {
	const { data } = await axios.get(`${BASE_URL}/${id}`);
	return data;
}

export async function createEvento(body) {
	const { data } = await axios.post(BASE_URL, body);
	return data;
}

export async function updateEvento(id, body) {
	const { data } = await axios.patch(`${BASE_URL}/${id}`, body);
	return data;
}

export async function deleteEvento(id) {
	const { data } = await axios.delete(`${BASE_URL}/${id}`);
	return data;
}

export async function buscarContactoPorTelefono(telefono) {
	const { data } = await axios.get(`${BASE_URL}/contacto-por-telefono`, { params: { telefono } });
	return data;
}
