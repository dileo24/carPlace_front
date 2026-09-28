import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ROLES, ROL_LABELS } from "../../../constants/roles";
import "./Sidebar.css";

// window.open() manda la request sin el header Authorization (no hay forma de
// setearlo en una navegación de browser), así que el backend siempre la
// rechazaba con 401 aunque la sesión del admin fuera válida. Pedimos el
// archivo por axios (que sí lleva el JWT vía el interceptor global) y
// disparamos la descarga nosotros mismos a partir del blob recibido.
async function descargarBackup() {
	try {
		const response = await axios.get(`${import.meta.env.VITE_API_URL}/backup`, {
			responseType: "blob",
		});
		const disposition = response.headers?.["content-disposition"] || "";
		const match = disposition.match(/filename="?([^"]+)"?/);
		const filename = match?.[1] || `backup_${new Date().toISOString().slice(0, 10)}.sql`;

		const url = window.URL.createObjectURL(response.data);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	} catch (err) {
		console.error("Error al descargar el backup:", err);
		alert("No se pudo descargar el backup. Probá de nuevo en unos segundos.");
	}
}

const NAV_ITEMS = [
	{
		label: "Resumen",
		path: "/crm",
		exact: true,
		descripcion: "Vista general del negocio: métricas, proceso de ventas, recordatorios y actividad reciente.",
		roles: [ROLES.ADMIN, ROLES.SUPERVISOR],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="3" width="7" height="7" />
				<rect x="14" y="3" width="7" height="7" />
				<rect x="14" y="14" width="7" height="7" />
				<rect x="3" y="14" width="7" height="7" />
			</svg>
		),
	},
	{
		label: "Consultas",
		path: "/crm/consultas",
		descripcion: "Interesados generados por el bot y cargados manualmente, organizados por etapas hasta el cierre de la venta.",
		roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.VENDEDOR, ROLES.PUBLICADOR_VENDEDOR],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
				<path d="M16 3.13a4 4 0 0 1 0 7.75" />
			</svg>
		),
	},
	{
		label: "Conversaciones",
		path: "/crm/conversaciones",
		descripcion: "Bandeja de chats interactuando con el bot. Podés tomar el control de la conversación cuando sea necesario.",
		roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.VENDEDOR, ROLES.PUBLICADOR_VENDEDOR],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
			</svg>
		),
	},
	{
		label: "Calendario",
		path: "/crm/calendario",
		descripcion:
			"Agenda de visitas, llamadas y reuniones. El bot carga citas automáticamente y envía recordatorios a los clientes el día de la cita.",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		),
	},
	{
		label: "Stock",
		path: "/crm/stock",
		descripcion: "Inventario de vehículos con estado (Disponible, Señado, Consignación), patrimonio y acceso al alistaje de cada auto.",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<rect x="1" y="3" width="15" height="13" rx="2" />
				<path d="M16 8h4l3 5v3h-7V8z" />
				<circle cx="5.5" cy="18.5" r="2.5" />
				<circle cx="18.5" cy="18.5" r="2.5" />
			</svg>
		),
	},
	{
		label: "Tareas",
		path: "/crm/tareas",
		descripcion: "Tareas pendientes del equipo: recordatorios, trámites, llamadas y cualquier actividad interna del negocio.",
		roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIO],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<line x1="8" y1="6" x2="21" y2="6" />
				<line x1="8" y1="12" x2="21" y2="12" />
				<line x1="8" y1="18" x2="21" y2="18" />
				<polyline points="3 6 4 7 6 5" />
				<polyline points="3 12 4 13 6 11" />
				<polyline points="3 18 4 19 6 17" />
			</svg>
		),
	},
	{
		label: "Ventas",
		path: "/crm/ventas",
		descripcion: "Historial de ventas cerradas con todos los detalles: cliente, vehículo, precio, vehículo tomado, teléfono y fecha.",
		roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIO],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</svg>
		),
	},
	{
		label: "Reportes",
		path: "/crm/reportes",
		descripcion:
			"Métricas avanzadas: ventas anuales, monto bruto mensual, patrimonio y rendimiento del equipo. Solo visible para administradores.",
		roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIO],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<line x1="18" y1="20" x2="18" y2="10" />
				<line x1="12" y1="20" x2="12" y2="4" />
				<line x1="6" y1="20" x2="6" y2="14" />
			</svg>
		),
	},
];

