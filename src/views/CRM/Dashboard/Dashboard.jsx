// views/CRM/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MetricCard from "../../../components/CRM/Dashboard/MetricCard/MetricCard";
import ActividadFeed from "../../../components/CRM/Dashboard/ActividadFeed/ActividadFeed";
import OrigenDonut from "../../../components/CRM/Dashboard/OrigenDonut/OrigenDonut";
import ConsultasChart from "../../../components/CRM/Dashboard/ConsultasChart/ConsultasChart";
import { useRoles } from "../../../hooks/useRoles";
import TiempoCierre from "../../../components/CRM/Dashboard/TiempoCierre/TiempoCierre";
import "./Dashboard.css";
import { LoadingState, ErrorState } from "../../../components/CRM/PageState/PageState";

const API_URL = import.meta.env.VITE_API_URL;

// ─── íconos ──────────────────────────────────────────────────────────────────
const Icons = {
	Users: () => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	),
	Activity: () => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
		</svg>
	),
	Tag: () => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
			<line x1="7" y1="7" x2="7.01" y2="7" />
		</svg>
	),
	DollarSign: () => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<line x1="12" y1="1" x2="12" y2="23" />
			<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
		</svg>
	),
	ChevronRight: () => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polyline points="9 18 15 12 9 6" />
		</svg>
	),
	Info: () => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10" />
			<line x1="12" y1="16" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12.01" y2="8" />
		</svg>
	),
	CheckSquare: () => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<polyline points="9 11 12 14 22 4" />
			<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
		</svg>
	),
};

// ─── config etapas ────────────────────────────────────────────────────────────
const ETAPAS = [
	{
		key: "nuevo",
		label: "Nuevo",
		color: "#6495ed",
		descripcion: "Acaba de contactarse. Todavía no sabés si tiene intención real de compra.",
	},
	{
		key: "con_oferta",
		label: "Con Oferta",
		color: "#ce93d8",
		descripcion: "Le enviaste una cotización o propuesta concreta. La pelota está del lado del cliente.",
	},
	{
		key: "seguimiento",
		label: "Seguimiento",
		color: "#ff9800",
		descripcion: "Mostró interés pero no cerró. Está comparando o necesita más tiempo.",
	},
	{
		key: "cerrado",
		label: "Cerrado",
		color: "#4caf50",
		descripcion: "Venta concretada.",
	},
	{
		key: "perdido",
		label: "Perdido",
		color: "#6b7280",
		descripcion: "No avanzó por precio, tiempo, competencia u otra razón. Queda registrado para análisis.",
	},
];

const PRIORIDAD_COLOR = { alta: "#ef4444", media: "#f59e0b", baja: "#6b7280" };
const TIPO_LABEL = {
	papeles: "Papeles",
	administrativo: "Admin",
	alistaje: "Alistaje",
	fotos_publicar: "Fotos",
	contactar: "Contactar",
	seguimiento: "Seguimiento",
};

