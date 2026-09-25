// components/CRM/Consultas/NuevaConsultaDrawer/NuevaConsultaDrawer.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIAS, FORMAS_PAGO, FORMAS_PAGO_LABEL, ORIGENES_FORM, origenKey } from "../../../../constants/crm";
import { ORIGEN_ICON } from "../../../../constants/crmIcons";
import { getUsers } from "../../../../services/usuarios.service";
import { getAutos } from "../../../../services/autos.service";
import "./NuevaConsultaDrawer.css";

// ─── Constante para usuario restringido ───────────────────────────────────────
const isRestrictedUser = (user) => user?.email === "clodersona@gmail.com" || user?.name === "Cloder Sona";

// Canales que el usuario restringido NO puede ver
const ORIGENES_BLOQUEADOS = ["WhatsApp", "Instagram", "Facebook", "Web"];

const EMPTY_FORM = {
	nombre: "",
	apellido: "",
	telefono: "",
	vehiculo: "",
	vehiculoDesdeStock: false,
	categoria: "",
	presupuesto: "",
	moneda: "ARS",
	formaPago: ["a_definir"],
	origen: "Presencial",
	origenOtroTexto: "",
	notas: "",
	asesorId: "",
};

function NcField({ label, required, error, children }) {
	return (
		<div className={`nc-field ${error ? "nc-field--error" : ""}`}>
			{label && (
				<label className="nc-label">
					{label}
					{required && <span className="nc-req">*</span>}
				</label>
			)}
			{children}
			<AnimatePresence>
				{error && (
					<motion.span className="nc-error" initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
						{error}
					</motion.span>
				)}
			</AnimatePresence>
		</div>
	);
}

