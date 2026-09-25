// components/CRM/Calendario/NuevaCitaDrawer/NuevaCitaDrawer.jsx
import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import "./NuevaCitaDrawer.css";
import { getUsers } from "../../../../services/usuarios.service";
import { buscarContactoPorTelefono } from "../../../../services/calendario.service";
import { ROLES } from "../../../../constants/roles";

const TIPOS = ["visita", "llamada", "reunion", "entrega", "mecanico", "inspeccion", "otro"];

const TIPO_LABELS_FORM = {
	visita: "Visita",
	llamada: "Llamada",
	reunion: "Reunión",
	entrega: "Entrega",
	mecanico: "Mecánico",
	inspeccion: "Inspección",
	otro: "Otro…",
};

const INITIAL_FORM = {
	titulo: "",
	tipo: "visita",
	tipoPersonalizado: "",
	fecha: "",
	horaInicio: "",
	clienteNombre: "",
	clienteApellido: "",
	clienteTelefono: "",
	vehiculo: "",
	usuarioId: "",
	invitadosIds: [],
	notas: "",
};

function eventoToForm(evento) {
	return {
		titulo: evento.titulo ?? "",
		tipo: evento.tipo ?? "visita",
		tipoPersonalizado: evento.tipoPersonalizado ?? "",
		fecha: evento.fecha ?? "",
		horaInicio: evento.horaInicio ?? "",
		clienteNombre: evento.clienteNombre ?? "",
		clienteApellido: evento.clienteApellido ?? "",
		clienteTelefono: evento.clienteTelefono ?? "",
		vehiculo: evento.vehiculo ?? "",
		usuarioId: evento.usuarioId ? String(evento.usuarioId) : "",
		invitadosIds: (evento.invitadosIds ?? []).map(String),
		notas: evento.notas ?? "",
	};
}