function EtapaLabel({ label, color, descripcion }) {
	const [pos, setPos] = useState(null);
	const ref = React.useRef(null);

	function handleMouseEnter() {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		setPos({ top: rect.bottom + 10, left: rect.left });
	}

	// En touch no hay hover: un tap muestra/oculta el tooltip.
	function handleToggle(e) {
		e.stopPropagation();
		if (pos) {
			setPos(null);
			return;
		}
		handleMouseEnter();
	}

	useEffect(() => {
		if (!pos) return;
		function handleOutside(e) {
			if (ref.current && !ref.current.contains(e.target)) setPos(null);
		}
		document.addEventListener("click", handleOutside);
		return () => document.removeEventListener("click", handleOutside);
	}, [pos]);

	return (
		<div
			className="crm-etapa-label"
			ref={ref}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => setPos(null)}
			onClick={handleToggle}
		>
			<span className="crm-proceso__col-label" style={{ color }}>
				{label}
			</span>
			<span className="crm-etapa-label__icono" style={{ color }}>
				<Icons.Info />
			</span>
			{pos && (
				<div className="crm-etapa-label__tooltip" style={{ top: pos.top, left: pos.left, borderColor: `${color}44` }}>
					<span className="crm-etapa-label__tooltip-titulo" style={{ color }}>
						{label}
					</span>
					<span className="crm-etapa-label__tooltip-desc">{descripcion}</span>
				</div>
			)}
		</div>
	);
}
// ─── fecha legible ────────────────────────────────────────────────────────────
function fechaHoy() {
	return new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// ─── componente principal ─────────────────────────────────────────────────────
export default function Dashboard() {
	const navigate = useNavigate();
	const { userRol, user, esVendedor, esAdmin, esSupervisor } = useRoles();

	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 60);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		if (!user?.id) return;
		setLoading(true);
		axios
			.get(`${API_URL}/dashboard`)
			.then((r) => r.data)
			.then((d) => {
				if (d.status === 200) setData(d.resp);
				else setError("Error al cargar el dashboard.");
			})
			.catch(() => setError("No se pudo conectar con el servidor."))
			.finally(() => setLoading(false));
	}, [user?.id, userRol]);

	if (loading) return <LoadingState mensaje="Cargando resumen…" />;

	if (error) return <ErrorState mensaje={error} onRetry={() => window.location.reload()} />;

	if (!data) return null;

	const { metricas, proceso, consultasPorOrigen, tiempoCierre, consultasPorSemana, ventasPorMes, actividadReciente, recordatorios } = data;

	const metricItems = [
		{ label: "Consultas este mes", icon: <Icons.Users />, ...metricas.consultasNuevas },
		{ label: "En seguimiento", icon: <Icons.Activity />, ...metricas.enSeguimiento },
		{ label: "Con oferta", icon: <Icons.Tag />, ...metricas.conOferta },
		...(esAdmin || esSupervisor ? [{ label: "Ventas cerradas", icon: <Icons.DollarSign />, ...metricas.ventasCerradas }] : []),
	];

	return (
		<div className={`crm-dash ${mounted ? "crm-dash--mounted" : ""}`}>
			{/* ── ENCABEZADO ── */}
			<div className="crm-dash__header">
				<div>
					<h1 className="crm-dash__title">Resumen</h1>
					<p className="crm-dash__subtitle">Vista general del negocio · {fechaHoy()}</p>
				</div>
			</div>

			{/* ── MÉTRICAS ── */}
			<div className="crm-dash__metrics">
				{metricItems.map((m, i) => (
					<MetricCard key={m.label} delay={i * 0.07} {...m} />
				))}
			</div>
			<p className="crm-dash__metrics-nota">Variaciones calculadas sobre el mes anterior.</p>

			{/* ── PROCESO DE VENTAS ── */}
			<div className="crm-panel crm-dash__proceso">
				<div className="crm-panel__head">
					<span className="crm-panel__title">Proceso de ventas</span>
					<a className="crm-panel__link" href="/crm/consultas">
						Ver todo <Icons.ChevronRight />
					</a>
				</div>
				<div className="crm-proceso__cols">
					{ETAPAS.map((etapa) => {
						const col = proceso.find((p) => p.estado === etapa.key);
						return (
							<div key={etapa.key} className="crm-proceso__col">
								<div className="crm-proceso__col-header" style={{ borderColor: `${etapa.color}44` }}>
									<EtapaLabel label={etapa.label} color={etapa.color} descripcion={etapa.descripcion} />
									<span className="crm-proceso__col-count" style={{ color: etapa.color }}>
										{col?.total ?? 0}
									</span>
								</div>
								<div className="crm-proceso__col-items">
									{(col?.consultas ?? []).map((c) => (
										<div
											key={c.id}
											className="crm-proceso__item"
											style={{ borderLeftColor: etapa.color }}
											onClick={() => navigate("/crm/consultas")}
										>
											<span className="crm-proceso__item-vehiculo">{c.vehiculo || "—"}</span>
											{c.nombre && (
												<span className="crm-proceso__item-nombre">
													{c.nombre} {c.apellido ?? ""}
												</span>
											)}
										</div>
									))}
									{(col?.total ?? 0) === 0 && <p className="crm-proceso__col-empty">Sin consultas</p>}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* ── FILA B: origen + gráficos | recordatorios/actividad ── */}
			<div className="crm-dash__fila-b">
				<div className="crm-dash__fila-b-left">
					<div className="crm-panel">
						<div className="crm-panel__head">
							<span className="crm-panel__title">Origen de consultas</span>
							<span className="crm-panel__muted">{consultasPorOrigen.reduce((a, b) => a + b.cantidad, 0)} este mes</span>
						</div>
						{consultasPorOrigen.length === 0 ? (
							<p className="crm-rec__vacio">Todavía no hay consultas este mes.</p>
						) : (
							<OrigenDonut datos={consultasPorOrigen} />
						)}
					</div>
					<div className="crm-panel">
						<div className="crm-panel__head">
							<span className="crm-panel__title">Tiempo de cierre</span>
						</div>
						{tiempoCierre ? (
							<TiempoCierre {...tiempoCierre} />
						) : (
							<p className="crm-rec__vacio">Todavía no hay consultas cerradas para calcular el promedio.</p>
						)}
					</div>
				</div>

				{/* Recordatorios (admin/supervisor) o actividad (vendedor) */}
				{esAdmin || esSupervisor ? (
					<div className="crm-panel crm-dash__recordatorios">
						<div className="crm-panel__head">
							<span className="crm-panel__title">Tareas pendientes</span>
							<span className="crm-panel__badge-alerta">{recordatorios.length}</span>
						</div>
						<div className="crm-rec-lista">
							{recordatorios.length === 0 && <p className="crm-rec__vacio">Sin tareas pendientes</p>}
							{recordatorios.slice(0, 5).map((t) => (
								<div
									key={t.id}
									className="crm-rec__item"
									style={{ cursor: "pointer" }}
									onClick={() => navigate("/crm/tareas", { state: { tareaId: t.id } })}
								>
									<span className="crm-rec__tarea-tipo" style={{ color: PRIORIDAD_COLOR[t.prioridad] }}>
										<Icons.CheckSquare />
										{TIPO_LABEL[t.tipo] ?? t.tipo}
									</span>
									<div className="crm-rec__info">
										<span className="crm-rec__cliente">{t.titulo}</span>
										<span className="crm-rec__vehiculo" style={{ color: PRIORIDAD_COLOR[t.prioridad] }}>
											Prioridad {t.prioridad}
										</span>
									</div>
								</div>
							))}
						</div>
						{recordatorios.length > 5 && (
							<button className="crm-rec__ver-todo" onClick={() => navigate("/crm/tareas")}>
								Ver todas las tareas <Icons.ChevronRight />
							</button>
						)}
					</div>
				) : (
					<div className="crm-panel crm-dash__actividad">
						<div className="crm-panel__head">
							<span className="crm-panel__title">Actividad reciente</span>
							<a className="crm-panel__link" href="/crm/consultas">
								Ver todo <Icons.ChevronRight />
							</a>
						</div>
						<ActividadFeed items={actividadReciente} />
					</div>
				)}
			</div>

			{/* ── FILA C: gráficos + actividad (solo admin/supervisor) ── */}
			<div className="crm-dash__fila-c">
				<div className="crm-panel crm-dash__chart">
					<div className="crm-panel__head">
						<span className="crm-panel__title">Consultas por semana · Ventas por mes</span>
					</div>
					<ConsultasChart datosConsultas={consultasPorSemana} datosVentas={ventasPorMes} />
				</div>

				{(esAdmin || esSupervisor) && (
					<div className="crm-panel crm-dash__actividad">
						<div className="crm-panel__head">
							<span className="crm-panel__title">Actividad reciente</span>
							<a className="crm-panel__link" href="/crm/consultas">
								Ver todo <Icons.ChevronRight />
							</a>
						</div>
						<ActividadFeed items={actividadReciente} />
					</div>
				)}
			</div>
		</div>
	);
}
