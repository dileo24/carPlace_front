import React from "react";
import "./ActividadFeed.css";

const ICONOS = {
	nueva_consulta: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	),
	movimiento: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
			<line x1="7" y1="7" x2="7.01" y2="7" />
		</svg>
	),
	recordatorio: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
			<path d="M13.73 21a2 2 0 0 1-3.46 0" />
		</svg>
	),
	nuevo_chat: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
		</svg>
	),
	venta: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
			<polyline points="22 4 12 14.01 9 11.01" />
		</svg>
	),
};

const COLORES = {
	nueva_consulta: "#3b82f6",
	movimiento: "#cc0000",
	recordatorio: "#f59e0b",
	nuevo_chat: "#25D366",
	venta: "#22c55e",
};

export default function ActividadFeed({ items = [], onVerTodo }) {
	if (items.length === 0) return <p className="crm-rec__vacio">Todavía no hay actividad registrada.</p>;
	return (
		<div className="actividad-feed">
			{items.map((a, i) => (
				<div className="actividad-feed__item" key={a.id} style={{ animationDelay: `${0.3 + i * 0.06}s` }}>
					<span
						className="actividad-feed__icon"
						style={{
							color: COLORES[a.tipo],
							borderColor: `${COLORES[a.tipo]}33`,
						}}
					>
						{ICONOS[a.tipo]}
					</span>
					<div className="actividad-feed__body">
						<span className="actividad-feed__texto">{a.texto}</span>
						<span className="actividad-feed__detalle">{a.detalle}</span>
					</div>
					<span className="actividad-feed__tiempo">{a.tiempo}</span>
				</div>
			))}
		</div>
	);
}
