// components/CRM/Tareas/NuevaTareaDrawer/NuevaTareaDrawer.jsx
import React, { useState } from "react";
import "./NuevaTareaDrawer.css";
import Drawer from "@mui/material/Drawer";
import { TIPOS, PRIORIDADES, TIPO_LABELS, PRIORIDAD_LABELS, TIPO_COLORS, PRIORIDAD_COLORS } from "../../../../constants/crmTareas";

const EMPTY_FORM = { titulo: "", tipo: "", prioridad: "", descripcion: "" };

export default function NuevaTareaDrawer({ open, onClose, onGuardar }) {
	const [form, setForm] = useState(EMPTY_FORM);
	const [errores, setErrores] = useState({});

	function handleChange(field, value) {
		setForm((prev) => ({ ...prev, [field]: value }));
		if (errores[field]) setErrores((prev) => ({ ...prev, [field]: null }));
	}

	function handleSubmit() {
		const nuevosErrores = {};
		if (!form.titulo.trim()) nuevosErrores.titulo = "Requerido";
		if (!form.tipo) nuevosErrores.tipo = "Requerido";
		if (!form.prioridad) nuevosErrores.prioridad = "Requerido";

		if (Object.keys(nuevosErrores).length > 0) {
			setErrores(nuevosErrores);
			return;
		}

		onGuardar({ ...form });
		setForm(EMPTY_FORM);
		setErrores({});
		onClose();
	}

	function handleClose() {
		setForm(EMPTY_FORM);
		setErrores({});
		onClose();
	}

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={handleClose}
			PaperProps={{ sx: { width: 360, background: "#111", borderLeft: "1px solid #1e1e1e", boxShadow: "-8px 0 32px rgba(0,0,0,0.6)" } }}
		>
			<div className="ntd">
				<div className="ntd-header">
					<div className="ntd-header__top">
						<h2 className="ntd-header__titulo">Nueva Tarea</h2>
						<button className="ntd-close" onClick={handleClose} title="Cerrar">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
								<path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
							</svg>
						</button>
					</div>
				</div>

				<div className="ntd-body">
					{/* Título */}
					<div className="ntd-field">
						<label className="ntd-label">
							Título <span className="ntd-required">*</span>
						</label>
						<input
							className={`ntd-input${errores.titulo ? " ntd-input--error" : ""}`}
							type="text"
							value={form.titulo}
							onChange={(e) => handleChange("titulo", e.target.value)}
							placeholder="ej: Llamar a Fernández por el Taos"
							autoFocus
						/>
						{errores.titulo && <span className="ntd-error-msg">{errores.titulo}</span>}
					</div>

					{/* Tipo */}
					<div className="ntd-field">
						<label className="ntd-label">
							Tipo <span className="ntd-required">*</span>
						</label>
						<div className="ntd-option-grid">
							{TIPOS.map((t) => (
								<button
									key={t}
									className={`ntd-option-btn${form.tipo === t ? " ntd-option-btn--active" : ""}`}
									style={
										form.tipo === t
											? { background: `${TIPO_COLORS[t]}1a`, border: `1px solid ${TIPO_COLORS[t]}44`, color: TIPO_COLORS[t] }
											: {}
									}
									onClick={() => handleChange("tipo", t)}
								>
									{TIPO_LABELS[t]}
								</button>
							))}
						</div>
						{errores.tipo && <span className="ntd-error-msg">{errores.tipo}</span>}
					</div>

					{/* Prioridad */}
					<div className="ntd-field">
						<label className="ntd-label">
							Prioridad <span className="ntd-required">*</span>
						</label>
						<div className="ntd-option-row">
							{PRIORIDADES.map((p) => (
								<button
									key={p}
									className={`ntd-option-btn ntd-option-btn--flex${form.prioridad === p ? " ntd-option-btn--active" : ""}`}
									style={
										form.prioridad === p
											? { background: `${PRIORIDAD_COLORS[p]}1a`, border: `1px solid ${PRIORIDAD_COLORS[p]}44`, color: PRIORIDAD_COLORS[p] }
											: {}
									}
									onClick={() => handleChange("prioridad", p)}
								>
									{PRIORIDAD_LABELS[p]}
								</button>
							))}
						</div>
						{errores.prioridad && <span className="ntd-error-msg">{errores.prioridad}</span>}
					</div>

					{/* Descripción */}
					<div className="ntd-field">
						<label className="ntd-label">Descripción</label>
						<textarea
							className="ntd-textarea"
							value={form.descripcion}
							onChange={(e) => handleChange("descripcion", e.target.value)}
							placeholder="Detalles adicionales…"
							rows={3}
						/>
					</div>
				</div>

				<div className="ntd-footer">
					<button className="ntd-btn-guardar" onClick={handleSubmit}>
						Guardar tarea
					</button>
					<button className="ntd-btn-cancelar" onClick={handleClose}>
						Cancelar
					</button>
				</div>
			</div>
		</Drawer>
	);
}
