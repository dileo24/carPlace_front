import axios from "axios";

const CUENTAS_URL = `${import.meta.env.VITE_API_URL}/cuentas`;

// GET /cuentas → { deudas, admins, saldos }
export const getCuentas = async () => {
	const response = await axios.get(CUENTAS_URL);
	return response.data;
};

// POST /cuentas → crea una deuda
// Body: { monto, moneda, motivo, deudorId|deudorEmpresa|deudorNombre+deudorTelefono, idem acreedor* }
export const createDeuda = async (formData) => {
	const response = await axios.post(CUENTAS_URL, formData);
	return response.data;
};

// PATCH /cuentas/:id/saldar → registra un pago (o salda el total)
// Body: { monto?, metodo?, comentario? } (al menos metodo o comentario).
// monto solo se respeta en deudas internas; en empresa/préstamo se salda el total pendiente.
export const saldarDeuda = async (id, body) => {
	const response = await axios.patch(`${CUENTAS_URL}/${id}/saldar`, body);
	return response.data;
};
