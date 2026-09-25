// components/CRM/Tareas/TareaDrawer/TareaDrawer.jsx
import React, { useState, useEffect } from "react";
import "./TareaDrawer.css";
import Drawer from "@mui/material/Drawer";
import {
	PRIORIDAD_COLORS,
	ESTADO_COLORS,
	TIPO_COLORS,
	PRIORIDAD_LABELS,
	ESTADO_LABELS,
	TIPO_LABELS,
	PRIORIDADES,
	TIPOS,
	getNextEstados,
	ACCION_LABELS,
} from "../../../../constants/crmTareas";
import { deleteTarea } from "../../../../services/tareas.service";

function Chip({ label, color }) {
	return (
		<span className="td-chip" style={{ background: `${color}1a`, border: `1px solid ${color}44`, color }}>
			{label}
		</span>
	);
}

function SectionLabel({ children, action }) {
	return (
		<div className="td-section-header">
			<div className="td-section-label">{children}</div>
			{action}
		</div>
	);
}

function DataRow({ label, value }) {
	return (
		<div className="td-data-row">
			<span className="td-data-label">{label}</span>
			<span className="td-data-value">{value}</span>
		</div>
	);
}

function EditForm({ tarea, onSave, onCancel }) {
	const [form, setForm] = useState({
		titulo: tarea.titulo,
		tipo: tarea.tipo,
		prioridad: tarea.prioridad,
		descripcion: tarea.descripcion || "",
	});

	function set(field, value) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	function handleSave() {
		if (!form.titulo.trim() || !form.tipo || !form.prioridad) return;
		onSave({ ...tarea, ...form });
	}

	return (
		<div className="td-edit-form">
			<div className="td-field">
				<label className="td-field-label">Título</label>
				<input className="td-input" value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Título de la tarea" />
			</div>
			<div className="td-field-row">
				<div className="td-field">
					<label className="td-field-label">Tipo</label>
					<select className="td-select" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
						{TIPOS.map((t) => (
							<option key={t} value={t}>
								{TIPO_LABELS[t]}
							</option>
						))}
					</select>
				</div>
				<div className="td-field">
					<label className="td-field-label">Prioridad</label>
					<select className="td-select" value={form.prioridad} onChange={(e) => set("prioridad", e.target.value)}>
						{PRIORIDADES.map((p) => (
							<option key={p} value={p}>
								{PRIORIDAD_LABELS[p]}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="td-field">
				<label className="td-field-label">Descripción</label>
				<textarea
					className="td-textarea"
					value={form.descripcion}
					onChange={(e) => set("descripcion", e.target.value)}
					rows={3}
					placeholder="Descripción..."
				/>
			</div>
			<div className="td-edit-actions">
				<button className="td-btn-save" onClick={handleSave}>
					Guardar
				</button>
				<button className="td-btn-cancel-edit" onClick={onCancel}>
					Cancelar
				</button>
			</div>
		</div>
	);
}

function NotaItem({ nota, onEdit, onDelete }) {
	const [editando, setEditando] = useState(false);
	const [texto, setTexto] = useState(nota.texto);
	const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

	function handleGuardar() {
		const t = texto.trim();
		if (!t) return;
		onEdit(nota.id, t);
		setEditando(false);
	}
	function handleCancelarEdit() {
		setTexto(nota.texto);
		setEditando(false);
	}
	function handleKey(e) {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGuardar();
		if (e.key === "Escape") handleCancelarEdit();
	}

	return (
		<div className="td-nota">
			<div className="td-nota__meta">
				<span className="td-nota__autor">{nota.autor}</span>
				<div className="td-nota__actions">
					<span className="td-nota__fecha">
						{new Date(nota.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
					</span>
					{!editando && !confirmandoEliminar && (
						<>
							<button className="td-nota__btn" onClick={() => setEditando(true)} title="Editar nota">
								<svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
									<path d="M12.854 0.146a.5.5 0 00-.707 0L10.5 1.793 14.207 5.5l1.647-1.647a.5.5 0 000-.707L12.854.146zM9.793 2.5L.5 11.793V15.5h3.707L13.5 6.207 9.793 2.5z" />
								</svg>
							</button>
							<button className="td-nota__btn td-nota__btn--delete" onClick={() => setConfirmandoEliminar(true)} title="Eliminar nota">
								<svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
									<path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H2.506a.58.58 0 00-.01 0H1.5a.5.5 0 000 1h.538l.853 10.66A2 2 0 004.885 16h6.23a2 2 0 001.994-1.84l.853-10.66H14.5a.5.5 0 000-1h-.995a.59.59 0 00-.01 0H11zm1.958 1l-.846 10.58a1 1 0 01-.997.92h-6.23a1 1 0 01-.997-.92L3.042 3.5h9.916z" />
								</svg>
							</button>
						</>
					)}
				</div>
			</div>
			{editando ? (
				<div className="td-nota__edit">
					<textarea
						className="td-textarea td-textarea--sm"
						value={texto}
						onChange={(e) => setTexto(e.target.value)}
						onKeyDown={handleKey}
						rows={2}
						autoFocus
					/>
					<div className="td-nota__edit-btns">
						<button className="td-nota__btn-guardar" onClick={handleGuardar} disabled={!texto.trim()}>
							Guardar
						</button>
						<button className="td-nota__btn-cancelar" onClick={handleCancelarEdit}>
							Cancelar
						</button>
					</div>
				</div>
			) : confirmandoEliminar ? (
				<div className="td-nota__confirm-delete">
					<span className="td-nota__confirm-text">¿Eliminar esta nota?</span>
					<div className="td-nota__edit-btns">
						<button
							className="td-nota__btn-eliminar"
							onClick={() => {
								onDelete(nota.id);
								setConfirmandoEliminar(false);
							}}
						>
							Eliminar
						</button>
						<button className="td-nota__btn-cancelar" onClick={() => setConfirmandoEliminar(false)}>
							Cancelar
						</button>
					</div>
				</div>
			) : (
				<p className="td-nota__texto">{nota.texto}</p>
			)}
		</div>
	);
}

function NotasSection({ notas, onAgregarNota, onEditarNota, onEliminarNota }) {
	const [texto, setTexto] = useState("");
	function handleAgregar() {
		const t = texto.trim();
		if (!t) return;
		onAgregarNota(t);
		setTexto("");
	}
	function handleKey(e) {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAgregar();
	}

	return (
		<div className="td-notas">
			{notas.length > 0 && (
				<div className="td-notas__lista">
					{[...notas].reverse().map((n) => (
						<NotaItem key={n.id} nota={n} onEdit={onEditarNota} onDelete={onEliminarNota} />
					))}
				</div>
			)}
			<div className="td-notas__add">
				<textarea
					className="td-textarea"
					value={texto}
					onChange={(e) => setTexto(e.target.value)}
					onKeyDown={handleKey}
					placeholder="Escribí una nota... (Ctrl+Enter para enviar)"
					rows={2}
				/>
				<button className="td-btn-nota" onClick={handleAgregar} disabled={!texto.trim()}>
					Agregar nota
				</button>
			</div>
		</div>
	);
}

export default function TareaDrawer({ open, tarea, onClose, onUpdate, onDelete, auth = {} }) {
	const [editando, setEditando] = useState(false);
	const [confirmando, setConfirmando] = useState(null);
	const [notaConfirm, setNotaConfirm] = useState("");
	const [eliminando, setEliminando] = useState(false);

	useEffect(() => {
		if (tarea) {
			setEditando(false);
			setConfirmando(null);
			setNotaConfirm("");
			setEliminando(false);
		}
	}, [tarea?.id]);

	if (!tarea) return null;

	const siguientes = getNextEstados(tarea.estado);

	function handleSaveEdit(tareaActualizada) {
		onUpdate(tareaActualizada);
		setEditando(false);
	}
	function handleAgregarNota(texto) {
		const nuevaNota = { id: `n${Date.now()}`, texto, autor: "Usuario", creadoEn: new Date().toISOString() };
		onUpdate({ ...tarea, notas: [...(tarea.notas ?? []), nuevaNota] });
	}
	function handleEditarNota(notaId, nuevoTexto) {
		onUpdate({ ...tarea, notas: (tarea.notas ?? []).map((n) => (n.id === notaId ? { ...n, texto: nuevoTexto } : n)) });
	}
	function handleEliminarNota(notaId) {
		onUpdate({ ...tarea, notas: (tarea.notas ?? []).filter((n) => n.id !== notaId) });
	}
	function handleCambiarEstado(nuevoEstado) {
		if (nuevoEstado === "completada") {
			setConfirmando("completada");
		} else {
			onUpdate({ ...tarea, estado: nuevoEstado });
			setConfirmando(null);
		}
	}
	function handleConfirmarCompletada() {
		const notasActualizadas = notaConfirm.trim()
			? [...(tarea.notas ?? []), { id: `n${Date.now()}`, texto: notaConfirm.trim(), autor: "Usuario", creadoEn: new Date().toISOString() }]
			: (tarea.notas ?? []);
		onUpdate({ ...tarea, estado: "completada", notas: notasActualizadas });
		setConfirmando(null);
		setNotaConfirm("");
	}

	async function handleConfirmarEliminar() {
		try {
			setEliminando(true);
			await deleteTarea(tarea.id, auth);
			onDelete(tarea.id);
			onClose();
		} catch (err) {
			console.error("Error eliminando tarea:", err);
			setEliminando(false);
			setConfirmando(null);
		}
	}

	const ACCION_STYLES = {
		en_progreso: { bg: "rgba(100,149,237,0.12)", border: "rgba(100,149,237,0.3)", color: "#6495ed" },
		completada: { bg: "rgba(76,175,80,0.12)", border: "rgba(76,175,80,0.3)", color: "#4caf50" },
		cancelada: { bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)", color: "#9ca3af" },
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: "100vw", sm: 500 },
					maxWidth: "100vw",
					background: "#111",
					borderLeft: "1px solid #1e1e1e",
					boxShadow: "-8px 0 32px rgba(0,0,0,0.6)",
				},
			}}
		>
			<div className="tarea-drawer">
				<div className="td-header">
					<div className="td-header__top">
						<Chip label={ESTADO_LABELS[tarea.estado]} color={ESTADO_COLORS[tarea.estado]} />
						<div className="td-header__top-actions">
							{!editando && confirmando !== "completada" && (
								<button className="td-btn-delete" onClick={() => setConfirmando("eliminar")} title="Eliminar tarea">
									<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
										<path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H2.506a.58.58 0 00-.01 0H1.5a.5.5 0 000 1h.538l.853 10.66A2 2 0 004.885 16h6.23a2 2 0 001.994-1.84l.853-10.66H14.5a.5.5 0 000-1h-.995a.59.59 0 00-.01 0H11zm1.958 1l-.846 10.58a1 1 0 01-.997.92h-6.23a1 1 0 01-.997-.92L3.042 3.5h9.916z" />
									</svg>
								</button>
							)}
							<button className="td-close" onClick={onClose} title="Cerrar">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
									<path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
								</svg>
							</button>
						</div>
					</div>
					<h2 className="td-header__titulo">{tarea.titulo}</h2>
				</div>

				<div className="td-body">
					{confirmando === "eliminar" && (
						<div className="td-confirm-block td-confirm-block--danger">
							<p className="td-confirm-text">¿Eliminar esta tarea? Esta acción no se puede deshacer.</p>
							<div className="td-confirm-btns">
								<button className="td-btn-confirm td-btn-confirm--danger" onClick={handleConfirmarEliminar} disabled={eliminando}>
									{eliminando ? "Eliminando..." : "Eliminar"}
								</button>
								<button className="td-btn-cancel-confirm" onClick={() => setConfirmando(null)} disabled={eliminando}>
									Cancelar
								</button>
							</div>
						</div>
					)}

					<div className="td-chips-row">
						<Chip label={TIPO_LABELS[tarea.tipo]} color={TIPO_COLORS[tarea.tipo]} />
						<Chip label={`Prioridad ${PRIORIDAD_LABELS[tarea.prioridad]}`} color={PRIORIDAD_COLORS[tarea.prioridad]} />
					</div>

					<div className="td-section">
						<SectionLabel
							action={
								!editando &&
								confirmando !== "eliminar" && (
									<button className="td-btn-edit" onClick={() => setEditando(true)}>
										<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
											<path d="M12.854 0.146a.5.5 0 00-.707 0L10.5 1.793 14.207 5.5l1.647-1.647a.5.5 0 000-.707L12.854.146zM9.793 2.5L.5 11.793V15.5h3.707L13.5 6.207 9.793 2.5z" />
										</svg>
										Editar
									</button>
								)
							}
						>
							Datos
						</SectionLabel>

						{editando ? (
							<EditForm tarea={tarea} onSave={handleSaveEdit} onCancel={() => setEditando(false)} />
						) : (
							<div className="td-data-list">
								<DataRow label="Creado por" value={tarea.creadoPor === "bot" ? "Bot automático" : "Usuario"} />
								<DataRow
									label="Creación"
									value={new Date(tarea.creadoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
								/>
								{tarea.descripcion && (
									<div className="td-descripcion-block">
										<span className="td-data-label">Descripción</span>
										<p className="td-descripcion">{tarea.descripcion}</p>
									</div>
								)}
							</div>
						)}
					</div>

					{!editando && confirmando !== "eliminar" && siguientes.length > 0 && (
						<div className="td-section">
							<SectionLabel>Cambiar estado</SectionLabel>
							{confirmando === "completada" ? (
								<div className="td-confirm-block">
									<p className="td-confirm-text">¿Marcar como completada?</p>
									<textarea
										className="td-textarea td-textarea--sm"
										value={notaConfirm}
										onChange={(e) => setNotaConfirm(e.target.value)}
										placeholder="Nota de cierre (opcional)..."
										rows={2}
									/>
									<div className="td-confirm-btns">
										<button className="td-btn-confirm" onClick={handleConfirmarCompletada}>
											Confirmar
										</button>
										<button className="td-btn-cancel-confirm" onClick={() => setConfirmando(null)}>
											Volver
										</button>
									</div>
								</div>
							) : (
								<div className="td-estado-btns">
									{siguientes.map((s) => {
										const st = ACCION_STYLES[s];
										return (
											<button
												key={s}
												className="td-estado-btn"
												style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}
												onClick={() => handleCambiarEstado(s)}
											>
												{ACCION_LABELS[s]}
											</button>
										);
									})}
								</div>
							)}
						</div>
					)}

					{!editando && confirmando !== "eliminar" && (
						<div className="td-section">
							<SectionLabel>Notas {tarea.notas?.length > 0 && <span className="td-notas-count">({tarea.notas.length})</span>}</SectionLabel>
							<NotasSection
								notas={tarea.notas ?? []}
								onAgregarNota={handleAgregarNota}
								onEditarNota={handleEditarNota}
								onEliminarNota={handleEliminarNota}
							/>
						</div>
					)}
				</div>
			</div>
		</Drawer>
	);
}
