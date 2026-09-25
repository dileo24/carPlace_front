// components/CRM/Tareas/TareaCard/TareaCard.jsx
import React from "react";
import "./TareaCard.css";
import {
	PRIORIDAD_COLORS,
	ESTADO_COLORS,
	TIPO_COLORS,
	PRIORIDAD_LABELS,
	ESTADO_LABELS,
	TIPO_LABELS,
} from "../../../../constants/crmTareas";

function Chip({ label, color, small }) {
	return (
		<span
			className={`tarea-chip${small ? " tarea-chip--small" : ""}`}
			style={{ background: `${color}1a`, border: `1px solid ${color}44`, color }}
		>
			{label}
		</span>
	);
}

// ─── Vista Lista ───────────────────────────────────────────────
export function TareaRow({ tarea, onOpen, animIndex }) {
	return (
		<div
			className="tarea-row"
			style={{ animationDelay: `${animIndex * 35}ms` }}
			onClick={() => onOpen(tarea)}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === "Enter" && onOpen(tarea)}
		>
			<div className="tarea-row__titulo">
				<span className="tarea-row__titulo-text">{tarea.titulo}</span>
			</div>
			<div className="tarea-row__tipo">
				<Chip label={TIPO_LABELS[tarea.tipo]} color={TIPO_COLORS[tarea.tipo]} small />
			</div>
			<div className="tarea-row__prioridad">
				<Chip label={PRIORIDAD_LABELS[tarea.prioridad]} color={PRIORIDAD_COLORS[tarea.prioridad]} small />
			</div>
			<div className="tarea-row__estado">
				<Chip label={ESTADO_LABELS[tarea.estado]} color={ESTADO_COLORS[tarea.estado]} small />
			</div>
		</div>
	);
}

// ─── Vista Tablero ─────────────────────────────────────────────
export function TareaKanbanCard({ tarea, onOpen, animIndex }) {
	return (
		<div
			className="tarea-kcard"
			style={{ animationDelay: `${animIndex * 40}ms` }}
			onClick={() => onOpen(tarea)}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === "Enter" && onOpen(tarea)}
		>
			<div className="tarea-kcard__header">
				<Chip label={PRIORIDAD_LABELS[tarea.prioridad]} color={PRIORIDAD_COLORS[tarea.prioridad]} small />
				<Chip label={TIPO_LABELS[tarea.tipo]} color={TIPO_COLORS[tarea.tipo]} small />
			</div>
			<p className="tarea-kcard__titulo">{tarea.titulo}</p>
			<div className="tarea-kcard__footer">
				<span className="tarea-kcard__fecha">
					{new Date(tarea.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
				</span>
			</div>
		</div>
	);
}
