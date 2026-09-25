import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/ventas`;

export const getVentas = async () => {
	const response = await axios.get(API_URL);
	return response.data;
};

export const createVenta = async (data) => {
	const response = await axios.post(API_URL, data);
	return response.data;
};

export const updateVenta = async (id, data) => {
	const response = await axios.put(`${API_URL}/${id}`, data);
	return response.data;
};

export const deleteVenta = async (id) => {
	const response = await axios.delete(`${API_URL}/${id}`);
	return response.data;
};