const BOTTOM_ITEMS = [
	{
		label: "Backup",
		path: null,
		descripcion: "Descargá una copia completa de la base de datos.",
		roles: [ROLES.ADMIN, ROLES.SUPERVISOR],
		isAction: true,
		action: descargarBackup,
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
		),
	},
	{
		label: "Usuarios",
		path: "/crm/usuarios",
		descripcion: "Gestión de usuarios del sistema: roles, permisos y accesos.",
		roles: [ROLES.ADMIN],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
				<circle cx="12" cy="7" r="4" />
				<line x1="19" y1="8" x2="23" y2="8" />
				<line x1="21" y1="6" x2="21" y2="10" />
			</svg>
		),
	},
	{
		label: "Cuentas",
		path: "/crm/cuentas",
		descripcion: "Cuenta corriente: deudas y saldos a favor entre los admins (o con terceros).",
		roles: [ROLES.ADMIN],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<line x1="12" y1="1" x2="12" y2="23" />
				<path d="M17 5.5c0-1.66-2.24-3-5-3s-5 1.34-5 3 2.24 3 5 3 5 1.34 5 3-2.24 3-5 3-5-1.34-5-3" />
			</svg>
		),
	},
	{
		label: "Facturación",
		path: "/crm/facturacion",
		descripcion: "Gastos del negocio, resumen de cuentas y ganancia por auto vendido, con el balance mensual.",
		roles: [ROLES.ADMIN],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<rect x="2" y="5" width="20" height="14" rx="2" />
				<line x1="2" y1="10" x2="22" y2="10" />
				<line x1="6" y1="14" x2="10" y2="14" />
			</svg>
		),
	},
	{
		label: "Marcas",
		path: "/crm/marcas",
		descripcion: "Gestión de las marcas de vehículos: nombre, foto, y qué autos del stock tiene cada una.",
		roles: [ROLES.ADMIN],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<path d="M20.59 13.41L13.41 20.59a2 2 0 0 1-2.82 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
				<line x1="7" y1="7" x2="7" y2="7" />
			</svg>
		),
	},
	{
		label: "Publicaciones",
		path: "/crm/publicaciones",
		descripcion: "Publicar y gestionar el stock de vehículos en MercadoLibre.",
		roles: [ROLES.ADMIN],
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
				<path d="M3 11l18-7-7 18-3-8-8-3z" />
			</svg>
		),
	},
];

