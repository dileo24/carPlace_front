import axios from "axios";

const ML_URL = `${import.meta.env.VITE_API_URL}/mercadolibre`;

// GET /mercadolibre/estado → { conectado, mlUserId?, nickname?, conectadoDesde? }
export const getEstadoMercadoLibre = async () => {
	const response = await axios.get(`${ML_URL}/estado`);
	return response.data;
};

// GET /mercadolibre/auth-url → { url } — el link de login de MercadoLibre al
// que hay que redirigir el navegador (no se puede resolver la conexión solo
// con axios, ML necesita una navegación real para el login).
export const getAuthUrlMercadoLibre = async () => {
	const response = await axios.get(`${ML_URL}/auth-url`);
	return response.data;
};

// DELETE /mercadolibre/desconectar
export const desconectarMercadoLibre = async () => {
	const response = await axios.delete(`${ML_URL}/desconectar`);
	return response.data;
};
