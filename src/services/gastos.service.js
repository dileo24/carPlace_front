import axios from "axios";

const GASTOS_URL = `${import.meta.env.VITE_API_URL}/gastos`;

export const getGastos = async () => {
	const response = await axios.get(GASTOS_URL);
	return response.data;
};

// Body: { monto, moneda, categoria, descripcion, fecha }
export const createGasto = async (formData) => {
	const response = await axios.post(GASTOS_URL, formData);
	return response.data;
};

export const deleteGasto = async (id) => {
	const response = await axios.delete(`${GASTOS_URL}/${id}`);
	return response.data;
};
