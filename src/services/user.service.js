import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/admin`;

export const loginUser = async (formData) => {
	try {
		const response = await axios.post(`${API_URL}/login`, formData);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