export default function NuevaConsultaDrawer({ open, onClose, onCreated, esAdmin, esSupervisor, currentUser }) {
	const [form, setForm] = useState(EMPTY_FORM);
	const [errors, setErrors] = useState({});
	const presupuestoRef = useRef(null);
	const [usuarios, setUsuarios] = useState([]);
	const [autos, setAutos] = useState([]);
	const [loadingAutos, setLoadingAutos] = useState(false);
	const [autoSearch, setAutoSearch] = useState("");
	const [autoListaAbierta, setAutoListaAbierta] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const esRestringido = isRestrictedUser(currentUser);

	// Carga usuarios (admin/supervisor) — se cachea durante la vida del drawer,
	// pero se ignora la respuesta si el efecto ya no está vigente (evita que una
	// request vieja pise el estado si se abre/cierra rápido antes de resolver).
	useEffect(() => {
		if (!open || !(esAdmin || esSupervisor) || usuarios.length > 0) return;
		let cancelado = false;
		getUsers()
			.then((data) => {
				if (!cancelado) setUsuarios(data.users ?? data);
			})
			.catch(console.error);
		return () => {
			cancelado = true;
		};
	}, [open, esAdmin, esSupervisor]);

	// Carga autos cuando se activa el modo "desde stock" (mismo cuidado con requests obsoletas)
	useEffect(() => {
		if (!form.vehiculoDesdeStock || autos.length > 0) return;
		let cancelado = false;
		setLoadingAutos(true);
		getAutos({ orderBy: "marca", orderDir: "ASC" })
			.then((data) => {
				if (cancelado) return;
				const lista = Array.isArray(data.resp) ? data.resp : (data.autos ?? data.rows ?? []);

				const capitalizados = lista.map((auto) => {
					const marca = auto.marca ? auto.marca.charAt(0).toUpperCase() + auto.marca.slice(1) : "";
					const modelo = auto.modelo || "";
					return {
						...auto,
						titulo: `${marca} ${modelo}`.trim(),
					};
				});
				setAutos(capitalizados);
			})
			.catch(console.error)
			.finally(() => {
				if (!cancelado) setLoadingAutos(false);
			});
		return () => {
			cancelado = true;
		};
	}, [form.vehiculoDesdeStock]);

	function handlePresupuestoChange(e) {
		const input = e.target;
		const cursorPos = input.selectionStart;
		const oldValue = input.value;
		const newRaw = e.target.value.replace(/\./g, "");
		const formatted = newRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

		const puntosAntes = (oldValue.slice(0, cursorPos).match(/\./g) || []).length;
		const puntosDespues = (formatted.slice(0, cursorPos).match(/\./g) || []).length;
		const diff = puntosDespues - puntosAntes;

		set("presupuesto", formatted);

		requestAnimationFrame(() => {
			if (presupuestoRef.current) {
				const newPos = cursorPos + diff;
				presupuestoRef.current.setSelectionRange(newPos, newPos);
			}
		});
	}

	function set(key, val) {
		setForm((f) => ({ ...f, [key]: val }));
		if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
	}

	function handleVehiculoDesdeStockToggle(desdeStock) {
		set("vehiculoDesdeStock", desdeStock);
		set("vehiculo", "");
		setAutoSearch("");
		setAutoListaAbierta(true);
	}

	function handleSelectAuto(auto) {
		const anio = auto.anio ? ` ${auto.anio}` : "";
		set("vehiculo", `${auto.titulo}${anio}`.trim());
		setAutoListaAbierta(false);
	}

	function validate() {
		const errs = {};
		if (!form.telefono.trim()) errs.telefono = "Requerido";
		if (!form.vehiculo.trim()) errs.vehiculo = "Requerido";
		if (form.presupuesto && isNaN(Number(form.presupuesto.replace(/\./g, "")))) errs.presupuesto = "Número inválido";
		if (!esRestringido && form.origen === "Otro" && !form.origenOtroTexto.trim()) errs.origenOtroTexto = "Especificá el canal";
		return errs;
	}

	async function handleSubmit() {
		const errs = validate();
		if (Object.keys(errs).length > 0) {
			setErrors(errs);
			return;
		}
		setSubmitting(true);
		const payload = {
			nombre: form.nombre.trim(),
			apellido: form.apellido.trim(),
			telefono: form.telefono.trim(),
			vehiculo: form.vehiculo.trim(),
			categoria: form.categoria || null,
			presupuesto: form.presupuesto ? Number(form.presupuesto.replace(/\./g, "")) : 0,
			moneda: form.moneda,
			formaPago: form.formaPago,
			origen: form.origen,
			origenTexto: form.origen === "Otro" ? form.origenOtroTexto.trim() : null,
			notas: form.notas.trim() || null,
			cargadoPor: esAdmin ? "admin" : "usuario",
			...(!esAdmin && !esSupervisor
				? {
						asesorId: currentUser.id,
						asesorNombre: currentUser.name?.split(" ")[0] ?? null,
						asesorApellido: currentUser.name?.split(" ").slice(1).join(" ") ?? null,
					}
				: {
						asesorId: form.asesorId || null,
					}),
		};

		try {
			await onCreated(payload);
			handleClose();
		} catch (err) {
			const mensaje = err?.error || err?.message || "No se pudo crear la consulta. Reintentá.";
			setErrors((e) => ({ ...e, submit: mensaje }));
		} finally {
			setSubmitting(false);
		}
	}

	function handleClose() {
		onClose();
		setTimeout(() => {
			setForm(EMPTY_FORM);
			setErrors({});
			setAutoSearch("");
		}, 350);
	}

	// Filtra autos según búsqueda
	const autosFiltrados = autoSearch.trim() ? autos.filter((a) => a.titulo.toLowerCase().includes(autoSearch.toLowerCase())) : autos;

	// Origenes visibles según el tipo de usuario
	const origenesVisibles = esRestringido ? ORIGENES_FORM.filter((o) => !ORIGENES_BLOQUEADOS.includes(o)) : ORIGENES_FORM;

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						className="cq-overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleClose}
					/>
					<motion.aside
						className="cq-drawer cq-drawer--form"
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 28, stiffness: 300 }}
					>
						{/* Header */}
						<div className="cq-drawer__header">
							<div className="cq-drawer__header-left">
								<div className="cq-drawer__avatar cq-drawer__avatar--new">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
										<line x1="12" y1="5" x2="12" y2="19" />
										<line x1="5" y1="12" x2="19" y2="12" />
									</svg>
								</div>
								<div>
									<h2 className="cq-drawer__nombre">Nueva consulta</h2>
									<p className="cq-drawer__sub">Carga manual</p>
								</div>
							</div>
							<button className="cq-drawer__close" onClick={handleClose}>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<AnimatePresence mode="wait">
							<motion.div key="form" className="nc-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
								{/* ── Cliente ── */}
								<div className="nc-section">
									<h3 className="nc-section-title">Cliente</h3>

									{/* Nombre y apellido: siempre visibles para todos */}
									<div className="nc-row">
										<NcField label="Nombre" error={errors.nombre}>
											<input
												className={`nc-input ${errors.nombre ? "nc-input--error" : ""}`}
												value={form.nombre}
												onChange={(e) => set("nombre", e.target.value)}
												placeholder="Martín"
											/>
										</NcField>
										<NcField label="Apellido" error={errors.apellido}>
											<input
												className={`nc-input ${errors.apellido ? "nc-input--error" : ""}`}
												value={form.apellido}
												onChange={(e) => set("apellido", e.target.value)}
												placeholder="Rodríguez"
											/>
										</NcField>
									</div>
									<NcField label="Teléfono" required error={errors.telefono}>
										<input
											className={`nc-input ${errors.telefono ? "nc-input--error" : ""}`}
											value={form.telefono}
											onChange={(e) => set("telefono", e.target.value)}
											placeholder="+54 9 351 412-3890"
											type="tel"
										/>
									</NcField>
								</div>

								{/* ── Interés ── */}
								<div className="nc-section">
									<h3 className="nc-section-title">Interés</h3>

									{/* Toggle stock / sin stock */}
									<div className="nc-vehiculo-toggle">
										<button
											type="button"
											className={`nc-vehiculo-toggle__btn ${!form.vehiculoDesdeStock ? "nc-vehiculo-toggle__btn--active" : ""}`}
											onClick={() => handleVehiculoDesdeStockToggle(false)}
										>
											<svg
												width="13"
												height="13"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<line x1="12" y1="5" x2="12" y2="19" />
												<line x1="5" y1="12" x2="19" y2="12" />
											</svg>
											Sin stock
										</button>
										<button
											type="button"
											className={`nc-vehiculo-toggle__btn ${form.vehiculoDesdeStock ? "nc-vehiculo-toggle__btn--active" : ""}`}
											onClick={() => handleVehiculoDesdeStockToggle(true)}
										>
											<svg
												width="13"
												height="13"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<rect x="1" y="3" width="15" height="13" rx="2" />
												<path d="M16 8h4l3 5v3h-7V8z" />
												<circle cx="5.5" cy="18.5" r="2.5" />
												<circle cx="18.5" cy="18.5" r="2.5" />
											</svg>
											Del catálogo
										</button>
									</div>

									<AnimatePresence mode="wait">
										{form.vehiculoDesdeStock ? (
											<motion.div
												key="stock"
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												style={{ overflow: "hidden" }}
											>
												<NcField label="Vehículo del catálogo" required error={errors.vehiculo}>
													{loadingAutos ? (
														<div className="nc-autos-loading">Cargando catálogo…</div>
													) : (
														<>
															{autoListaAbierta ? (
																<>
																	<input
																		className="nc-input"
																		value={autoSearch}
																		onChange={(e) => setAutoSearch(e.target.value)}
																		placeholder="Buscar por marca o modelo…"
																		autoFocus
																	/>
																	<div className="nc-autos-list">
																		{autosFiltrados.length === 0 ? (
																			<div className="nc-autos-empty">Sin resultados</div>
																		) : (
																			autosFiltrados.map((auto) => {
																				const seleccionado = form.vehiculo === `${auto.titulo}${auto.anio ? ` ${auto.anio}` : ""}`.trim();
																				return (
																					<button
																						key={auto.id}
																						type="button"
																						className={`nc-auto-item ${seleccionado ? "nc-auto-item--selected" : ""}`}
																						onClick={() => handleSelectAuto(auto)}
																					>
																						<span className="nc-auto-item__titulo">{auto.titulo}</span>
																						{auto.anio && <span className="nc-auto-item__anio">{auto.anio}</span>}
																					</button>
																				);
																			})
																		)}
																	</div>
																</>
															) : (
																<input
																	className="nc-input"
																	value={form.vehiculo}
																	onClick={() => {
																		setAutoListaAbierta(true);
																		setAutoSearch("");
																	}}
																	readOnly
																	style={{ cursor: "pointer" }}
																	placeholder="Seleccioná un vehículo…"
																/>
															)}
														</>
													)}
												</NcField>
											</motion.div>
										) : (
											<motion.div
												key="libre"
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												style={{ overflow: "hidden" }}
											>
												<NcField label="Nombre de vahículo" required error={errors.vehiculo}>
													<input
														className={`nc-input ${errors.vehiculo ? "nc-input--error" : ""}`}
														value={form.vehiculo}
														onChange={(e) => set("vehiculo", e.target.value)}
														placeholder="Audi A3 Sportback"
													/>
												</NcField>
											</motion.div>
										)}
									</AnimatePresence>

									<div className="nc-row">
										<NcField label="Categoría">
											<select className="nc-select" value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
												<option value="">Sin categoría</option>
												{CATEGORIAS.map((c) => (
													<option key={c.value} value={c.value}>
														{c.label}
													</option>
												))}
											</select>
										</NcField>
										<NcField label="Forma de pago">
											<div className="nc-checkboxes">
												{FORMAS_PAGO.map((f) => (
													<label key={f} className="nc-checkbox">
														<input
															type="checkbox"
															checked={(form.formaPago || []).includes(f)}
															onChange={(e) => {
																const actual = form.formaPago || [];
																const nuevo = e.target.checked
																	? [...actual.filter((x) => x !== "a_definir"), f]
																	: actual.filter((x) => x !== f);
																set("formaPago", nuevo.length ? nuevo : ["a_definir"]);
															}}
														/>
														{FORMAS_PAGO_LABEL[f]}
													</label>
												))}
											</div>
										</NcField>
									</div>
									<NcField label="Presupuesto" error={errors.presupuesto}>
										<div className="nc-input-prefix-wrap">
											<select className="nc-moneda-select" value={form.moneda} onChange={(e) => set("moneda", e.target.value)}>
												<option value="ARS">ARS</option>
												<option value="USD">USD</option>
											</select>
											<input
												ref={presupuestoRef}
												className={`nc-input nc-input--prefixed ${errors.presupuesto ? "nc-input--error" : ""}`}
												value={form.presupuesto}
												onChange={handlePresupuestoChange}
												placeholder="45.000"
												type="text"
												inputMode="numeric"
											/>
										</div>
									</NcField>
								</div>

								{/* ── Asignación (admin/supervisor) ── */}
								{(esAdmin || esSupervisor) && (
									<div className="nc-section">
										<h3 className="nc-section-title">Asignación</h3>
										<NcField label="Asesor asignado">
											<select className="nc-select" value={form.asesorId} onChange={(e) => set("asesorId", e.target.value)}>
												<option value="">Sin asignar</option>
												{usuarios.map((u) => (
													<option key={u.id} value={u.id}>
														{u.name}
													</option>
												))}
											</select>
										</NcField>
									</div>
								)}

								{/* ── Canal de contacto ── */}
								<div className="nc-section">
									<h3 className="nc-section-title">Canal de contacto</h3>
									<div className="nc-origen-grid">
										{origenesVisibles.map((o) => (
											<button
												key={o}
												type="button"
												className={`nc-origen-btn nc-origen-btn--${origenKey(o)} ${form.origen === o ? "nc-origen-btn--active" : ""}`}
												onClick={() => set("origen", o)}
											>
												<span className="nc-origen-btn__icon">{ORIGEN_ICON[o]}</span>
												{o}
											</button>
										))}
									</div>
									<AnimatePresence>
										{form.origen === "Otro" && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												style={{ overflow: "hidden", marginTop: 12 }}
											>
												<NcField label="Especificá el canal" error={errors.origenOtroTexto}>
													<input
														className={`nc-input ${errors.origenOtroTexto ? "nc-input--error" : ""}`}
														value={form.origenOtroTexto}
														onChange={(e) => set("origenOtroTexto", e.target.value)}
														placeholder="Ej: Feria de autos, Radio..."
													/>
												</NcField>
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								{/* ── Notas ── */}
								<div className="nc-section">
									<NcField label="Notas iniciales">
										<textarea
											className="nc-textarea"
											value={form.notas}
											onChange={(e) => set("notas", e.target.value)}
											placeholder="Qué comentó el cliente, qué busca…"
											rows={4}
										/>
									</NcField>
								</div>

								{/* ── Footer ── */}
								<div className="nc-footer">
									<AnimatePresence>
										{errors.submit && (
											<motion.div
												className="nc-error nc-error--submit"
												initial={{ opacity: 0, y: -6 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0 }}
											>
												{errors.submit}
											</motion.div>
										)}
									</AnimatePresence>
									<div className="nc-footer__actions">
										<button type="button" className="nc-btn-cancel" onClick={handleClose} disabled={submitting}>
											Cancelar
										</button>
										<button type="button" className="nc-btn-primary" onClick={handleSubmit} disabled={submitting}>
											<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
												<polyline points="20 6 9 17 4 12" />
											</svg>
											{submitting ? "Creando…" : "Crear consulta"}
										</button>
									</div>
								</div>
							</motion.div>
						</AnimatePresence>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}
