// components/CRM/Calendario/CitaDrawer/CitaDrawer.jsx
import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import "./CitaDrawer.css";
import { TIPO_COLORS, TIPO_LABELS, ESTADO_COLORS, ESTADO_LABELS, isPasadoSinFinalizar } from "../../../../constants/crmCalendario";
import { useNavigate } from "react-router-dom";
import { getConsultaById } from "../../../../services/consultas.service";
import { iniciarConversacion } from "../../../../services/conversaciones.service";

const TIPO_HISTORIAL_LABEL = {
	whatsapp: "WhatsApp",
	llamada: "Llamada",
	visita: "Visita",
	respuesta: "Respuesta",
	facebook: "Facebook",
	instagram: "Instagram",
	sistema: "Sistema",
	otro: "Otro",
};

export default function CitaDrawer({ cita, open, onClose, onMarcarRealizada, onCancelar, onEditar, onEliminar, onConversacionIniciada, currentUser, esAdmin }) {
	const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
	const [modalizando, setModalizando] = useState(false);
	const [notasFin, setNotasFin] = useState("");
	const [eliminando, setEliminando] = useState(false);
	const [historialConsulta, setHistorialConsulta] = useState(null);
	const [iniciandoChat, setIniciandoChat] = useState(false);
	const [errorChat, setErrorChat] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		setModalizando(false);
		setNotasFin("");
		setConfirmandoEliminar(false);
		setEliminando(false);
		setHistorialConsulta(null);
		setErrorChat(null);
	}, [cita?.id]);

	useEffect(() => {
		if (!cita?.consultaId) return;
		let cancelado = false;
		getConsultaById(cita.consultaId)
			.then((data) => {
				if (!cancelado) setHistorialConsulta(data.resp?.historial ?? []);
			})
			.catch(() => {
				if (!cancelado) setHistorialConsulta([]);
			});
		return () => {
			cancelado = true;
		};
	}, [cita?.consultaId]);

	if (!cita) return null;

	const tipoColor = TIPO_COLORS[cita.tipo] || "#94a3b8";
	const estadoColor = ESTADO_COLORS[cita.estado] || "#888";
	const pasadoSinFinalizar = isPasadoSinFinalizar(cita);
	const tipoLabel = cita.tipo === "otro" && cita.tipoPersonalizado ? cita.tipoPersonalizado : TIPO_LABELS[cita.tipo] || cita.tipo;
	const esCreador = currentUser && cita.creadoPorId === currentUser.id;
	const esInvitado = cita.invitados?.some((inv) => inv.id === currentUser?.id);
	const puedeEditar = esAdmin || esCreador;
	const soloPuedeVer = !puedeEditar && esInvitado;

	function handleConfirmarFinalizar() {
		onMarcarRealizada(cita.id, notasFin.trim());
		setModalizando(false);
		setNotasFin("");
	}

	async function handleIniciarConversacion() {
		if (iniciandoChat) return;
		setErrorChat(null);
		setIniciandoChat(true);
		try {
			const data = await iniciarConversacion({
				telefono: cita.clienteTelefono,
				nombre: cita.clienteNombre,
				apellido: cita.clienteApellido,
				vehiculo: cita.vehiculo,
				eventoId: cita.id,
			});
			if (data?.resp?.id) {
				onConversacionIniciada?.(cita.id, data.resp.id);
				navigate(`/CRM/conversaciones?id=${data.resp.id}`);
			}
		} catch (err) {
			console.error(err);
			setErrorChat(err?.error || "No se pudo iniciar la conversación.");
		} finally {
			setIniciandoChat(false);
		}
	}

	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "cita-drawer__paper" }}>
			<div className="cita-drawer">
				{pasadoSinFinalizar && (
					<div className="cita-drawer__banner-vencido">
						<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
							<circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.6" />
							<path d="M7 4v3.5M7 10h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
						Este evento ya pasó — marcalo como realizado o cancelado
					</div>
				)}

				{/* Header: título + close */}
				<div className="cita-drawer__header">
					<div className="cita-drawer__header-meta">
						<span className="cita-drawer__chip" style={{ "--chip-color": tipoColor }}>
							{tipoLabel}
						</span>
						<span className="cita-drawer__chip" style={{ "--chip-color": estadoColor }}>
							{ESTADO_LABELS[cita.estado] || cita.estado}
						</span>
					</div>
					<h2 className="cita-drawer__titulo">{cita.titulo}</h2>
					{(cita.clienteNombre || cita.clienteApellido) && (
						<p className="cita-drawer__subtitulo">
							{cita.clienteNombre} {cita.clienteApellido}
							{cita.clienteTelefono && <span className="cita-drawer__tel"> · {cita.clienteTelefono}</span>}
						</p>
					)}
					<div className="cita-drawer__header-actions">
						{cita.tipo === "visita" && cita.clienteTelefono && cita.conversacionId && (
							<button
								className="cita-drawer__header-action-btn"
								title="Ver conversación"
								onClick={() => navigate(`/CRM/conversaciones?id=${cita.conversacionId}`)}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
								</svg>
							</button>
						)}
						{cita.tipo === "visita" && cita.clienteTelefono && !cita.conversacionId && esAdmin && (
							<button
								className="cita-drawer__header-action-btn"
								title="Iniciar conversación"
								onClick={handleIniciarConversacion}
								disabled={iniciandoChat}
							>
								{iniciandoChat ? (
									<span className="cita-drawer__spinner" />
								) : (
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<line x1="22" y1="2" x2="11" y2="13" />
										<polygon points="22 2 15 22 11 13 2 9 22 2" />
									</svg>
								)}
							</button>
						)}
						{cita.consultaId && (
							<button
								className="cita-drawer__header-action-btn"
								title="Ver consulta"
								onClick={() => navigate(`/crm/consultas?id=${cita.consultaId}`)}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<circle cx="11" cy="11" r="7" />
									<line x1="21" y1="21" x2="16.65" y2="16.65" />
								</svg>
							</button>
						)}
						<button className="cita-drawer__close" onClick={onClose} aria-label="Cerrar">
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
							</svg>
						</button>
					</div>
				</div>

				<div className="cita-drawer__divider" />

				{errorChat && (
					<div className="cita-drawer__confirm-eliminar">
						<p className="cita-drawer__confirm-text">{errorChat}</p>
						<div className="cita-drawer__confirm-btns">
							<button className="cita-drawer__fin-btn cita-drawer__fin-btn--cancel" onClick={() => setErrorChat(null)}>
								Cerrar
							</button>
						</div>
					</div>
				)}

				{/* Detalle */}
				<div className="cita-drawer__section">
					<p className="cita-drawer__section-label">Detalle</p>
					<div className="cita-drawer__datos">
						<DataRow label="Fecha" value={cita.fecha} />
						<DataRow label="Horario" value={`${cita.horaInicio}${cita.horaFin ? ` – ${cita.horaFin}` : ""}`} />
						{cita.vehiculo && <DataRow label="Vehículo" value={cita.vehiculo} />}
						{cita.usuarioNombre && <DataRow label="Responsable" value={cita.usuarioNombre} />}
						{cita.creadoPorNombre && <DataRow label="Creado por" value={cita.creadoPorNombre} />}
					</div>
				</div>

				{/* Invitados */}
				{cita.invitados?.length > 0 && (
					<>
						<div className="cita-drawer__divider" />
						<div className="cita-drawer__section">
							<p className="cita-drawer__section-label">Invitados</p>
							{cita.tipo === "visita" && <p className="cita-drawer__invitados-nota">Se invita automáticamente a todo el equipo.</p>}
							<div className="cita-drawer__invitados">
								{cita.invitados.map((inv) => (
									<span key={inv.id} className="cita-drawer__invitado-pill">
										<span className="cita-drawer__invitado-avatar">{inv.name ? inv.name.charAt(0).toUpperCase() : "?"}</span>
										{inv.name ?? `Usuario #${inv.id}`}
									</span>
								))}
							</div>
						</div>
					</>
				)}

				{/* Notas previas */}
				{cita.notas && (
					<>
						<div className="cita-drawer__divider" />
						<div className="cita-drawer__section">
							<p className="cita-drawer__section-label">Notas previas</p>
							<p className="cita-drawer__notas">{cita.notas}</p>
						</div>
					</>
				)}

				{/* Notas de finalización */}
				{cita.estado === "realizada" && cita.notasFinalizacion && (
					<>
						<div className="cita-drawer__divider" />
						<div className="cita-drawer__section">
							<p className="cita-drawer__section-label">Lo que pasó</p>
							<p className="cita-drawer__notas cita-drawer__notas--fin">{cita.notasFinalizacion}</p>
						</div>
					</>
				)}

				{/* Historial de la consulta vinculada (solo lectura) */}
				{cita.consultaId && historialConsulta?.length > 0 && (
					<>
						<div className="cita-drawer__divider" />
						<div className="cita-drawer__section">
							<p className="cita-drawer__section-label">Historial de la consulta</p>
							<div className="cita-drawer__historial">
								{historialConsulta.map((h, i) => (
									<div key={h.id ?? i} className="cita-drawer__historial-item">
										<div className="cita-drawer__historial-meta">
											<span className="cita-drawer__historial-tipo">{TIPO_HISTORIAL_LABEL[h.tipo] || h.tipo}</span>
											{h.createdAt && (
												<span className="cita-drawer__historial-fecha">
													{new Date(h.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
												</span>
											)}
										</div>
										<p className="cita-drawer__historial-texto">{h.texto}</p>
									</div>
								))}
							</div>
						</div>
					</>
				)}

				{/* Panel de finalización */}
				{modalizando && (
					<>
						<div className="cita-drawer__divider" />
						<div className="cita-drawer__section cita-drawer__section--fin">
							<p className="cita-drawer__section-label">¿Qué pasó en este evento?</p>
							<textarea
								className="cita-drawer__fin-textarea"
								value={notasFin}
								onChange={(e) => setNotasFin(e.target.value)}
								placeholder="Resumí brevemente lo hablado, resultados, próximos pasos…"
								rows={4}
								autoFocus
							/>
							<div className="cita-drawer__fin-actions">
								<button className="cita-drawer__fin-btn cita-drawer__fin-btn--cancel" onClick={() => setModalizando(false)}>
									Volver
								</button>
								<button className="cita-drawer__fin-btn cita-drawer__fin-btn--confirm" onClick={handleConfirmarFinalizar}>
									Confirmar
								</button>
							</div>
						</div>
					</>
				)}

				{/* Acciones */}
				{!modalizando && (
					<div className="cita-drawer__actions">
						{soloPuedeVer && <p className="cita-drawer__estado-final">Sos invitado a este evento</p>}

						{puedeEditar && (
							<>
								{!confirmandoEliminar ? (
									<button
										className="cita-drawer__action-btn cita-drawer__action-btn--eliminar"
										onClick={() => setConfirmandoEliminar(true)}
									>
										Eliminar evento
									</button>
								) : (
									<div className="cita-drawer__confirm-eliminar">
										<p className="cita-drawer__confirm-text">¿Confirmás? Esta acción es irreversible.</p>
										<div className="cita-drawer__confirm-btns">
											<button className="cita-drawer__fin-btn cita-drawer__fin-btn--cancel" onClick={() => setConfirmandoEliminar(false)}>
												Cancelar
											</button>
											<button
												className="cita-drawer__fin-btn cita-drawer__fin-btn--eliminar"
												onClick={async () => {
													setEliminando(true);
													await onEliminar(cita.id);
													onClose();
												}}
												disabled={eliminando}
											>
												{eliminando ? <span className="cita-drawer__spinner" /> : "Sí, eliminar"}
											</button>
										</div>
									</div>
								)}
							</>
						)}

						{cita.estado === "realizada" && <p className="cita-drawer__estado-final">Evento finalizado</p>}
						{cita.estado === "cancelada" && (
							<p className="cita-drawer__estado-final cita-drawer__estado-final--cancelada">Evento cancelado</p>
						)}

						{cita.estado !== "realizada" && cita.estado !== "cancelada" && puedeEditar && (
							<>
								<button className="cita-drawer__action-btn cita-drawer__action-btn--editar" onClick={() => onEditar(cita)}>
									Editar evento
								</button>
								<button
									className={`cita-drawer__action-btn cita-drawer__action-btn--realizada${pasadoSinFinalizar ? " cita-drawer__action-btn--pulse" : ""}`}
									onClick={() => setModalizando(true)}
								>
									Marcar como realizado
								</button>
								<button className="cita-drawer__action-btn cita-drawer__action-btn--cancelar" onClick={() => onCancelar(cita.id)}>
									Cancelar evento
								</button>
							</>
						)}
					</div>
				)}
			</div>
		</Drawer>
	);
}

function DataRow({ label, value }) {
	return (
		<div className="cita-drawer__data-row">
			<span className="cita-drawer__data-label">{label}</span>
			<span className="cita-drawer__data-value">{value}</span>
		</div>
	);
}
