import { createContext, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// Interceptor global: agrega el JWT a todas las requests salientes.
// Se registra una sola vez, al importar este módulo (main.jsx importa
// AuthProvider antes que cualquier service haga una llamada).
axios.interceptors.request.use((config) => {
	const token = localStorage.getItem("authToken");
	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Sesión deslizante: el backend reemite un token nuevo (18hs de validez desde
// ahora) en cada request autenticado exitoso. Lo tomamos del header y
// reemplazamos el guardado, así mientras el usuario esté activo la sesión
// nunca expira — solo si deja de usar el sistema 18hs seguidas vuelve a pedir
// login.
axios.interceptors.response.use(
	(response) => {
		const nuevoToken = response.headers?.["x-refreshed-token"];
		if (nuevoToken) localStorage.setItem("authToken", nuevoToken);
		return response;
	},
	(error) => {
		// El token dura 18hs — si venció (o es inválido) sin haberse renovado,
		// el backend responde 401 en cualquier ruta protegida. Sin esto, el
		// usuario se queda viendo errores crípticos ("No autenticado o sesión
		// inválida") sin entender que tiene que volver a loguearse.
		if (error.response?.status === 401 && window.location.pathname !== "/loginCyJUsers") {
			localStorage.clear();
			window.location.href = "/loginCyJUsers?sesionExpirada=1";
		}
		return Promise.reject(error);
	},
);

export function AuthProvider({ children }) {
	const [authState, setAuthState] = useState(() => {
		try {
			const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
			if (!isAuthenticated) {
				localStorage.clear();
				return { isAuthenticated: false, userRol: null, user: null };
			}

			const userRol = localStorage.getItem("userRol");
			const token = localStorage.getItem("authToken");
			let user = null;
			try {
				const storedUser = localStorage.getItem("user");
				if (storedUser && storedUser !== "undefined") {
					user = JSON.parse(storedUser);
				}
			} catch {
				user = null;
			}

			if (!userRol || userRol === "undefined" || !token) {
				localStorage.clear();
				return { isAuthenticated: false, userRol: null, user: null };
			}

			return { isAuthenticated: true, userRol, user };
		} catch {
			localStorage.clear();
			return { isAuthenticated: false, userRol: null, user: null };
		}
	});

	const login = (rol, userData, token) => {
		setAuthState({ isAuthenticated: true, userRol: rol, user: userData ?? null });
		localStorage.setItem("isAuthenticated", "true");
		localStorage.setItem("userRol", rol);
		if (userData) localStorage.setItem("user", JSON.stringify(userData));
		if (token) localStorage.setItem("authToken", token);
	};

	const logout = () => {
		setAuthState({ isAuthenticated: false, userRol: null, user: null });
		localStorage.clear();
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: authState.isAuthenticated,
				userRol: authState.userRol,
				user: authState.user,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