const EVENTOS_CONV = ["conversacion:mensaje", "conversacion:tomada", "conversacion:estadoCambiado", "conversacion:leida"];
const EVENTOS_CAL = ["calendario:actualizado"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RESTRICTED_PATHS = ["/crm/consultas", "/crm/calendario", "/crm/stock"];

const isRestrictedUser = (user) => user?.email === "clodersona@gmail.com" || user?.name === "Cloder Sona";

const puedeVer = (item, rol, user) => {
	if (!user) return false;
	if (isRestrictedUser(user)) return RESTRICTED_PATHS.includes(item.path);
	return !item.roles || item.roles.includes(rol);
};

const getDisplayName = (user) => {
	if (!user?.name) return "Usuario";
	return user.name.split(" ")[0];
};

const getInitial = (user) => getDisplayName(user).charAt(0).toUpperCase();

// ─── Item con tooltip ─────────────────────────────────────────────────────────
function SidebarItem({ item, onClick }) {
	const [tooltipPos, setTooltipPos] = useState(null);
	const wrapRef = useRef(null);

	const handleMouseEnter = () => {
		if (!item.descripcion || !wrapRef.current) return;
		if (window.matchMedia("(pointer: coarse)").matches) return;
		const rect = wrapRef.current.getBoundingClientRect();
		setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
	};

	const handleMouseLeave = () => setTooltipPos(null);

	const handleClick = () => {
		if (item.isAction) item.action();
		onClick();
	};

	const itemClass = "crm-sidebar__item";

	return (
		<div ref={wrapRef} className="crm-sidebar__item-wrap" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			{item.isAction ? (
				<button className={itemClass} onClick={handleClick}>
					<span className="crm-sidebar__item-icon">{item.icon}</span>
					<span className="crm-sidebar__item-label">{item.label}</span>
				</button>
			) : (
				<NavLink
					to={item.path}
					end={item.exact}
					className={({ isActive }) => `${itemClass} ${isActive ? "crm-sidebar__item--active" : ""}`}
					onClick={onClick}
				>
					<span className="crm-sidebar__item-icon">{item.icon}</span>
					<span className="crm-sidebar__item-label">{item.label}</span>
					{item.badge && <span className="crm-sidebar__badge">{item.badge}</span>}
				</NavLink>
			)}

			{tooltipPos && (
				<div
					className="crm-sidebar__tooltip"
					style={{ position: "fixed", top: tooltipPos.top, left: tooltipPos.left, transform: "translateY(-50%)" }}
				>
					<span className="crm-sidebar__tooltip-titulo">{item.label}</span>
					<span className="crm-sidebar__tooltip-desc">{item.descripcion}</span>
				</div>
			)}
		</div>
	);
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Sidebar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [badges, setBadges] = useState({ conversaciones: 0, calendario: 0 });
	const { userRol, user } = useAuth();
	const socketRef = useRef(null);
	const location = useLocation();

	// 1. Crear conexión socket
	useEffect(() => {
		socketRef.current = io(import.meta.env.VITE_API_URL, {
			transports: ["polling", "websocket"],
		});
		return () => socketRef.current?.disconnect();
	}, []);

	// Asignado directo en el render (no en un useEffect): un fetchBadges disparado
	// por un evento de socket justo después de navegar podía resolver antes de
	// que el efecto corriera, leer el pathname viejo y mostrar el badge real en
	// vez de la máscara — el resultado era el "aparece en 0 y a los segundos
	// vuelve a 10" que se veía en Conversaciones. Al ser una asignación directa,
	// el ref ya queda actualizado en el mismo render que refleja la navegación.
	const locationRef = useRef(location.pathname);
	locationRef.current = location.pathname;

	const fetchBadges = useCallback(async () => {
		if (!user || !userRol) return;
		try {
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/sidebar`);
			if (res.data?.resp) {
				setBadges((prev) => ({
					...res.data.resp,
					conversaciones: locationRef.current === "/crm/conversaciones" ? 0 : res.data.resp.conversaciones,
				}));
			}
		} catch (_) {}
	}, [user, userRol]);

	// 3. Polling cada 30s
	useEffect(() => {
		fetchBadges();
		const interval = setInterval(fetchBadges, 30_000);
		return () => clearInterval(interval);
	}, [fetchBadges]);

	// 4. Actualización por socket
	useEffect(() => {
		const socket = socketRef.current;
		if (!socket) return;
		[...EVENTOS_CONV, ...EVENTOS_CAL].forEach((ev) => socket.on(ev, fetchBadges));
		return () => [...EVENTOS_CONV, ...EVENTOS_CAL].forEach((ev) => socket.off(ev, fetchBadges));
	}, [fetchBadges]);

	if (!user || !userRol) return null;

	const navItems = NAV_ITEMS.filter((item) => puedeVer(item, userRol, user));
	const bottomItems = BOTTOM_ITEMS.filter((item) => puedeVer(item, userRol, user));

	return (
		<>
			{/* ── BOTÓN MOBILE ── */}
			{/* ── BOTÓN MOBILE ── */}
			<button
				className="crm-sidebar__mobile-toggle"
				onPointerDown={(e) => {
					e.stopPropagation();
					e.preventDefault();
					setMobileOpen((o) => !o);
				}}
				aria-label="Menú crm"
			>
				{mobileOpen ? (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				) : (
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
						<line x1="3" y1="6" x2="21" y2="6" />
						<line x1="3" y1="12" x2="21" y2="12" />
						<line x1="3" y1="18" x2="21" y2="18" />
					</svg>
				)}
				<span>Menú</span>
			</button>

			{/* ── OVERLAY MOBILE ── */}
			{mobileOpen && (
				<div
					className="crm-sidebar__overlay"
					onPointerDown={(e) => {
						e.stopPropagation();
						setMobileOpen(false);
					}}
				/>
			)}
			{/* ── SIDEBAR ── */}
			<aside className={`crm-sidebar ${mobileOpen ? "crm-sidebar--open" : ""}`}>
				<div className="crm-sidebar__top">
					<div className="crm-sidebar__brand">
						<span className="crm-sidebar__brand-dot" />
						<span className="crm-sidebar__brand-text">crm</span>
					</div>
				</div>

				<nav className="crm-sidebar__nav">
					{navItems.map((item) => {
						const badgeCount =
							item.path === "/crm/conversaciones" ? badges.conversaciones : item.path === "/crm/calendario" ? badges.calendario : null;
						return <SidebarItem key={item.path} item={{ ...item, badge: badgeCount || undefined }} onClick={() => setMobileOpen(false)} />;
					})}
				</nav>

				<div className="crm-sidebar__bottom">
					{bottomItems.map((item) => (
						<SidebarItem key={item.path} item={item} onClick={() => setMobileOpen(false)} />
					))}

					<div className="crm-sidebar__user">
						<div className="crm-sidebar__user-avatar">{getInitial(user)}</div>
						<div className="crm-sidebar__user-info">
							<span className="crm-sidebar__user-name">{getDisplayName(user)}</span>
							<span className="crm-sidebar__user-role">{ROL_LABELS[userRol] ?? userRol}</span>
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
