import axios from "axios";

const USERS_URL = `${import.meta.env.VITE_API_URL}/users`;

// GET /users → lista todos los usuarios
export const getUsers = async () => {
  const response = await axios.get(USERS_URL);
  return response.data;
};

// POST /users → crea usuario
// Body: { name, email, pass, rol }
export const createUser = async (formData) => {
  const response = await axios.post(USERS_URL, formData);
  return response.data;
};

// PATCH /users/:id → edita usuario
// Body: solo los campos modificados (pass solo si se quiere cambiar)
export const editUser = async (id, formData) => {
  const response = await axios.patch(`${USERS_URL}/${id}`, formData);
  return response.data;
};

// DELETE /users/:id → elimina usuario
export const deleteUser = async (id) => {
  const response = await axios.delete(`${USERS_URL}/${id}`);
  return response.data;
};