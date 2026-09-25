import React, { useEffect, useState } from "react";
import "./MensajesPredefinidosModal.css";

const IconClose = () => (
	<svg viewBox="0 0 20 20" fill="none" width="18" height="18">
		<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
	</svg>
);

const IconTrash = () => (
	<svg viewBox="0 0 20 20" fill="none" width="18" height="18">
		<path d="M4 6h12M8 6V4h4v2M7 6l.8 9h4.4L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const IconEdit = () => (
	<svg viewBox="0 0 20 20" fill="none" width="18" height="18">
		<path d="M13 3l4 4-9 9H4v-4l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
	</svg>
);

const IconPlus = () => (
	<svg viewBox="0 0 20 20" fill="none" width="15" height="15">
		<path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
	</svg>
);

const IconCheck = () => (
	<svg viewBox="0 0 20 20" fill="none" width="18" height="18">
		<path d="M4 10l5 5 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export default function MensajesPredefinidosModal({ open, onClose, mensajes, onGuardar }) {
	const [lista, setLista] = useState(Array.isArray(mensajes) ? mensajes : []);

	useEffect(() => {
		if (open) setLista(Array.isArray(mensajes) ? mensajes : []);
	}, [open, mensajes]); // ← agregar open como dependencia

	const [editandoIdx, setEditandoIdx] = useState(null);
	const [editandoTexto, setEditandoTexto] = useState("");
	const [nuevoTexto, setNuevoTexto] = useState("");
	const [agregando, setAgregando] = useState(false);
	const [guardado, setGuardado] = useState(false);

	if (!open) return null;

	const handleEditar = (idx) => {
		setEditandoIdx(idx);
		setEditandoTexto(lista[idx]);
		setAgregando(false);
	};

	const handleConfirmarEdicion = () => {
		if (!editandoTexto.trim()) return;
		const nueva = lista.map((m, i) => (i === editandoIdx ? editandoTexto.trim() : m));
		setLista(nueva);
		setEditandoIdx(null);
		setEditandoTexto("");
	};

	const handleEliminar = (idx) => {
		setLista((prev) => prev.filter((_, i) => i !== idx));
		if (editandoIdx === idx) {
			setEditandoIdx(null);
			setEditandoTexto("");
		}
	};

	const handleAgregar = () => {
		if (!nuevoTexto.trim()) return;
		setLista((prev) => [...prev, nuevoTexto.trim()]);
		setNuevoTexto("");
		setAgregando(false);
	};

	const handleGuardar = () => {
		onGuardar(lista);
		setGuardado(true);
		setTimeout(() => {
			setGuardado(false);
			onClose();
		}, 900);
	};

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<div className="mpmodal__overlay" onClick={handleOverlayClick}>
			<div className="mpmodal">
				{/* Header */}
				<div className="mpmodal__header">
					<div>
						<h2 className="mpmodal__titulo">Mensajes predeterminados</h2>
						<p className="mpmodal__subtitulo">Los vendedores pueden usar estos atajos al responder.</p>
					</div>
					<button className="mpmodal__close" onClick={onClose} aria-label="Cerrar">
						<IconClose />
					</button>
				</div>

				{/* Lista */}
				<div className="mpmodal__lista">
					{lista.length === 0 && <p className="mpmodal__empty">No hay mensajes predeterminados. Agregá uno.</p>}
					{lista.map((msg, idx) => (
						<div key={idx} className={`mpmodal__item ${editandoIdx === idx ? "mpmodal__item--editando" : ""}`}>
							{editandoIdx === idx ? (
								<>
									<textarea
										className="mpmodal__textarea"
										value={editandoTexto}
										onChange={(e) => setEditandoTexto(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												handleConfirmarEdicion();
											}
											if (e.key === "Escape") {
												setEditandoIdx(null);
											}
										}}
										autoFocus
										rows={4}
									/>
									<button className="mpmodal__btn-accion mpmodal__btn-accion--confirmar" onClick={handleConfirmarEdicion} title="Confirmar">
										<IconCheck />
									</button>
								</>
							) : (
								<>
									<span className="mpmodal__texto">{msg}</span>
									<div className="mpmodal__acciones">
										<button className="mpmodal__btn-accion" onClick={() => handleEditar(idx)} title="Editar">
											<IconEdit />
										</button>
										<button
											className="mpmodal__btn-accion mpmodal__btn-accion--eliminar"
											onClick={() => handleEliminar(idx)}
											title="Eliminar"
										>
											<IconTrash />
										</button>
									</div>
								</>
							)}
						</div>
					))}
				</div>

				{/* Agregar nuevo */}
				<div className="mpmodal__agregar">
					{agregando ? (
						<div className="mpmodal__nuevo-wrap">
							<textarea
								className="mpmodal__textarea"
								placeholder="Escribí el nuevo mensaje..."
								value={nuevoTexto}
								onChange={(e) => setNuevoTexto(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleAgregar();
									}
									if (e.key === "Escape") {
										setAgregando(false);
										setNuevoTexto("");
									}
								}}
								autoFocus
								rows={2}
							/>
							<div className="mpmodal__nuevo-btns">
								<button
									className="mpmodal__btn mpmodal__btn--ghost"
									onClick={() => {
										setAgregando(false);
										setNuevoTexto("");
									}}
								>
									Cancelar
								</button>
								<button className="mpmodal__btn mpmodal__btn--primary" onClick={handleAgregar} disabled={!nuevoTexto.trim()}>
									Agregar
								</button>
							</div>
						</div>
					) : (
						<button
							className="mpmodal__btn-nuevo"
							onClick={() => {
								setAgregando(true);
								setEditandoIdx(null);
							}}
						>
							<IconPlus />
							<span>Nuevo mensaje</span>
						</button>
					)}
				</div>

				{/* Footer */}
				<div className="mpmodal__footer">
					<button className="mpmodal__btn mpmodal__btn--ghost" onClick={onClose}>
						Cancelar
					</button>
					<button className={`mpmodal__btn mpmodal__btn--primary ${guardado ? "mpmodal__btn--guardado" : ""}`} onClick={handleGuardar}>
						{guardado ? (
							<>
								<IconCheck /> Guardado
							</>
						) : (
							"Guardar cambios"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
