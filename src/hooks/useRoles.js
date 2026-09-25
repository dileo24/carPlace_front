import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

// Centraliza la derivación de "qué rol es el usuario logueado" que estaba
// copy-pasteada (userRol === ROLES.X) en cada vista del CRM. Devuelve los
// mismos booleans que ya se usaban, más un par de combinaciones frecuentes.
export function useRoles() {
	const { userRol, user, isAuthenticated } = useAuth();

	const esAdmin = userRol === ROLES.ADMIN;
	const esSupervisor = userRol === ROLES.SUPERVISOR;
	const esVendedor = userRol === ROLES.VENDEDOR;
	const esPublicadorVendedor = userRol === ROLES.PUBLICADOR_VENDEDOR;
	const esSocio = userRol === ROLES.SOCIO;

	return {
		userRol,
		user,
		isAuthenticated,
		esAdmin,
		esSupervisor,
		esVendedor,
		esPublicadorVendedor,
		esSocio,
		// "vendedor o publicador_vendedor" — la combinación que se repetía a mano
		// en las vistas donde ambos roles reciben el mismo trato restringido.
		esVendedorOPublicador: esVendedor || esPublicadorVendedor,
		// admin o supervisor — igual que ROLES_FULL/ROLES_FULL_ACCESS del backend.
		esFullAccess: esAdmin || esSupervisor,
	};
}
