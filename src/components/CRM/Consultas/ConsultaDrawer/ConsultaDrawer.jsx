// components/CRM/Consultas/ConsultaDrawer/ConsultaDrawer.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EstadoBadge, OrigenChip } from "../ConsultaBadges/ConsultaBadges";
import Tooltip from "../Tooltip/Tooltip";
import {
	BADGE_TOOLTIP,
	HISTORIAL_ICON,
	PIPELINE_ESTADOS,
	ESTADO_LABEL,
	ESTADO_COLOR,
	formatAsesor,
	formatFechaLarga,
	formatPresupuesto,
	FORMAS_PAGO,
	FORMAS_PAGO_LABEL,
} from "../../../../constants/crm";
import { ORIGEN_ICON } from "../../../../constants/crmIcons";
import { createHistorial, updateHistorial, deleteHistorial, deleteConsulta } from "../../../../services/consultas.service";
import { getUsers } from "../../../../services/usuarios.service";
import "./ConsultaDrawer.css";
import { useNavigate } from "react-router-dom";
import { iniciarConversacion } from "../../../../services/conversaciones.service";

function HistorialItem({ entrada, index, total, userId, asesorId, esAdmin, esSupervisor, onUpdate, onDelete }) {
	const [editando, setEditando] = useState(false);
	const [texto, setTexto] = useState(entrada.texto);
	const [guardando, setGuardando] = useState(false);
	const [confirmando, setConfirmando] = useState(false);

	const esSistema = entrada.tipo === "sistema";
	const puedeEditar = !esSistema && (esAdmin || esSupervisor || entrada.creadoPorId === userId || asesorId === userId);

	async function guardar() {
		if (!texto.trim()) return;
		try {
			setGuardando(true);
			await onUpdate(entrada.id, texto.trim());
			setEditando(false);
		} finally {
			setGuardando(false);
		}
	}

	return (
		<motion.div
			className="cq-timeline-item"
			initial={{ opacity: 0, x: 16 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: 0.06 + index * 0.05 }}
		>
			<div className="cq-timeline-item__dot">
				<span className="cq-timeline-item__icon">{HISTORIAL_ICON[entrada.tipo] || "📌"}</span>
				{index < total - 1 && <div className="cq-timeline-item__line" />}
			</div>
			<div className="cq-timeline-item__content">
				<div className="cq-timeline-item__header">
					<span className="cq-timeline-item__fecha">
						{new Date(entrada.createdAt).toLocaleDateString("es-AR", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
						})}
					</span>
					{puedeEditar && !editando && !confirmando && (
						<div className="cq-nota-actions">
							<button
								className="cq-nota-action-btn"
								onClick={() => {
									setTexto(entrada.texto);
									setEditando(true);
								}}
								title="Editar nota"
							>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
									<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
									<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
								</svg>
							</button>
							<button className="cq-nota-action-btn cq-nota-action-btn--danger" onClick={() => setConfirmando(true)} title="Eliminar nota">
								<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
									<path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H1.5a.5.5 0 000 1h.538l.853 10.66A2 2 0 004.885 16h6.23a2 2 0 001.994-1.84l.853-10.66H14.5a.5.5 0 000-1H11zm1.958 1l-.846 10.58a1 1 0 01-.997.92h-6.23a1 1 0 01-.997-.92L3.042 3.5h9.916z" />
								</svg>
							</button>
						</div>
					)}
				</div>

				{editando ? (
					<div className="cq-nota-edit">
						<textarea className="cq-nota-input" value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} autoFocus />
						<div className="cq-nota-edit-btns">
							<button className="cq-edit-btn cq-edit-btn--cancel" onClick={() => setEditando(false)} disabled={guardando}>
								Cancelar
							</button>
							<button className="cq-edit-btn cq-edit-btn--save" onClick={guardar} disabled={guardando || !texto.trim()}>
								{guardando ? "Guardando…" : "Guardar"}
							</button>
						</div>
					</div>
				) : confirmando ? (
					<div className="cq-confirm-block cq-confirm-block--danger">
						<p className="cq-confirm-text">¿Eliminar esta nota?</p>
						<div className="cq-confirm-btns">
							<button className="cq-btn-cancel-confirm" onClick={() => setConfirmando(false)}>
								Cancelar
							</button>
							<button className="cq-btn-confirm cq-btn-confirm--danger" onClick={() => onDelete(entrada.id)}>
								Eliminar
							</button>
						</div>
					</div>
				) : (
					<p className="cq-timeline-item__texto">{entrada.texto}</p>
				)}
			</div>
		</motion.div>
	);
}

