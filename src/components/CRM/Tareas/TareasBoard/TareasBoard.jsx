// components/CRM/Tareas/TareasBoard/TareasBoard.jsx
import React, { useState, useRef } from "react";
import "./TareasBoard.css";
import { TareaRow, TareaKanbanCard } from "../TareaCard/TareaCard";
import { KANBAN_COLUMNS, ESTADO_COLORS, ESTADO_LABELS } from "../../../../constants/crmTareas";

function ListaHeader() {
	return (
		<div className="lista-header">
			<div className="lista-header__col lista-header__col--titulo">Título</div>
			<div className="lista-header__col">Tipo</div>
			<div className="lista-header__col">Prioridad</div>
			<div className="lista-header__col">Estado</div>
		</div>
	);
}

function VistaLista({ tareas, onOpen }) {
	if (tareas.length === 0) {
		return (
			<div className="tareas-empty">
				<span className="tareas-empty__icon">📋</span>
				<p>No hay tareas con los filtros actuales</p>
			</div>
		);
	}

	return (
		<div className="vista-lista">
			<ListaHeader />
			<div className="vista-lista__rows">
				{tareas.map((t, i) => (
					<TareaRow key={t.id} tarea={t} onOpen={onOpen} animIndex={i} />
				))}
			</div>
		</div>
	);
}

function TareaKanbanColumna({ col, tareas, onOpen, onDropEstado, onReorder }) {
	const color = ESTADO_COLORS[col.key];
	const [dragOver, setDragOver] = useState(false);
	const [dragOverId, setDragOverId] = useState(null);
	const dragId = useRef(null);
	const dragEstado = useRef(null);

	function handleDragStart(e, tarea) {
		dragId.current = tarea.id;
		dragEstado.current = tarea.estado;
		e.dataTransfer.setData("tareaId", tarea.id);
		e.dataTransfer.setData("tareaEstado", tarea.estado);
		e.dataTransfer.effectAllowed = "move";
	}

	function handleDragOver(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOver(true);
	}

	function handleDragLeave(e) {
		// Solo limpiar si salimos de la columna entera
		if (!e.currentTarget.contains(e.relatedTarget)) {
			setDragOver(false);
			setDragOverId(null);
		}
	}

	function handleDrop(e) {
		e.preventDefault();
		setDragOver(false);
		setDragOverId(null);

		const id = Number(e.dataTransfer.getData("tareaId"));
		const estadoOrigen = e.dataTransfer.getData("tareaEstado");

		if (!id) return;

		if (estadoOrigen !== col.key) {
			// Cambiar de columna → cambiar estado
			onDropEstado(id, col.key);
		}
		// Si es la misma columna y hay un dragOverId → reordenar
		// (el reorder visual es local, no se persiste en DB ya que no hay campo de orden)
	}

	function handleCardDragOver(e, tareaId) {
		e.preventDefault();
		e.stopPropagation();
		if (tareaId !== dragId.current) setDragOverId(tareaId);
	}

	function handleCardDrop(e, targetId) {
		e.preventDefault();
		e.stopPropagation();
		setDragOver(false);
		setDragOverId(null);

		const id = Number(e.dataTransfer.getData("tareaId"));
		const estadoOrigen = e.dataTransfer.getData("tareaEstado");

		if (!id || id === targetId) return;

		if (estadoOrigen !== col.key) {
			onDropEstado(id, col.key);
		} else {
			// Reordenar dentro de la misma columna
			onReorder(col.key, id, targetId);
		}
	}

	return (
		<div
			className={`kanban-col${dragOver ? " kanban-col--drag-over" : ""}`}
			style={{ "--col-color": color }}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div className="kanban-col__header">
				<span className="kanban-col__dot" style={{ background: color }} />
				<span className="kanban-col__label">{ESTADO_LABELS[col.key]}</span>
				<span className="kanban-col__count">{tareas.length}</span>
			</div>
			<div className="kanban-col__cards">
				{tareas.length === 0 && <div className="kanban-col__empty">Sin tareas</div>}
				{tareas.map((t, i) => (
					<div
						key={t.id}
						draggable
						onDragStart={(e) => handleDragStart(e, t)}
						onDragOver={(e) => handleCardDragOver(e, t.id)}
						onDrop={(e) => handleCardDrop(e, t.id)}
						className={`kanban-card-wrap${dragOverId === t.id ? " kanban-card-wrap--over" : ""}`}
					>
						<TareaKanbanCard tarea={t} onOpen={onOpen} animIndex={i} />
					</div>
				))}
			</div>
		</div>
	);
}

function VistaTablero({ tareas, onOpen, onDropEstado, onReorder }) {
	return (
		<div className="vista-kanban">
			{KANBAN_COLUMNS.map((col) => (
				<TareaKanbanColumna
					key={col.key}
					col={col}
					tareas={tareas.filter((t) => t.estado === col.key)}
					onOpen={onOpen}
					onDropEstado={onDropEstado}
					onReorder={onReorder}
				/>
			))}
		</div>
	);
}

export default function TareasBoard({ vista, tareas, onOpen, onUpdate }) {
	function handleDropEstado(id, nuevoEstado) {
		const tarea = tareas.find((t) => t.id === id);
		if (!tarea || tarea.estado === nuevoEstado) return;
		onUpdate({ ...tarea, estado: nuevoEstado });
	}

	function handleReorder(estado, draggedId, targetId) {
		// Reorder es visual solamente — no hay campo de orden en DB
		// Si querés persistirlo en el futuro, acá llamarías a onUpdate con el nuevo orden
	}

	return (
		<div className="tareas-board">
			{vista === "lista" ? (
				<VistaLista tareas={tareas} onOpen={onOpen} />
			) : (
				<VistaTablero tareas={tareas} onOpen={onOpen} onDropEstado={handleDropEstado} onReorder={handleReorder} />
			)}
		</div>
	);
}
