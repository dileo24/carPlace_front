// TareasHeader.jsx
import React from "react";
import "./TareasHeader.css";
import { PRIORIDADES, TIPOS, PRIORIDAD_LABELS, TIPO_LABELS } from "../../../../constants/crmTareas";

export default function TareasHeader({ filtroPrioridad, onFiltroPrioridad, filtroTipo, onFiltroTipo, onNuevaTarea, metrics }) {
	return (
		<div className="tareas-header">
			<div className="tareas-header__top">
				<div className="tareas-header__title-block">
					<h1 className="tareas-header__title">Tareas</h1>
					<div className="tareas-header__metrics">
						<span className="metric-item">
							<span className="metric-value">{metrics.total}</span>
							<span className="metric-label">Total</span>
						</span>
						<span className="metric-sep" />
						<span className="metric-item">
							<span className="metric-value metric-value--green">{metrics.completadas}</span>
							<span className="metric-label">Completadas</span>
						</span>
						<span className="metric-sep" />
						<span className="metric-item">
							<span className="metric-value metric-value--yellow">{metrics.pendientes}</span>
							<span className="metric-label">Pendientes</span>
						</span>
					</div>
				</div>

				<button className="btn-nueva-tarea" onClick={onNuevaTarea}>
					<span className="btn-nueva-tarea__plus">+</span>
					Nueva tarea
				</button>
			</div>

			<div className="tareas-header__filters">
				<div className="filter-group">
					<label className="filter-group__label" htmlFor="filtro-prioridad">
						Prioridad
					</label>
					<select
						id="filtro-prioridad"
						className="filter-select"
						value={filtroPrioridad}
						onChange={(e) => onFiltroPrioridad(e.target.value)}
					>
						<option value="todas">Todas</option>
						{PRIORIDADES.map((p) => (
							<option key={p} value={p}>
								{PRIORIDAD_LABELS[p]}
							</option>
						))}
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-group__label" htmlFor="filtro-tipo">
						Tipo
					</label>
					<select id="filtro-tipo" className="filter-select" value={filtroTipo} onChange={(e) => onFiltroTipo(e.target.value)}>
						<option value="todos">Todos</option>
						{TIPOS.map((t) => (
							<option key={t} value={t}>
								{TIPO_LABELS[t]}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}
