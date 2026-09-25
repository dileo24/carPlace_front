/**
 * Roles de usuario del CRM SportQuatro.
 * Importar desde cualquier vista o componente:
 *   import { ROLES, ROL_LABELS, ROL_OPTIONS } from "../../../constants/roles";
 */

export const ROLES = {
	ADMIN: "admin",
	SUPERVISOR: "supervisor",
	VENDEDOR: "vendedor",
	PUBLICADOR_VENDEDOR: "publicador_vendedor",
	SOCIO: "socio",
};

/** Etiquetas legibles para mostrar en UI */
export const ROL_LABELS = {
	[ROLES.ADMIN]: "Admin",
	[ROLES.SUPERVISOR]: "Supervisor",
	[ROLES.VENDEDOR]: "Vendedor",
	[ROLES.PUBLICADOR_VENDEDOR]: "Publicador/Vendedor",
	[ROLES.SOCIO]: "Socio",
};

/**
 * Opciones para <select> o listas desplegables.
 * El admin no aparece como opción seleccionable al crear/editar usuarios
 * desde la UI estándar; agregarlo si se necesita en un flujo específico.
 */
export const ROL_OPTIONS = [
	{ value: ROLES.VENDEDOR, label: ROL_LABELS[ROLES.VENDEDOR] },
	{ value: ROLES.PUBLICADOR_VENDEDOR, label: ROL_LABELS[ROLES.PUBLICADOR_VENDEDOR] },
	{ value: ROLES.SUPERVISOR, label: ROL_LABELS[ROLES.SUPERVISOR] },
	{ value: ROLES.SOCIO, label: ROL_LABELS[ROLES.SOCIO] },
];
