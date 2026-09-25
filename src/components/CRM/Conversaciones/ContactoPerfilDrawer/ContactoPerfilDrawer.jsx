import React, { useEffect, useState, useCallback } from "react";
import { Drawer, Box, Typography, IconButton, Divider, Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { WhatsAppIcon, InstagramIcon, CalendarIcon } from "../../../../constants/crmConversacionesIcons";
import { ESTADOS_CONVERSACION, getVisitaPendiente, formatFechaCorta } from "../../../../constants/crmConversaciones";
import "./ContactoPerfilDrawer.css";
import {
	generarResumen,
	generarConsulta,
	createConversacionNota,
	deleteConversacionNota,
} from "../../../../services/conversaciones.service";
import { updateConsulta } from "../../../../services/consultas.service";
import { useAuth } from "../../../../context/AuthContext";
import NuevaCitaDrawer from "../../Calendario/NuevaCitaDrawer/NuevaCitaDrawer";
import { createEvento } from "../../../../services/calendario.service";

const btnBlue = {
	width: "100%",
	padding: "8px 0",
	background: "#020d1a",
	border: "1px solid #0a2a4a",
	borderRadius: 8,
	color: "#3b82f6",
	fontSize: 13,
	fontWeight: 600,
	cursor: "pointer",
	fontFamily: "Barlow, sans-serif",
};

const ESTADOS_CONSULTA = [
	{ value: "nuevo", label: "Nuevo", color: "#6366f1" },
	{ value: "con_oferta", label: "Con oferta", color: "#f59e0b" },
	{ value: "seguimiento", label: "Seguimiento", color: "#3b82f6" },
	{ value: "cerrado", label: "Cerrado", color: "#22c55e" },
	{ value: "perdido", label: "Perdido", color: "#6b7280" },
];

function ResumenIA({ texto, actualizando }) {
	if (actualizando) return <Typography className="resumen-ia__error">Actualizando resumen...</Typography>;
	if (!texto) return <Typography className="resumen-ia__error">Sin resumen disponible para esta conversación.</Typography>;
	return <Typography className="resumen-ia__texto">{texto}</Typography>;
}

export default function ContactoPerfilDrawer({
	conversacion,
	open,
	onClose,
	onResumenActualizado,
	onConsultaGenerada,
	onNotaActualizada,
}) {
	if (!conversacion) return null;

	const p = conversacion.perfil || {};
	const estadoConfig = ESTADOS_CONVERSACION[conversacion.estado];
	const CanalIcon = conversacion.canal === "WhatsApp" ? WhatsAppIcon : InstagramIcon;
	const canalColor = conversacion.canal === "WhatsApp" ? "#25d366" : "#e1306c";
	const iniciales = `${conversacion.contactoNombre?.[0] || "?"}${conversacion.contactoApellido?.[0] || "?"}`.toUpperCase();
	const nombreVisible = `${conversacion.contactoNombre} ${conversacion.contactoApellido || ""}`.trim();
	const esAsesor = conversacion.estado === "asesor";

	const [estadoConsulta, setEstadoConsulta] = useState(null);
	const [actualizandoConsulta, setActualizandoConsulta] = useState(false);
	const [actualizandoResumen, setActualizandoResumen] = useState(false);
	const [generandoConsulta, setGenerandoConsulta] = useState(false);
	const [resumenActualizadoEn, setResumenActualizadoEn] = useState(conversacion.resumenIAUpdatedAt || null);
	const [drawerVisitaOpen, setDrawerVisitaOpen] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, ok: true, msg: "" });
	const [notaTexto, setNotaTexto] = useState("");
	const [enviandoNota, setEnviandoNota] = useState(false);
	const notas = [...(conversacion.notas ?? [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

	const { userRol, user } = useAuth();
	const userId = user?.id;
	const navigate = useNavigate();

	// Si hay varias citas vinculadas a la consulta, priorizamos la próxima
	// pendiente/confirmada; si no hay ninguna futura, mostramos la más reciente.
	const eventoRelevante = (() => {
		const eventos = conversacion.consulta?.eventos ?? [];
		if (!eventos.length) return null;
		const activos = eventos.filter((e) => e.estado === "pendiente" || e.estado === "confirmada");
		const ordenAsc = (a, b) => new Date(`${a.fecha}T${a.horaInicio || "00:00"}`) - new Date(`${b.fecha}T${b.horaInicio || "00:00"}`);
		if (activos.length) return [...activos].sort(ordenAsc)[0];
		return [...eventos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
	})();

	// A diferencia de eventoRelevante (que puede caer en una cita ya pasada como
	// fallback para el botón "Ver cita agendada"), esto es estrictamente la
	// próxima visita pendiente/confirmada a futuro, para destacarla en el panel.
	const visitaPendiente = getVisitaPendiente(conversacion);
	const modeloAutoTitulo = conversacion.consulta?.vehiculo || p.vehiculo?.modelo || "";

	const auth = {
		rol: userRol,
		userId: user?.id,
		nombre: user?.name?.split(" ")[0] || "",
		apellido: user?.name?.split(" ").slice(1).join(" ") || "",
	};

	useEffect(() => {
		setResumenActualizadoEn(conversacion.resumenIAUpdatedAt || null);
		setNotaTexto("");
	}, [conversacion?.id]);

	useEffect(() => {
		if (conversacion?.consulta?.estado) {
			setEstadoConsulta(conversacion.consulta.estado);
		}
	}, [conversacion?.consultaId]);

	// Auto-actualizar resumen al abrir si hay mensajes nuevos del cliente
	useEffect(() => {
		if (!open) return;

		const ultimaActividadCliente = conversacion.mensajes?.filter((m) => m.autor === "contacto")?.slice(-1)?.[0]?.timestamp;

		if (!ultimaActividadCliente) return;

		const hayMensajesNuevos = !resumenActualizadoEn || new Date(ultimaActividadCliente) > new Date(resumenActualizadoEn);

		if (hayMensajesNuevos) {
			setActualizandoResumen(true);
			generarResumen(conversacion.id)
				.then((data) => {
					if (data?.resp) {
						onResumenActualizado?.(conversacion.id, data.resp);
						setResumenActualizadoEn(new Date().toISOString()); // ← marcar como actualizado
					}
				})
				.catch(() => {})
				.finally(() => setActualizandoResumen(false));
		}
	}, [open, conversacion?.id]);

	const handleActualizarResumen = async () => {
		if (actualizandoResumen) return;
		setActualizandoResumen(true);
		try {
			const data = await generarResumen(conversacion.id);
			if (data?.resp) {
				onResumenActualizado?.(conversacion.id, data.resp);
				setResumenActualizadoEn(new Date().toISOString());
			}
		} catch (_) {
		} finally {
			setActualizandoResumen(false);
		}
	};

	const handleGenerarConsulta = async () => {
		if (generandoConsulta) return;
		setGenerandoConsulta(true);
		try {
			const data = await generarConsulta(conversacion.id, { rol: userRol, userId });
			if (data?.resp) {
				onConsultaGenerada?.(conversacion.id, data.resp);
				setSnackbar({ open: true, ok: true, msg: "Consulta generada correctamente" });
			}
		} catch (err) {
			const msg = err?.error || "No se pudo generar la consulta.";
			setSnackbar({ open: true, ok: false, msg });
		} finally {
			setGenerandoConsulta(false);
		}
	};

	const handleAgregarNota = async () => {
		const texto = notaTexto.trim();
		if (!texto || enviandoNota) return;
		setEnviandoNota(true);
		try {
			const data = await createConversacionNota(conversacion.id, { tipo: "otro", texto });
			if (data?.resp) {
				onNotaActualizada?.(conversacion.id, [...notas, data.resp]);
				setNotaTexto("");
			}
		} catch (err) {
			setSnackbar({ open: true, ok: false, msg: err?.error || "No se pudo agregar la nota." });
		} finally {
			setEnviandoNota(false);
		}
	};

	const handleEliminarNota = async (notaId) => {
		try {
			await deleteConversacionNota(conversacion.id, notaId);
			onNotaActualizada?.(conversacion.id, notas.filter((n) => n.id !== notaId));
		} catch (err) {
			setSnackbar({ open: true, ok: false, msg: err?.error || "No se pudo eliminar la nota." });
		}
	};

	const handleCambiarEstado = async (nuevoEstado) => {
		if (!conversacion?.consultaId || actualizandoConsulta) return;
		setActualizandoConsulta(true);
		try {
			const data = await updateConsulta(conversacion.consultaId, { estado: nuevoEstado }, { rol: userRol, userId });
			if (data?.resp?.estado === nuevoEstado) {
				setEstadoConsulta(nuevoEstado);
				setSnackbar({ open: true, ok: true, msg: "Estado actualizado correctamente" });
			} else {
				setSnackbar({ open: true, ok: false, msg: "No se pudo actualizar el estado" });
			}
		} catch (_) {
			setSnackbar({ open: true, ok: false, msg: "Error al actualizar el estado" });
		} finally {
			setActualizandoConsulta(false);
		}
	};

	return (
		<>
			<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "contacto-drawer-paper" }}>
				<Box className="contacto-drawer-root">
					{/* Header */}
					<Box className="contacto-drawer-header">
						<Box className="contacto-drawer-avatar">
							<span>{iniciales}</span>
							<span className="contacto-drawer-avatar-canal" style={{ color: canalColor }}>
								<CanalIcon size={11} />
							</span>
						</Box>
						<Box className="contacto-drawer-header-info">
							<Typography className="contacto-drawer-nombre">{nombreVisible}</Typography>
							<Typography className="contacto-drawer-telefono">{conversacion.telefono}</Typography>
						</Box>
						<IconButton onClick={onClose} className="contacto-drawer-close">
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>

					{visitaPendiente && (
						<Box
							className="contacto-drawer-visita-banner"
							onClick={() => {
								onClose();
								navigate(`/crm/calendario?id=${visitaPendiente.id}`);
							}}
						>
							<CalendarIcon size={14} />
							<span>
								Visita pendiente: {formatFechaCorta(visitaPendiente.fecha)}
								{visitaPendiente.horaInicio ? ` · ${visitaPendiente.horaInicio}` : ""}
							</span>
						</Box>
					)}

					<Divider className="contacto-drawer-divider" />

					{/* Resumen IA */}
					<Box className="contacto-drawer-section">
						<Box className="resumen-ia__label-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<Typography className="contacto-drawer-section-label" style={{ marginBottom: 0 }}>
								Resumen IA
							</Typography>
							<button
								onClick={handleActualizarResumen}
								disabled={actualizandoResumen}
								style={{
									background: "none",
									border: "1px solid #2a2a2a",
									borderRadius: 6,
									color: actualizandoResumen ? "#444" : "#888",
									fontSize: 11,
									padding: "3px 8px",
									cursor: actualizandoResumen ? "not-allowed" : "pointer",
								}}
							>
								{actualizandoResumen ? "Actualizando..." : "Actualizar"}
							</button>
						</Box>
						<Box className="resumen-ia__card">
							<ResumenIA texto={conversacion.resumenIA} actualizando={actualizandoResumen} />
						</Box>
					</Box>

					<Divider className="contacto-drawer-divider" />

					{/* Canal y estado */}
					<Box className="contacto-drawer-section">
						<Box className="contacto-drawer-datos">
							<Box className="contacto-drawer-dato">
								<span className="contacto-drawer-dato-label">Canal</span>
								<span className="contacto-drawer-dato-valor" style={{ color: canalColor, display: "flex", alignItems: "center", gap: 5 }}>
									<CanalIcon size={12} />
									{conversacion.canal}
								</span>
							</Box>
							<Box className="contacto-drawer-dato">
								<span className="contacto-drawer-dato-label">Estado</span>
								<span className="contacto-drawer-dato-valor" style={{ color: estadoConfig.color }}>
									{estadoConfig.label}
								</span>
							</Box>
							{conversacion.origen && (
								<Box className="contacto-drawer-dato">
									<span className="contacto-drawer-dato-label">Origen</span>
									<span className="contacto-drawer-dato-valor">{conversacion.origen}</span>
								</Box>
							)}
							{(conversacion.estado === "asesor" || conversacion.estado === "cerrada") && (
								<Box className="contacto-drawer-dato">
									<span className="contacto-drawer-dato-label">Atendido por</span>
									<span className="contacto-drawer-dato-valor">
										{conversacion.asesorNombre} {conversacion.asesorApellido}
									</span>
								</Box>
							)}
							{p.email && (
								<Box className="contacto-drawer-dato">
									<span className="contacto-drawer-dato-label">Email</span>
									<span className="contacto-drawer-dato-valor">{p.email}</span>
								</Box>
							)}
						</Box>
					</Box>

					{/* Consulta existente */}
					{conversacion.consultaId && (
						<>
							<Divider className="contacto-drawer-divider" />
							<Box className="contacto-drawer-section">
								<Typography className="contacto-drawer-section-label" style={{ marginBottom: 8 }}>
									Consulta
								</Typography>
								<Box style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
									{ESTADOS_CONSULTA.map((e) => (
										<button
											key={e.value}
											onClick={() => handleCambiarEstado(e.value)}
											disabled={actualizandoConsulta}
											style={{
												padding: "4px 10px",
												borderRadius: 20,
												border: `1px solid ${estadoConsulta === e.value ? e.color : "rgba(255,255,255,0.1)"}`,
												background: estadoConsulta === e.value ? `${e.color}22` : "transparent",
												color: estadoConsulta === e.value ? e.color : "rgba(255, 255, 255, 0.69)",
												fontSize: 14,
												fontWeight: 500,
												cursor: actualizandoConsulta ? "not-allowed" : "pointer",
												transition: "all 0.15s",
											}}
										>
											{e.label}
										</button>
									))}
								</Box>
								<Box style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
									<button
										onClick={() => {
											onClose();
											navigate(`/crm/consultas?id=${conversacion.consultaId}`);
										}}
										style={btnBlue}
									>
										Ver consulta completa
									</button>
									{eventoRelevante && (
										<button
											onClick={() => {
												onClose();
												navigate(`/crm/calendario?id=${eventoRelevante.id}`);
											}}
											style={btnBlue}
										>
											Ver cita agendada
										</button>
									)}
								</Box>
							</Box>
						</>
					)}

					{/* Notas — se comparten con el historial de la consulta/evento vinculado */}
					<Divider className="contacto-drawer-divider" />
					<Box className="contacto-drawer-section">
						<Typography className="contacto-drawer-section-label" style={{ marginBottom: 8 }}>
							Notas
						</Typography>
						{notas.length > 0 ? (
							<Box className="contacto-drawer-notas-lista">
								{notas.map((n) => (
									<Box key={n.id} className="contacto-drawer-nota">
										<Box className="contacto-drawer-nota-header">
											<span className="contacto-drawer-nota-fecha">
												{new Date(n.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
											</span>
											{n.tipo !== "sistema" && (
												<button
													className="contacto-drawer-nota-eliminar"
													onClick={() => handleEliminarNota(n.id)}
													title="Eliminar nota"
												>
													<svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
														<path d="M6.5 1h3a.5.5 0 01.5.5v1H6v-1a.5.5 0 01.5-.5zM11 2.5v-1A1.5 1.5 0 009.5 0h-3A1.5 1.5 0 005 1.5v1H1.5a.5.5 0 000 1h.538l.853 10.66A2 2 0 004.885 16h6.23a2 2 0 001.994-1.84l.853-10.66H14.5a.5.5 0 000-1H11zm1.958 1l-.846 10.58a1 1 0 01-.997.92h-6.23a1 1 0 01-.997-.92L3.042 3.5h9.916z" />
													</svg>
												</button>
											)}
										</Box>
										<Typography className="contacto-drawer-nota-texto">{n.texto}</Typography>
									</Box>
								))}
							</Box>
						) : (
							<Typography className="contacto-drawer-sin-perfil">Sin notas todavía.</Typography>
						)}
						<Box className="contacto-drawer-nota-add">
							<textarea
								className="contacto-drawer-nota-input"
								value={notaTexto}
								onChange={(e) => setNotaTexto(e.target.value)}
								placeholder="Agregar una nota sobre este contacto…"
								rows={2}
							/>
							<button
								onClick={handleAgregarNota}
								disabled={enviandoNota || !notaTexto.trim()}
								style={{ ...btnBlue, opacity: enviandoNota || !notaTexto.trim() ? 0.5 : 1 }}
							>
								{enviandoNota ? "Guardando…" : "Agregar nota"}
							</button>
						</Box>
					</Box>

					{esAsesor && (
						<>
							<Divider className="contacto-drawer-divider" />
							<Box className="contacto-drawer-section" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
								{!conversacion.consultaId && (
									<button
										onClick={handleGenerarConsulta}
										disabled={generandoConsulta}
										style={{
											width: "100%",
											padding: "8px 0",
											background: generandoConsulta ? "#1a1a1a" : "#1a0202",
											border: "1px solid #3a0808",
											borderRadius: 8,
											color: generandoConsulta ? "#555" : "#cc0000",
											fontSize: 13,
											fontWeight: 600,
											cursor: generandoConsulta ? "not-allowed" : "pointer",
											fontFamily: "Barlow, sans-serif",
										}}
									>
										{generandoConsulta ? "Generando consulta..." : "Generar consulta"}
									</button>
								)}
								<button
									onClick={() => {
										onClose();
										setDrawerVisitaOpen(true);
									}}
									style={btnBlue}
								>
									Agendar visita
								</button>
							</Box>
						</>
					)}

					{p.vehiculo && (
						<>
							<Divider className="contacto-drawer-divider" />
							<Box className="contacto-drawer-section">
								<Box className="contacto-drawer-datos">
									{p.vehiculo.modelo && (
										<Box className="contacto-drawer-dato full">
											<span className="contacto-drawer-dato-label">Vehículo de interés</span>
											<span className="contacto-drawer-dato-valor">{p.vehiculo.modelo}</span>
										</Box>
									)}
									{p.vehiculo.version && (
										<Box className="contacto-drawer-dato">
											<span className="contacto-drawer-dato-label">Versión</span>
											<span className="contacto-drawer-dato-valor">{p.vehiculo.version}</span>
										</Box>
									)}
									{p.vehiculo.color && (
										<Box className="contacto-drawer-dato">
											<span className="contacto-drawer-dato-label">Color</span>
											<span className="contacto-drawer-dato-valor">{p.vehiculo.color}</span>
										</Box>
									)}
									{p.vehiculo.financiacion && (
										<Box className="contacto-drawer-dato full">
											<span className="contacto-drawer-dato-label">Financiación</span>
											<span className="contacto-drawer-dato-valor">{p.vehiculo.financiacion}</span>
										</Box>
									)}
								</Box>
							</Box>
						</>
					)}
					{p.visita && (
						<>
							<Divider className="contacto-drawer-divider" />
							<Divider className="contacto-drawer-divider" />
							<Box className="contacto-drawer-section">
								<Typography className="contacto-drawer-section-label">Visita agendada</Typography>
								<Box className="contacto-drawer-visita">
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.8"
										strokeLinecap="round"
										strokeLinejoin="round"
										width={14}
										height={14}
									>
										<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
										<line x1="16" y1="2" x2="16" y2="6" />
										<line x1="8" y1="2" x2="8" y2="6" />
										<line x1="3" y1="10" x2="21" y2="10" />
									</svg>
									<span>{p.visita}</span>
								</Box>
							</Box>
						</>
					)}
				</Box>
			</Drawer>
			<NuevaCitaDrawer
				open={drawerVisitaOpen}
				onClose={() => setDrawerVisitaOpen(false)}
				onGuardar={async (datosForm) => {
					await createEvento(datosForm, auth);
					setDrawerVisitaOpen(false);
				}}
				userRol={userRol}
				currentUser={user}
				eventoAEditar={{
					tipo: "visita",
					fecha: new Date().toISOString().split("T")[0],
					clienteNombre: conversacion.contactoNombre || "",
					clienteApellido: conversacion.contactoApellido || "",
					clienteTelefono: conversacion.telefono || "",
					vehiculo: conversacion.consulta?.vehiculo || p.vehiculo?.modelo || "",
					titulo: `Visita${modeloAutoTitulo ? ` - ${modeloAutoTitulo}` : ""} - ${conversacion.contactoNombre || ""}`.trim(),
				}}
				fechaPreseleccionada={null}
			/>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.ok ? "success" : "error"} variant="filled">
					{snackbar.msg}
				</Alert>
			</Snackbar>
		</>
	);
}