export default function ConsultaDrawer({
	consulta,
	onClose,
	onUpdate,
	onDelete,
	esAdmin,
	esSupervisor,
	esVendedor,
	puedeVerDatos,
	puedeEditar,
	onHistorialUpdate,
	userId,
	userRol,
}) {
	const navigate = useNavigate();

	const [notaTexto, setNotaTexto] = useState("");
	const [enviando, setEnviando] = useState(false);

	// ── Edit mode ──────────────────────────────────────────────────────────────
	const [editando, setEditando] = useState(false);
	const [editForm, setEditForm] = useState({});
	const [guardando, setGuardando] = useState(false);

	// ── Asignación de asesor ───────────────────────────────────────────────────
	const [usuarios, setUsuarios] = useState([]);
	const [loadingUsuarios, setLoadingUsuarios] = useState(false);

	const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
	const [eliminando, setEliminando] = useState(false);
	const [iniciandoChat, setIniciandoChat] = useState(false);
	const [errorChat, setErrorChat] = useState(null);

	useEffect(() => {
		if (consulta) {
			setNotaTexto("");
			setEditando(false);
			setEditForm({});
		}
	}, [consulta?.id]);

	// Cargar usuarios solo cuando es admin/supervisor y se abre el modo edición
	useEffect(() => {
		if (editando && (esAdmin || esSupervisor) && usuarios.length === 0) {
			setLoadingUsuarios(true);
			getUsers()
				.then((data) => setUsuarios(data.users ?? data))
				.catch(console.error)
				.finally(() => setLoadingUsuarios(false));
		}
	}, [editando, esAdmin, esSupervisor]);

	if (!consulta) return null;

	const nombre = consulta.nombre ? (puedeVerDatos ? `${consulta.nombre} ${consulta.apellido ?? ""}`.trim() : null) : null;

	// Si hay varias citas vinculadas, priorizamos la próxima pendiente/confirmada;
	// si no hay ninguna futura, mostramos la más reciente.
	const eventoRelevante = (() => {
		const eventos = consulta.eventos ?? [];
		if (!eventos.length) return null;
		const activos = eventos.filter((e) => e.estado === "pendiente" || e.estado === "confirmada");
		const ordenAsc = (a, b) => new Date(`${a.fecha}T${a.horaInicio || "00:00"}`) - new Date(`${b.fecha}T${b.horaInicio || "00:00"}`);
		if (activos.length) return [...activos].sort(ordenAsc)[0];
		return [...eventos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
	})();

	// ── Cambiar estado ──────────────────────────────────────────────────────
	async function handleCambiarEstado(nuevoEstado) {
		await onUpdate(consulta.id, { estado: nuevoEstado });
	}

	async function handleAgregarNota() {
		const t = notaTexto.trim();
		if (!t) return;
		try {
			setEnviando(true);
			const data = await createHistorial(consulta.id, { tipo: "respuesta", texto: t }, { rol: userRol, userId });
			onHistorialUpdate(consulta.id, data.resp);
			setNotaTexto("");
		} catch (err) {
			console.error(err);
		} finally {
			setEnviando(false);
		}
	}

	async function handleUpdateNota(entradaId, texto) {
		const data = await updateHistorial(consulta.id, entradaId, { texto }, { rol: userRol, userId });
		onHistorialUpdate(consulta.id, data.resp, "update");
	}

	async function handleDeleteNota(entradaId) {
		await deleteHistorial(consulta.id, entradaId, { rol: userRol, userId });
		onHistorialUpdate(consulta.id, { id: entradaId }, "delete");
	}

	// ── Editar consulta ────────────────────────────────────────────────────
	function abrirEdicion() {
		const formaPago = (() => {
			let fp = consulta.formaPago;
			if (typeof fp === "string") {
				try {
					fp = JSON.parse(fp);
				} catch {
					fp = [fp];
				}
			}
			return Array.isArray(fp) ? fp : ["a_definir"];
		})();
		setEditForm({
			nombre: consulta.nombre ?? "",
			apellido: consulta.apellido ?? "",
			telefono: consulta.telefono ?? "",
			vehiculo: consulta.vehiculo ?? "",
			categoria: consulta.categoria ?? "",
			presupuesto: consulta.presupuesto ?? "",
			moneda: consulta.moneda ?? "USD",
			formaPago,
			notas: consulta.notas ?? "",
			asesorId: consulta.asesorId ?? "",
		});
		setEditando(true);
	}

	async function handleEliminarConsulta() {
		try {
			setEliminando(true);
			await deleteConsulta(consulta.id);
			onDelete?.(consulta.id);
			onClose();
		} catch (err) {
			console.error(err);
		} finally {
			setEliminando(false);
			setConfirmandoEliminar(false);
		}
	}

	async function handleGuardarEdicion() {
		try {
			setGuardando(true);
			await onUpdate(consulta.id, editForm);
			setEditando(false);
		} catch (err) {
			console.error(err);
		} finally {
			setGuardando(false);
		}
	}

	async function handleEmpezarChat() {
		if (iniciandoChat) return;
		setErrorChat(null);
		setIniciandoChat(true);
		try {
			const data = await iniciarConversacion(
				{
					telefono: consulta.telefono,
					nombre: consulta.nombre,
					apellido: consulta.apellido,
					consultaId: consulta.id,
					vehiculo: consulta.vehiculo,
				},
				{ rol: userRol, userId },
			);
			if (data?.resp?.id) {
				navigate(`/crm/conversaciones?id=${data.resp.id}`);
			}
		} catch (err) {
			console.error(err);
			setErrorChat(err?.error || "No se pudo iniciar la conversación.");
		} finally {
			setIniciandoChat(false);
		}
	}

	const idxActual = PIPELINE_ESTADOS.indexOf(consulta.estado);

	return (
		<AnimatePresence>
			{consulta && (
				<>
					<motion.div className="cq-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
					<motion.aside
						className="cq-drawer"
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 28, stiffness: 300 }}
					>
						{/* Header */}
						<div className="cq-drawer__header">
							<div className="cq-drawer__header-left">
								<div className="cq-drawer__avatar">{nombre ? nombre.charAt(0).toUpperCase() : "?"}</div>
								<div>
									<h2 className="cq-drawer__nombre">{nombre ?? "Cliente privado"}</h2>
									{puedeVerDatos && consulta.telefono && <p className="cq-drawer__sub">{consulta.telefono}</p>}
								</div>
							</div>
							<div className="cq-drawer__header-actions">
								{!editando && puedeEditar && (
									<>
										<button className="cq-drawer__delete-btn" onClick={() => setConfirmandoEliminar(true)} title="Eliminar consulta">
											<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
												<path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H2.506a.58.58 0 00-.01 0H1.5a.5.5 0 000 1h.538l.853 10.66A2 2 0 004.885 16h6.23a2 2 0 001.994-1.84l.853-10.66H14.5a.5.5 0 000-1h-.995a.59.59 0 00-.01 0H11zm1.958 1l-.846 10.58a1 1 0 01-.997.92h-6.23a1 1 0 01-.997-.92L3.042 3.5h9.916z" />
											</svg>
										</button>

										<button className="cq-drawer__edit-btn" onClick={abrirEdicion} title="Editar consulta">
											<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
												<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
												<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
											</svg>
										</button>
									</>
								)}
								<button className="cq-drawer__close" onClick={onClose}>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
								{!editando && puedeVerDatos && consulta.conversacionId && (
									<button
										className="cq-drawer__edit-btn"
										title="Ver conversación"
										onClick={() => navigate(`/crm/conversaciones?id=${consulta.conversacionId}`)}
									>
										<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
										</svg>
									</button>
								)}
								{!editando && eventoRelevante && (
									<button
										className="cq-drawer__edit-btn"
										title="Ver cita agendada"
										onClick={() => navigate(`/crm/calendario?id=${eventoRelevante.id}`)}
									>
										<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
											<line x1="16" y1="2" x2="16" y2="6" />
											<line x1="8" y1="2" x2="8" y2="6" />
											<line x1="3" y1="10" x2="21" y2="10" />
										</svg>
									</button>
								)}
								{!editando && esAdmin && puedeVerDatos && !consulta.conversacionId && consulta.telefono && (
									<button className="cq-drawer__edit-btn" title="Empezar chat" onClick={handleEmpezarChat} disabled={iniciandoChat}>
										{iniciandoChat ? (
											"..."
										) : (
											<svg
												width="15"
												height="15"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<line x1="22" y1="2" x2="11" y2="13" />
												<polygon points="22 2 15 22 11 13 2 9 22 2" />
											</svg>
										)}
									</button>
								)}
							</div>
						</div>
						{confirmandoEliminar && (
							<div className="cq-confirm-block cq-confirm-block--danger">
								<p className="cq-confirm-text">¿Eliminar esta consulta? Esta acción no se puede deshacer.</p>

								<div className="cq-confirm-btns">
									<button className="cq-btn-cancel-confirm" onClick={() => setConfirmandoEliminar(false)} disabled={eliminando}>
										Cancelar
									</button>
									<button className="cq-btn-confirm cq-btn-confirm--danger" onClick={handleEliminarConsulta} disabled={eliminando}>
										{eliminando ? "Eliminando..." : "Eliminar"}
									</button>
								</div>
							</div>
						)}

						{errorChat && (
							<div className="cq-confirm-block cq-confirm-block--danger">
								<p className="cq-confirm-text">{errorChat}</p>
								<div className="cq-confirm-btns">
									<button className="cq-btn-cancel-confirm" onClick={() => setErrorChat(null)}>
										Cerrar
									</button>
								</div>
							</div>
						)}

						{/* Badges */}
						<div className="cq-drawer__badges">
							<EstadoBadge estado={consulta.estado} withTooltip />
							<OrigenChip origen={consulta.origen} withTooltip />
							{consulta.cargadoPor !== "bot" && (
								<Tooltip text={BADGE_TOOLTIP.manual}>
									<span className="cq-badge cq-badge--manual">
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
											<path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
										</svg>
										Manual
									</span>
								</Tooltip>
							)}
						</div>

						{/* ── Modo edición ──────────────────────────────────────── */}
						{editando && puedeEditar ? (
							<div className="cq-drawer__section cq-drawer__section--edit">
								<h3 className="cq-drawer__section-title">Editar consulta</h3>
								<div className="cq-edit-grid">
									<label className="cq-edit-field">
										<span className="cq-drawer__label">Nombre</span>
										<input
											className="cq-edit-input"
											value={editForm.nombre}
											onChange={(e) => setEditForm((p) => ({ ...p, nombre: e.target.value }))}
										/>
									</label>
									<label className="cq-edit-field">
										<span className="cq-drawer__label">Apellido</span>
										<input
											className="cq-edit-input"
											value={editForm.apellido}
											onChange={(e) => setEditForm((p) => ({ ...p, apellido: e.target.value }))}
										/>
									</label>
									{puedeVerDatos && (
										<label className="cq-edit-field">
											<span className="cq-drawer__label">Teléfono</span>
											<input
												className="cq-edit-input"
												value={editForm.telefono}
												onChange={(e) => setEditForm((p) => ({ ...p, telefono: e.target.value }))}
											/>
										</label>
									)}
									<label className="cq-edit-field">
										<span className="cq-drawer__label">Vehículo</span>
										<input
											className="cq-edit-input"
											value={editForm.vehiculo}
											onChange={(e) => setEditForm((p) => ({ ...p, vehiculo: e.target.value }))}
										/>
									</label>
									<label className="cq-edit-field">
										<span className="cq-drawer__label">Categoría</span>
										<input
											className="cq-edit-input"
											value={editForm.categoria}
											onChange={(e) => setEditForm((p) => ({ ...p, categoria: e.target.value }))}
										/>
									</label>
									<label className="cq-edit-field">
										<span className="cq-drawer__label">Presupuesto</span>
										<div className="cq-edit-presupuesto">
											<select
												className="cq-edit-select cq-edit-select--moneda"
												value={editForm.moneda}
												onChange={(e) => setEditForm((p) => ({ ...p, moneda: e.target.value }))}
											>
												<option value="USD">USD</option>
												<option value="ARS">ARS</option>
											</select>
											<input
												className="cq-edit-input"
												type="number"
												value={editForm.presupuesto}
												onChange={(e) => setEditForm((p) => ({ ...p, presupuesto: e.target.value }))}
											/>
										</div>
									</label>
									<label className="cq-edit-field">
										<span className="cq-drawer__label">Forma de pago</span>
										<div className="cq-edit-checkboxes">
											{FORMAS_PAGO.map((op) => (
												<label key={op} className="cq-edit-checkbox">
													<input
														type="checkbox"
														checked={(editForm.formaPago || []).includes(op)}
														onChange={(e) => {
															const actual = editForm.formaPago || [];
															const nuevo = e.target.checked
																? [...actual.filter((x) => x !== "a_definir"), op]
																: actual.filter((x) => x !== op);
															setEditForm((p) => ({ ...p, formaPago: nuevo.length ? nuevo : ["a_definir"] }));
														}}
													/>
													{FORMAS_PAGO_LABEL[op]}
												</label>
											))}
										</div>
									</label>

									{/* Asignación de asesor — solo admin/supervisor */}
									{(esAdmin || esSupervisor) && (
										<label className="cq-edit-field cq-edit-field">
											<span className="cq-drawer__label">Asesor asignado</span>
											{loadingUsuarios ? (
												<span className="cq-edit-loading">Cargando asesores…</span>
											) : (
												<select
													className="cq-edit-select"
													value={editForm.asesorId}
													onChange={(e) => setEditForm((p) => ({ ...p, asesorId: e.target.value }))}
												>
													<option value="">Sin asignar</option>
													{usuarios.map((u) => (
														<option key={u.id} value={u.id}>
															{u.name}
														</option>
													))}
												</select>
											)}
										</label>
									)}

									<label className="cq-edit-field cq-edit-field--full">
										<span className="cq-drawer__label">Notas</span>
										<textarea
											className="cq-edit-textarea"
											value={editForm.notas}
											rows={3}
											onChange={(e) => setEditForm((p) => ({ ...p, notas: e.target.value }))}
										/>
									</label>
								</div>

								<div className="cq-edit-actions">
									<button className="cq-edit-btn cq-edit-btn--cancel" onClick={() => setEditando(false)} disabled={guardando}>
										Cancelar
									</button>
									<button className="cq-edit-btn cq-edit-btn--save" onClick={handleGuardarEdicion} disabled={guardando}>
										{guardando ? "Guardando…" : "Guardar cambios"}
									</button>
								</div>
							</div>
						) : (
							/* ── Modo visualización ─────────────────────────────── */
							<>
								<div className="cq-drawer__section">
									<h3 className="cq-drawer__section-title">Información del interés</h3>
									<div className="cq-drawer__grid">
										<div className="cq-drawer__field">
											<span className="cq-drawer__label">Vehículo</span>
											<span className="cq-drawer__value">{consulta.vehiculo}</span>
										</div>
										{consulta.categoria && (
											<div className="cq-drawer__field">
												<span className="cq-drawer__label">Categoría</span>
												<span className="cq-drawer__value">{consulta.categoria}</span>
											</div>
										)}
										<div className="cq-drawer__field">
											<span className="cq-drawer__label">Presupuesto</span>
											<span className="cq-drawer__value cq-drawer__value--accent">
												{consulta.moneda || "USD"} {consulta.presupuesto ? Number(consulta.presupuesto).toLocaleString("es-AR") : "—"}
											</span>
										</div>
										<div className="cq-drawer__field">
											<span className="cq-drawer__label">Forma de pago</span>
											<span className="cq-drawer__value">
												{(() => {
													let fp = consulta.formaPago;
													if (typeof fp === "string") {
														try {
															fp = JSON.parse(fp);
														} catch {
															fp = [fp];
														}
													}
													if (!Array.isArray(fp)) fp = ["a_definir"];
													return fp.map((f) => FORMAS_PAGO_LABEL[f] ?? f).join(" + ");
												})()}
											</span>
										</div>
										<div className="cq-drawer__field">
											<span className="cq-drawer__label">Asesor</span>
											<span className="cq-drawer__value">{formatAsesor(consulta.asesorNombre, consulta.asesorApellido)}</span>
										</div>
										<div className="cq-drawer__field">
											<span className="cq-drawer__label">Fecha</span>
											<span className="cq-drawer__value">{formatFechaLarga(consulta.createdAt)}</span>
										</div>
									</div>
								</div>

								{consulta.notas && (
									<div className="cq-drawer__section">
										<h3 className="cq-drawer__section-title">Notas</h3>
										<p className="cq-drawer__notas">{consulta.notas}</p>
									</div>
								)}
							</>
						)}

						{/* Pipeline — se muestra siempre */}
						{consulta.estado !== "cerrado" && (
							<div className="cq-drawer__section">
								<h3 className="cq-drawer__section-title">Proceso de consulta</h3>
								<div className="cq-pipeline-steps">
									{PIPELINE_ESTADOS.map((e) => {
										const idxE = PIPELINE_ESTADOS.indexOf(e);
										const actual = e === consulta.estado;
										const pasado = idxE < idxActual;
										const color = ESTADO_COLOR[e];
										return (
											<button
												key={e}
												className={`cq-pipeline-step${actual ? " cq-pipeline-step--active" : ""}${pasado ? " cq-pipeline-step--done" : ""}`}
												style={{ "--step-color": color }}
												onClick={() => !actual && handleCambiarEstado(e)}
												disabled={actual}
												title={`Mover a ${ESTADO_LABEL[e]}`}
											>
												<span className="cq-pipeline-step__dot" />
												<span className="cq-pipeline-step__label">{ESTADO_LABEL[e]}</span>
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Historial */}
						<div className="cq-drawer__section cq-drawer__section--historial">
							<h3 className="cq-drawer__section-title">Historial de notas</h3>
							<div className="cq-drawer__timeline">
								{(consulta.historial ?? []).map((h, i) => (
									<HistorialItem
										key={h.id ?? i}
										entrada={h}
										index={i}
										total={consulta.historial?.length ?? 0}
										userId={userId}
										asesorId={consulta.asesorId}
										esAdmin={esAdmin}
										esSupervisor={esSupervisor}
										onUpdate={(id, texto) => handleUpdateNota(id, texto)}
										onDelete={(id) => handleDeleteNota(id)}
									/>
								))}
							</div>

							<div className="cq-nota-add">
								<textarea
									className="cq-nota-input"
									value={notaTexto}
									onChange={(e) => setNotaTexto(e.target.value)}
									placeholder="Agregar nota al historial..."
									rows={2}
									onKeyDown={(e) => {
										if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAgregarNota();
									}}
								/>
								<button className="cq-nota-btn" onClick={handleAgregarNota} disabled={!notaTexto.trim() || enviando}>
									{enviando ? "..." : "Agregar"}
								</button>
							</div>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
