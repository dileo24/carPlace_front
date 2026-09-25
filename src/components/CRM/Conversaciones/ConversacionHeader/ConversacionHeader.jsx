import React, { useState, useEffect, useRef } from "react";
import "./ConversacionHeader.css";
import { ESTADOS_CONVERSACION, formatTelefono, getVisitaPendiente, formatFechaCorta } from "../../../../constants/crmConversaciones";
import {
	WhatsAppIcon,
	InstagramIcon,
	BotIcon,
	AsesorIcon,
	ChevronLeftIcon,
	UserIcon,
	CalendarIcon,
} from "../../../../constants/crmConversacionesIcons";

const ConversacionHeader = ({
	conversacion,
	onTomarControl,
	onDevolverBot,
	onSoltar,
	userId,
	onReabrir,
	onVolver,
	onVerPerfil,
	esVendedor,
	esSupervisor,
	esAdmin,
	onEliminar,
	onCerrar,
	onMarcarNoLeido,
}) => {
	if (!conversacion) return null;
	const visitaPendiente = getVisitaPendiente(conversacion);
	const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
	const [eliminando, setEliminando] = useState(false);
	const [eligiendoEstadoConsulta, setEligiendoEstadoConsulta] = useState(false);
	const [cerrando, setCerrando] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	// Igual que ESTADOS_ACTIVOS en el backend (services/consultasHelper.js) —
	// si la consulta vinculada ya está en un estado terminal, cerrar el chat
	// no necesita preguntar nada, ya está resuelta.
	const ESTADOS_ACTIVOS_CONSULTA = ["nuevo", "con_oferta", "seguimiento"];
	const consultaActivaVinculada =
		conversacion.consulta && ESTADOS_ACTIVOS_CONSULTA.includes(conversacion.consulta.estado)
			? conversacion.consulta
			: null;

	const estadoConfig = ESTADOS_CONVERSACION[conversacion.estado];
	const esBot = conversacion.estado === "bot";
	const esAsesor = conversacion.estado === "asesor";
	const esCerrada = conversacion.estado === "cerrada";

	const CanalIcon = conversacion.canal === "WhatsApp" ? WhatsAppIcon : InstagramIcon;
	const canalColor = conversacion.canal === "WhatsApp" ? "#25d366" : "#e1306c";

	const puedeForzarTomar = esAdmin && conversacion.asesorId && String(conversacion.asesorId) !== String(userId);

	const iniciales =
		conversacion.contactoNombre && conversacion.contactoApellido
			? `${conversacion.contactoNombre[0]}${conversacion.contactoApellido[0]}`.toUpperCase()
			: conversacion.contactoNombre?.[0]?.toUpperCase() || "??";
	const nombreVisible = `${conversacion.contactoNombre} ${conversacion.contactoApellido || ""}`.trim();

	const handleConfirmarEliminar = async () => {
		setEliminando(true);
		try {
			await onEliminar();
		} finally {
			setEliminando(false);
			setConfirmandoEliminar(false);
		}
	};

	const handleClickCerrar = () => {
		if (consultaActivaVinculada) {
			// Tiene una consulta activa vinculada: no se puede cerrar el chat sin
			// antes decidir con qué desenlace queda esa consulta.
			setEligiendoEstadoConsulta(true);
		} else {
			onCerrar();
		}
	};

	const handleElegirEstadoConsulta = async (estadoConsulta) => {
		setCerrando(true);
		try {
			await onCerrar(estadoConsulta);
		} finally {
			setCerrando(false);
			setEligiendoEstadoConsulta(false);
		}
	};

	// Cerrar menú al hacer click fuera
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		};
		if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuOpen]);

	useEffect(() => {
		setConfirmandoEliminar(false);
		setEligiendoEstadoConsulta(false);
		setMenuOpen(false);
	}, [conversacion?.id]);

	return (
		<>
			<header className="conv-header">
				<button className="conv-header__back" onClick={onVolver} aria-label="Volver">
					<ChevronLeftIcon size={20} />
				</button>

				<div className="conv-header__avatar">
					<span>{iniciales}</span>
					<span className="conv-header__avatar-canal" style={{ color: canalColor }}>
						<CanalIcon size={11} />
					</span>
				</div>

				<div className="conv-header__info">
					<div className="conv-header__nombre">
						<span className="conv-header__telefono">{formatTelefono(conversacion.telefono)}</span>
						{conversacion.contactoNombre && <span className="conv-header__alias">{nombreVisible}</span>}
					</div>
					<div className="conv-header__sub">
						{!esAsesor && (
							<span style={{ color: estadoConfig.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
								{esBot && <BotIcon size={12} />}
								{(esCerrada || esBot) && estadoConfig.label}
							</span>
						)}
						{conversacion.asesorNombre && (
							<>
								{!esAsesor && <span className="conv-header__sep">·</span>}
								<span style={{ color: "#f97316" }}>
									{conversacion.asesorNombre} {conversacion.asesorApellido}
								</span>
							</>
						)}
						{conversacion.origen && conversacion.origen !== "WhatsApp" && (
							<>
								<span className="conv-header__sep">·</span>
								<span style={{ color: "#666", fontSize: 12 }}>via {conversacion.origen}</span>
							</>
						)}
					</div>
				</div>

				{/* ── Menú de acciones ── */}
				<div className="conv-header__acciones" ref={menuRef}>
					<button
						className={`conv-header__menu-btn ${menuOpen ? "conv-header__menu-btn--open" : ""}`}
						onClick={() => setMenuOpen((v) => !v)}
						title="Acciones"
					>
						<svg viewBox="0 0 16 16" fill="currentColor" width="15" height="15">
							<circle cx="8" cy="3" r="1.4" />
							<circle cx="8" cy="8" r="1.4" />
							<circle cx="8" cy="13" r="1.4" />
						</svg>
					</button>

					{menuOpen && (
						<div className="conv-header__dropdown">
							{/* Perfil */}
							<button
								className="conv-header__dropdown-item"
								onClick={() => {
									onVerPerfil();
									setMenuOpen(false);
								}}
							>
								<UserIcon size={14} />
								<span>Ver perfil</span>
							</button>

							{/* Tomar control */}
							{(esBot || (esAsesor && (!conversacion.asesorId || puedeForzarTomar))) && !esSupervisor && (
								<button
									className="conv-header__dropdown-item conv-header__dropdown-item--tomar"
									onClick={() => {
										onTomarControl();
										setMenuOpen(false);
									}}
								>
									<AsesorIcon size={14} />
									<span>Tomar control</span>
								</button>
							)}
							{esAsesor && conversacion.asesorId && String(conversacion.asesorId) === String(userId) && (
								<button
									className="conv-header__dropdown-item"
									onClick={() => {
										onSoltar();
										setMenuOpen(false);
									}}
								>
									<AsesorIcon size={14} />
									<span>Soltar conversación</span>
								</button>
							)}
							{/* Devolver al bot */}
							{esAsesor && !esSupervisor && (esAdmin || String(conversacion.asesorId) === String(userId)) && (
								<button
									className="conv-header__dropdown-item conv-header__dropdown-item--devolver"
									onClick={() => {
										onDevolverBot();
										setMenuOpen(false);
									}}
								>
									<BotIcon size={14} />
									<span>Devolver al bot</span>
								</button>
							)}
							{/* Marcar como no leído */}
							{esAdmin && (
								<button
									className="conv-header__dropdown-item"
									onClick={() => {
										onMarcarNoLeido();
										setMenuOpen(false);
									}}
								>
									<svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
										<circle cx="8" cy="8" r="5" />
									</svg>
									<span>Marcar como no leído</span>
								</button>
							)}
							{/* Separador */}
							{(esAdmin || esSupervisor) && <div className="conv-header__dropdown-sep" />}

							{/* Cerrar */}
							{(esAdmin || esSupervisor) && !esCerrada && (
								<button
									className="conv-header__dropdown-item conv-header__dropdown-item--cerrar"
									onClick={() => {
										handleClickCerrar();
										setMenuOpen(false);
									}}
								>
									<svg viewBox="0 0 16 16" fill="none" width="13" height="13">
										<path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
									</svg>
									<span>Cerrar conversación</span>
								</button>
							)}
							{/* Reabrir */}
							{(esAdmin || esSupervisor) && esCerrada && (
								<button
									className="conv-header__dropdown-item"
									onClick={() => {
										onReabrir();
										setMenuOpen(false);
									}}
								>
									<AsesorIcon size={14} />
									<span>Reabrir conversación</span>
								</button>
							)}
							{/* Eliminar */}
							{esAdmin && (
								<button
									className="conv-header__dropdown-item conv-header__dropdown-item--eliminar"
									onClick={() => {
										setConfirmandoEliminar((v) => !v);
										setMenuOpen(false);
									}}
								>
									<svg viewBox="0 0 16 16" fill="none" width="13" height="13">
										<path
											d="M2 4h12M5 4V2.5h6V4M6.5 7v5M9.5 7v5M3 4l1 9.5h8L13 4"
											stroke="currentColor"
											strokeWidth="1.4"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<span>Eliminar conversación</span>
								</button>
							)}
						</div>
					)}
				</div>
			</header>

			{visitaPendiente && (
				<button className="conv-header__visita-banner" onClick={onVerPerfil}>
					<CalendarIcon size={13} />
					<span>
						Visita pendiente: {formatFechaCorta(visitaPendiente.fecha)}
						{visitaPendiente.horaInicio ? ` · ${visitaPendiente.horaInicio}` : ""}
					</span>
				</button>
			)}

			{eligiendoEstadoConsulta && (
				<div className="conv-header__confirmar-banner">
					<span className="conv-header__confirmar-texto">
						Esta conversación tiene una consulta activa vinculada. ¿Cómo se resolvió?
					</span>
					<div className="conv-header__confirmar-acciones">
						<button
							className="conv-header__confirmar-btn conv-header__confirmar-btn--cancelar"
							onClick={() => setEligiendoEstadoConsulta(false)}
							disabled={cerrando}
						>
							Cancelar
						</button>
						<button
							className="conv-header__confirmar-btn conv-header__confirmar-btn--cancelar"
							onClick={() => handleElegirEstadoConsulta("perdido")}
							disabled={cerrando}
						>
							Perdido
						</button>
						<button
							className="conv-header__confirmar-btn conv-header__confirmar-btn--confirmar"
							onClick={() => handleElegirEstadoConsulta("cerrado")}
							disabled={cerrando}
						>
							{cerrando ? <span className="conv-header__spinner" /> : null}
							Cerrado (venta concretada)
						</button>
					</div>
				</div>
			)}

			{confirmandoEliminar && (
				<div className="conv-header__confirmar-banner">
					<span className="conv-header__confirmar-texto">
						⚠️ Esta acción eliminará la conversación y todos sus mensajes de forma permanente.
					</span>
					<div className="conv-header__confirmar-acciones">
						<button
							className="conv-header__confirmar-btn conv-header__confirmar-btn--cancelar"
							onClick={() => setConfirmandoEliminar(false)}
							disabled={eliminando}
						>
							Cancelar
						</button>
						<button
							className="conv-header__confirmar-btn conv-header__confirmar-btn--confirmar"
							onClick={handleConfirmarEliminar}
							disabled={eliminando}
						>
							{eliminando ? <span className="conv-header__spinner" /> : null}
							{eliminando ? "Eliminando..." : "Eliminar"}
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default ConversacionHeader;
