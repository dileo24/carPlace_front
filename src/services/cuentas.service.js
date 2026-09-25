import axios from "axios";

const CUENTAS_URL = `${import.meta.env.VITE_API_URL}/cuentas`;

// GET /cuentas → { deudas, admins, saldos }
export const getCuentas = async () => {
	const response = await axios.get(CUENTAS_URL);
	return response.data;
};

// POST /cuentas → crea una deuda
// Body: { monto, moneda, motivo, deudorId, acreedorId }
export const createDeuda = async (formData) => {
	const response = await axios.post(CUENTAS_URL, formData);
	return response.data;
};

// DELETE /cuentas/:id → elimina/salda una deuda
export const deleteDeuda = async (id) => {
	const response = await axios.delete(`${CUENTAS_URL}/${id}`);
	return response.data;
};
