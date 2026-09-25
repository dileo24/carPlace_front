// components/CRM/Consultas/ConsultaKanban/ConsultaKanban.jsx
import { memo, useState } from "react";
import { motion } from "framer-motion";
import { DndContext, DragOverlay, pointerWithin, useDraggable, useDroppable } from "@dnd-kit/core";
import { useDragSensors } from "../../../../hooks/useDragSensors";
import { PIPELINE_ESTADOS, ESTADO_LABEL, ESTADO_COLOR, formatAsesor } from "../../../../constants/crm";
import "./ConsultaKanban.css";

const esConsultaDeJoaquinParadiso = (consulta) =>
	consulta.asesorNombre === "Joaquín" && consulta.asesorApellido === "Paradiso";

const KanbanCard = memo(function KanbanCard({ consulta, onOpen, puedeVerDatos, index }) {
	const nombre = puedeVerDatos && consulta.nombre ? `${consulta.nombre} ${consulta.apellido ?? ""}`.trim() : null;
	const esDeJoaquin = esConsultaDeJoaquinParadiso(consulta);

	return (
		<motion.div
			className={`kn-card ${esDeJoaquin ? "kn-card--joaquin" : ""}`}
			onClick={() => onOpen(consulta)}
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.04 }}
			whileHover={{ y: -2 }}
		>
			<div className="kn-card__top">
				<span className="kn-card__origen">{consulta.origen}</span>
				{consulta.calificado && <span className="kn-card__cal">✓</span>}
			</div>
			<p className="kn-card__vehiculo">{consulta.vehiculo}</p>
			{nombre ? <p className="kn-card__nombre">{nombre}</p> : <p className="kn-card__nombre kn-card__nombre--privado">Datos privados</p>}
			{consulta.presupuesto > 0 && (
				<p className="kn-card__presupuesto">
					{consulta.moneda || "USD"} {Number(consulta.presupuesto).toLocaleString("es-AR")}
				</p>
			)}
			<div className="kn-card__footer">
				<span className="kn-card__asesor">{formatAsesor(consulta)}</span>
			</div>
		</motion.div>
	);
});

function DraggableKanbanCard({ consulta, onOpen, puedeVerDatos, index }) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: consulta.id });

	return (
		<div ref={setNodeRef} {...attributes} {...listeners} style={{ touchAction: "none", cursor: "grab", opacity: isDragging ? 0.35 : 1 }}>
			<KanbanCard consulta={consulta} onOpen={onOpen} puedeVerDatos={puedeVerDatos} index={index} />
		</div>
	);
}

function KanbanColumna({ estado, consultas, onOpen, puedeVerDatos }) {
	const color = ESTADO_COLOR[estado];
	const { setNodeRef, isOver } = useDroppable({ id: estado });

	return (
		<div ref={setNodeRef} className={`kn-col ${isOver ? "kn-col--dragover" : ""}`} style={{ "--col-color": color }}>
			<div className="kn-col__header" style={{ "--col-color": color }}>
				<span className="kn-col__dot" style={{ background: color }} />
				<span className="kn-col__label">{ESTADO_LABEL[estado]}</span>
				<span className="kn-col__count">{consultas.length}</span>
			</div>
			<div className="kn-col__cards">
				{consultas.length === 0 && <p className="kn-col__empty">Soltá acá para mover</p>}
				{consultas.map((c, i) => (
					<DraggableKanbanCard key={c.id} consulta={c} onOpen={onOpen} puedeVerDatos={puedeVerDatos(c)} index={i} />
				))}
			</div>
		</div>
	);
}

export default function ConsultaKanban({ consultas, onOpen, onUpdate, puedeVerDatos }) {
	const sensors = useDragSensors();
	const [activeConsulta, setActiveConsulta] = useState(null);

	function handleDragStart(event) {
		setActiveConsulta(consultas.find((c) => c.id === event.active.id) ?? null);
	}

	function handleDragEnd(event) {
		setActiveConsulta(null);
		const { active, over } = event;
		if (!over) return;
		const consulta = consultas.find((c) => c.id === active.id);
		if (!consulta || consulta.estado === over.id) return;
		onUpdate(consulta.id, { estado: over.id });
	}

	return (
		<DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className="kn-board">
				{PIPELINE_ESTADOS.map((estado) => (
					<KanbanColumna
						key={estado}
						estado={estado}
						consultas={consultas.filter((c) => c.estado === estado)}
						onOpen={onOpen}
						puedeVerDatos={puedeVerDatos}
					/>
				))}
			</div>
			<DragOverlay>
				{activeConsulta ? (
					<KanbanCard consulta={activeConsulta} onOpen={() => {}} puedeVerDatos={puedeVerDatos(activeConsulta)} index={0} />
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