export default function NuevaCitaDrawer({
	open,
	onClose,
	onGuardar,
	userRol,
	currentUser,
	eventoAEditar, // null = nuevo, objeto = edición
	fechaPreseleccionada, // "YYYY-MM-DD" | null — viene del click en celda
}) {
	const [form, setForm] = useState(INITIAL_FORM);
	const [errors, setErrors] = useState({});
	const [usuarios, setUsuarios] = useState([]);
	const [matchContacto, setMatchContacto] = useState(null); // { consulta, conversacion } | null
	const [asociarConsulta, setAsociarConsulta] = useState(null); // null = sin decidir, true/false = decidido
	const lastAutoTituloRef = React.useRef("");

	const esAdmin = userRol === ROLES.ADMIN;
	const puedeAsignar = esAdmin || userRol === ROLES.SUPERVISOR;
	const modoEdicion = !!eventoAEditar;

	useEffect(() => {
		if (!open || !puedeAsignar) return;
		getUsers()
			.then((data) => setUsuarios(data.users ?? []))
			.catch(() => setUsuarios([]));
	}, [open, puedeAsignar]);

	useEffect(() => {
		if (!open) return;
		if (eventoAEditar) {
			setForm(eventoToForm(eventoAEditar));
		} else {
			// Forma base con usuario actual si corresponde
			const base = !puedeAsignar && currentUser ? { ...INITIAL_FORM, usuarioId: String(currentUser.id) } : INITIAL_FORM;
			// Precargar fecha si viene del click en celda
			setForm({ ...base, fecha: fechaPreseleccionada ?? "" });
		}
		setErrors({});
		setMatchContacto(null);
		setAsociarConsulta(null);
		lastAutoTituloRef.current = "";
	}, [open, eventoAEditar, fechaPreseleccionada]);

	// Sugerencia de título para visitas nuevas: "Visita — {vehículo} — {nombre}".
	// Solo pisa el título mientras coincida con la última sugerencia generada,
	// así no se pierde lo que la persona haya escrito a mano.
	useEffect(() => {
		if (!open || modoEdicion || form.tipo !== "visita") return;
		const nombreCompleto = `${form.clienteNombre} ${form.clienteApellido}`.trim();
		const sugerido = `Visita${form.vehiculo ? ` — ${form.vehiculo}` : ""}${nombreCompleto ? ` — ${nombreCompleto}` : ""}`;
		if (form.titulo === "" || form.titulo === lastAutoTituloRef.current) {
			lastAutoTituloRef.current = sugerido;
			setForm((prev) => (prev.titulo === sugerido ? prev : { ...prev, titulo: sugerido }));
		}
	}, [form.vehiculo, form.clienteNombre, form.clienteApellido, form.tipo, open, modoEdicion]);

	// Al cargar un teléfono en un evento nuevo, avisamos si ya hay una consulta
	// activa (o al menos una conversación) para ese número — así la persona
	// decide si asociarla en vez de que quede un registro paralelo sin
	// relación con el historial que ya existe de ese cliente.
	useEffect(() => {
		if (!open || modoEdicion) return;
		const digitos = form.clienteTelefono.replace(/\D/g, "");
		if (digitos.length < 8) {
			setMatchContacto(null);
			setAsociarConsulta(null);
			return;
		}
		setAsociarConsulta(null);
		const timeoutId = setTimeout(() => {
			buscarContactoPorTelefono(form.clienteTelefono)
				.then((data) => {
					const resp = data?.resp;
					setMatchContacto(resp?.consulta || resp?.conversacion ? resp : null);
				})
				.catch(() => setMatchContacto(null));
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [form.clienteTelefono, open, modoEdicion]);

	function handleChange(e) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	}

	function toggleInvitado(id) {
		setForm((prev) => {
			const ya = prev.invitadosIds.includes(id);
			return { ...prev, invitadosIds: ya ? prev.invitadosIds.filter((i) => i !== id) : [...prev.invitadosIds, id] };
		});
	}

	function validate() {
		const newErrors = {};
		if (!form.titulo.trim()) newErrors.titulo = "Requerido";
		if (!form.fecha) newErrors.fecha = "Requerido";
		if (!form.horaInicio) {
			newErrors.horaInicio = "Requerido";
		} else if (!/^\d{2}:\d{2}$/.test(form.horaInicio)) {
			newErrors.horaInicio = "Formato inválido (HH:MM)";
		}
		if (form.tipo === "otro" && !form.tipoPersonalizado.trim()) newErrors.tipoPersonalizado = "Requerido";
		return newErrors;
	}

	function handleGuardar() {
		const newErrors = validate();
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const datosForm = {
			titulo: form.titulo,
			tipo: form.tipo,
			tipoPersonalizado: form.tipo === "otro" ? form.tipoPersonalizado : undefined,
			fecha: form.fecha,
			horaInicio: form.horaInicio,
			clienteNombre: form.clienteNombre,
			clienteApellido: form.clienteApellido,
			clienteTelefono: form.clienteTelefono,
			vehiculo: form.vehiculo,
			usuarioId: form.usuarioId ? Number(form.usuarioId) : undefined,
			invitadosIds: form.invitadosIds.map(Number),
			notas: form.notas,
			consultaId: asociarConsulta && matchContacto?.consulta ? matchContacto.consulta.id : undefined,
			_userId: currentUser?.id,
			_rol: userRol,
		};

		onGuardar(datosForm);
		setForm(INITIAL_FORM);
		setErrors({});
		setMatchContacto(null);
		setAsociarConsulta(null);
		onClose();
	}

	function handleClose() {
		setForm(INITIAL_FORM);
		setErrors({});
		setMatchContacto(null);
		setAsociarConsulta(null);
		onClose();
	}

	const usuariosParaInvitados = usuarios.filter((u) => String(u.id) !== String(form.usuarioId));

	return (
		<Drawer anchor="right" open={open} onClose={handleClose} PaperProps={{ className: "ncd__paper" }}>
			<div className="ncd">
				{/* Header */}
				<div className="ncd__header">
					<p className="ncd__title">{modoEdicion ? "Editar evento" : "Nuevo evento"}</p>
					<button className="ncd__close" onClick={handleClose} aria-label="Cerrar">
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				<div className="ncd__divider" />

				<div className="ncd__body">
					<Field label="Título" required error={errors.titulo}>
						<input
							className={`ncd__input${errors.titulo ? " ncd__input--error" : ""}`}
							name="titulo"
							value={form.titulo}
							onChange={handleChange}
							placeholder="ej: Visita — Golf TSI"
						/>
					</Field>

					<Field label="Tipo de evento">
						<div className="ncd__pills ncd__pills--wrap">
							{TIPOS.map((t) => (
								<button
									key={t}
									type="button"
									className={`ncd__pill${form.tipo === t ? " ncd__pill--active" : ""}`}
									onClick={() =>
										setForm((p) => ({
											...p,
											tipo: t,
											tipoPersonalizado: "",
											invitadosIds: t === "visita" ? [] : p.invitadosIds,
										}))
									}
								>
									{TIPO_LABELS_FORM[t]}
								</button>
							))}
						</div>
					</Field>

					{form.tipo === "otro" && (
						<Field label="¿Qué tipo de evento?" required error={errors.tipoPersonalizado}>
							<input
								className={`ncd__input${errors.tipoPersonalizado ? " ncd__input--error" : ""}`}
								name="tipoPersonalizado"
								value={form.tipoPersonalizado}
								onChange={handleChange}
								placeholder="ej: Peritaje, Fotografía…"
								autoFocus
							/>
						</Field>
					)}

					<Field label="Fecha" required error={errors.fecha}>
						<input
							className={`ncd__input${errors.fecha ? " ncd__input--error" : ""}`}
							type="date"
							name="fecha"
							value={form.fecha}
							onChange={handleChange}
						/>
					</Field>

					<Field label="Hora inicio" required error={errors.horaInicio}>
						<input
							className={`ncd__input${errors.horaInicio ? " ncd__input--error" : ""}`}
							type="text"
							name="horaInicio"
							value={form.horaInicio}
							onChange={(e) => {
								let val = e.target.value.replace(/[^\d:]/g, "");
								if (val.length === 2 && !val.includes(":") && e.nativeEvent.inputType !== "deleteContentBackward") val = val + ":";
								const parts = val.split(":");
								if (parts[0] && parseInt(parts[0]) > 23) return;
								if (parts[1] && parseInt(parts[1]) > 59) return;
								if (val.length > 5) return;
								setForm((prev) => ({ ...prev, horaInicio: val }));
								if (errors.horaInicio) setErrors((prev) => ({ ...prev, horaInicio: "" }));
							}}
							onBlur={() => {
								const parts = form.horaInicio.split(":");
								if (parts.length === 2 && parts[1].length === 1) setForm((prev) => ({ ...prev, horaInicio: `${parts[0]}:0${parts[1]}` }));
							}}
							placeholder="HH:MM"
							maxLength={5}
						/>
					</Field>

					<div className="ncd__divider" />
					<div className="ncd__section-label">Datos del cliente</div>

					<div className="ncd__row">
						<Field label="Nombre">
							<input className="ncd__input" name="clienteNombre" value={form.clienteNombre} onChange={handleChange} placeholder="Gustavo" />
						</Field>
						<Field label="Apellido">
							<input
								className="ncd__input"
								name="clienteApellido"
								value={form.clienteApellido}
								onChange={handleChange}
								placeholder="Ferreyra"
							/>
						</Field>
					</div>

					<Field label="Teléfono">
						<input
							className="ncd__input"
							name="clienteTelefono"
							value={form.clienteTelefono}
							onChange={handleChange}
							placeholder="+54 9 351 000-0000"
						/>
					</Field>

					{matchContacto?.consulta && asociarConsulta === null && (
						<div className="ncd__match-banner">
							<p className="ncd__match-banner-text">
								Este número ya tiene una consulta activa
								{matchContacto.consulta.vehiculo ? ` — ${matchContacto.consulta.vehiculo}` : ""}
								{matchContacto.consulta.nombre ? ` (${matchContacto.consulta.nombre} ${matchContacto.consulta.apellido || ""})` : ""}.
								¿Asociar esta visita a esa consulta?
							</p>
							<div className="ncd__match-banner-actions">
								<button type="button" className="ncd__pill" onClick={() => setAsociarConsulta(false)}>
									No, es otro motivo
								</button>
								<button type="button" className="ncd__pill ncd__pill--active" onClick={() => setAsociarConsulta(true)}>
									Sí, asociar
								</button>
							</div>
						</div>
					)}
					{asociarConsulta === true && matchContacto?.consulta && (
						<p className="ncd__match-banner-confirmado">Se va a asociar a la consulta #{matchContacto.consulta.id}.</p>
					)}

					<div className="ncd__divider" />

					<Field label="Vehículo">
						<input
							className="ncd__input"
							name="vehiculo"
							value={form.vehiculo}
							onChange={handleChange}
							placeholder="Volkswagen Tiguan Allspace"
						/>
					</Field>

					{puedeAsignar && (
						<>
							<Field label="Responsable">
								<select className="ncd__input ncd__select" name="usuarioId" value={form.usuarioId} onChange={handleChange}>
									<option value="">Seleccionar…</option>
									{usuarios.map((u) => (
										<option key={u.id} value={String(u.id)}>
											{u.name}
										</option>
									))}
								</select>
							</Field>

							{form.tipo !== "visita" && usuariosParaInvitados.length > 0 && (
								<Field label="Otros invitados">
									<div className="ncd__invitados">
										{usuariosParaInvitados.map((u) => {
											const checked = form.invitadosIds.includes(String(u.id));
											return (
												<button
													key={u.id}
													type="button"
													className={`ncd__invitado-pill${checked ? " ncd__invitado-pill--active" : ""}`}
													onClick={() => toggleInvitado(String(u.id))}
												>
													<span className="ncd__invitado-avatar">{u.name.charAt(0).toUpperCase()}</span>
													<span className="ncd__invitado-name">{u.name}</span>
													{checked && (
														<svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ncd__invitado-check">
															<path
																d="M1.5 5l2.5 2.5 4.5-4.5"
																stroke="currentColor"
																strokeWidth="1.6"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													)}
												</button>
											);
										})}
									</div>
								</Field>
							)}

							{form.tipo === "visita" && <p className="ncd__invitados-nota">Se invita automáticamente a todo el equipo.</p>}
						</>
					)}

					<Field label="Notas">
						<textarea
							className="ncd__input ncd__textarea"
							name="notas"
							value={form.notas}
							onChange={handleChange}
							placeholder="Observaciones, preparación, lo que hay que llevar…"
							rows={3}
						/>
					</Field>
				</div>

				<div className="ncd__footer">
					<button className="ncd__cancel-btn" onClick={handleClose}>
						Cancelar
					</button>
					<button className="ncd__guardar-btn" onClick={handleGuardar}>
						{modoEdicion ? "Guardar cambios" : "Guardar evento"}
					</button>
				</div>
			</div>
		</Drawer>
	);
}

function Field({ label, required, error, children }) {
	return (
		<div className="ncd__field">
			<p className="ncd__field-label">
				{label}
				{required && <span className="ncd__field-required">*</span>}
			</p>
			{children}
			{error && <p className="ncd__field-error">{error}</p>}
		</div>
	);
}
