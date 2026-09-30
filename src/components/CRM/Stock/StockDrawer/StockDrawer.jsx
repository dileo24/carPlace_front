import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import "./StockDrawer.css";
import { ESTADOS_STOCK, titleCase, TAREAS_ALISTAJE_TEMPLATES, generateTareaId } from "../../../../constants/crmStock";
import { formatearLista } from "../../../../data/filters";
import { updateAuto, syncTareasAlistaje } from "../../../../services/autos.service";
import { getPublicaciones } from "../../../../services/publicaciones.service";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { normalizarPatente, validarPatente } from "../../../../utils/patente";

export default function StockDrawer({ auto, open, onClose, onUpdate, esAdmin, esSupervisor }) {
	const precioInfoAnteriorRef = useRef(null);
	const precioInfoActualRef = useRef(null);
	const precioClienteRef = useRef(null);
	const precioRef = useRef(null);
	const precioCompraRef = useRef(null);
	const [estados, setEstados] = useState([]);
	const [tipo, setTipo] = useState(null);
	const [fechaCompra, setFechaCompra] = useState("");
	const [precioCompra, setPrecioCompra] = useState("");
	const [propietario, setPropietario] = useState("agencia");
	const [visible, setVisible] = useState(true);
	const [tareas, setTareas] = useState([]);
	const en_alistaje = tareas.length > 0 && tareas.some((t) => !t.hecha);
	const [nuevaTarea, setNuevaTarea] = useState("");
	const [notas, setNotas] = useState("");
	const [fechaRecepcion, setFechaRecepcion] = useState("");
	const [precioInfoMesAnterior, setPrecioInfoMesAnterior] = useState("");
	const [precioInfoMesActual, setPrecioInfoMesActual] = useState("");
	const [precio, setPrecio] = useState("");
	const [moneda, setMoneda] = useState("AR$");
	const [guardando, setGuardando] = useState(false);
	const [confirmandoVenta, setConfirmandoVenta] = useState(false);
	const [precioCliente, setPrecioCliente] = useState("");
	const [patente, setPatente] = useState("");
	const [patenteError, setPatenteError] = useState("");

	const [oferta, setOferta] = useState(false);
	const [precioOferta, setPrecioOferta] = useState("");
	const precioOfertaRef = useRef(null);
	const [publicaciones, setPublicaciones] = useState([]);

	const navigate = useNavigate();

	useEffect(() => {
		if (!auto?.id) return;
		getPublicaciones(auto.id)
			.then((data) => setPublicaciones(Array.isArray(data?.resp) ? data.resp : []))
			.catch(() => setPublicaciones([]));
	}, [auto?.id]);

	const publicacionActiva = publicaciones.find((p) => p.estado === "publicada");
	const publicacionPausada = publicaciones.find((p) => p.estado === "pausada");

	function handleMarcarVendido() {
		const label = `${titleCase(auto.marca)} ${auto.modelo} ${auto.anio}`;
		navigate("/crm/ventas", {
			state: {
				autoPreseleccionado: {
					id: auto.id,
					label,
					estaEnCatalogo: true,
				},
			},
		});
	}

	useEffect(() => {
		if (!auto) return;
		setEstados([auto.estado || "disponible"]);
		setTipo(auto.tipo || null);
		setVisible(auto.visible !== undefined ? auto.visible : true);
		setTareas(auto.tareasAlistaje || []);
		setNotas(auto.notas || "");
		setFechaRecepcion(auto.fecha_recepcion || "");
		setPrecioInfoMesAnterior(auto.precio_info_mes_anterior || "");
		setPrecioInfoMesActual(auto.precio_info_mes_actual || "");
		setPrecio(auto.precio || "");
		setMoneda(auto.moneda || "AR$");
		setPrecioCliente(auto.precio_cliente || "");
		setOferta(auto.oferta || false);
		setPrecioOferta(auto.precio_oferta || "");
		setFechaCompra(auto.fecha_compra || "");
		setPrecioCompra(auto.precio_compra ? String(auto.precio_compra).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "");
		setPropietario(auto.propietario || "agencia");
		setPatente(auto.patente || "");
		setPatenteError("");
	}, [auto?.id, open]);

	if (!auto) return null;

	const imagen = auto.img?.[0] || null;
	const tareasHechas = tareas.filter((t) => t.hecha).length;
	const progresoAlistaje = tareas.length > 0 ? Math.round((tareasHechas / tareas.length) * 100) : 0;

	const estadoPrincipal = estados[0] || "disponible";

	function toggleEstado(id) {
		setEstados([id]);
	}

	function handlePrecioChange(e, setter, ref) {
		const input = e.target;
		const cursorPos = input.selectionStart;
		const oldValue = input.value;
		const raw = oldValue.replace(/\./g, "");

		if (!/^\d*$/.test(e.target.value.replace(/\./g, ""))) return;

		const newRaw = e.target.value.replace(/\./g, "");
		const formatted = newRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

		// Calcular cuántos puntos había antes y después del cursor en el valor viejo
		const puntosAntes = (oldValue.slice(0, cursorPos).match(/\./g) || []).length;
		const puntosDespues = (formatted.slice(0, cursorPos).match(/\./g) || []).length;
		const diff = puntosDespues - puntosAntes;

		setter(formatted);

		// Restaurar cursor en el siguiente tick (después del re-render)
		requestAnimationFrame(() => {
			if (ref.current) {
				const newPos = cursorPos + diff;
				ref.current.setSelectionRange(newPos, newPos);
			}
		});
	}

	function handleAgregarTarea(texto) {
		const t = texto.trim();
		if (!t) return;
		setTareas((prev) => [...prev, { id: generateTareaId(), texto: t, hecha: false }]);
		setNuevaTarea("");
	}

	function toggleTarea(id) {
		setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)));
	}

	function eliminarTarea(id) {
		setTareas((prev) => prev.filter((t) => t.id !== id));
	}

	function actualizarPrecioTarea(id, valor) {
		const limpio = valor.replace(/\./g, "");
		if (!/^\d*$/.test(limpio)) return;
		const formateado = limpio.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		setTareas((prev) => prev.map((t) => (t.id === id ? { ...t, precio: formateado } : t)));
	}

	async function handleGuardar() {
		const errPatente = validarPatente(patente);
		if (errPatente) {
			setPatenteError(errPatente);
			return;
		}
		const patenteNorm = normalizarPatente(patente) || null;
		setGuardando(true);
		try {
			await updateAuto(auto.id, {
				patente: patenteNorm,
				estado: estadoPrincipal,
				tipo,
				notas,
				en_alistaje,
				visible,
				fecha_recepcion: fechaRecepcion || null,
				precio_info_mes_anterior: precioInfoMesAnterior || null,
				precio_info_mes_actual: precioInfoMesActual || null,
				precio: precio || auto.precio,
				moneda,
				precio_cliente: precioCliente || null,
				oferta,
				precio_oferta: oferta ? precioOferta : null,
				fecha_compra: fechaCompra || null,
				precio_compra: precioCompra || null,
				propietario,
			});

			const tareasParaSync = tareas.map((t) => ({
				...(typeof t.id === "number" ? { id: t.id } : {}),
				texto: t.texto,
				hecha: t.hecha,
				precio: t.precio || null,
			}));
			await syncTareasAlistaje(auto.id, tareasParaSync);

			onUpdate(auto.id, {
				patente: patenteNorm,
				estado: estadoPrincipal,
				estados,
				tipo,
				notas,
				en_alistaje,
				visible,
				tareasAlistaje: tareas,
				fecha_recepcion: fechaRecepcion || null,
				precio_info_mes_anterior: precioInfoMesAnterior || null,
				precio_info_mes_actual: precioInfoMesActual || null,
				precio: precio || auto.precio,
				moneda,
				precio_cliente: precioCliente || null,
				oferta,
				precio_oferta: oferta ? precioOferta : null,
				fecha_compra: fechaCompra || null,
				precio_compra: precioCompra || null,
				propietario,
			});

			onClose();
		} catch (err) {
			console.error("Error al guardar:", err);
			alert("Hubo un error al guardar. Intentá de nuevo.");
		} finally {
			setGuardando(false);
		}
	}

	const TIPOS_OPCIONES = [
		{ id: "patrimonio", label: "Patrimonio propio" },
		{ id: "consignacion", label: "Consignación" },
		{ id: "consignacion_online", label: "Consignación online" },
	];

	const PROPIETARIO_OPCIONES = [
		{ id: "agencia", label: "Agencia" },
		{ id: "socio", label: "Socio" },
		{ id: "compartido", label: "Compartido 50/50" },
	];

	const MESES = [
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre",
	];
	const hoy = new Date();
	const mesActual = MESES[hoy.getMonth()];
	const mesAnterior = MESES[hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1];

	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "stock-drawer__paper" }}>
			<div className="stock-drawer">
				{/* ── Header con imagen ── */}
				<div className="stock-drawer__img-header">
					{imagen ? (
						<img className="stock-drawer__img" src={imagen} alt={`${auto.marca} ${auto.modelo}`} />
					) : (
						<div className="stock-drawer__img-placeholder" />
					)}
					<button className="stock-drawer__close" onClick={onClose} aria-label="Cerrar">
						<svg width="16" height="16" viewBox="0 0 14 14" fill="none">
							<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
					</button>

					{esAdmin && (
						<a href={`/catalogo/${auto.id}`} target="_blank" rel="noopener noreferrer" className="stock-drawer__edit-link">
							<svg width="12" height="12" viewBox="0 0 14 14" fill="none">
								<path
									d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							Editar en catálogo
						</a>
					)}
				</div>

				{/* ── Título ── */}
				<div className="stock-drawer__titulo">
					<p className="stock-drawer__marca">{titleCase(auto.marca)}</p>
					<p className="stock-drawer__modelo">{auto.modelo}</p>
					{auto.patente && <p className="stock-drawer__patente">{auto.patente}</p>}
					<div className="stock-drawer__specs">
						<span>{auto.anio}</span>
						<span>·</span>
						<span>{auto.km} km</span>
						<span>·</span>
						<span>{auto.motor}</span>
						<span>·</span>
						<span>{formatearLista(auto.transmision)}</span>
						<span>·</span>
						<span>{formatearLista(auto.combustible)}</span>
					</div>
					<div className="stock-drawer__precio-wrap">
						{auto.oferta && auto.precio_oferta ? (
							<>
								<span className="stock-drawer__precio-tachado">
									{auto.moneda} {auto.precio}
								</span>
								<span className="stock-drawer__precio-oferta">
									{auto.moneda} {auto.precio_oferta}
								</span>
							</>
						) : (
							<span className="stock-drawer__precio">
								{auto.moneda} {auto.precio}
							</span>
						)}
					</div>
				</div>

				{(publicacionActiva || publicacionPausada) && (
					<div className={`stock-drawer__ml-banner${publicacionActiva ? " stock-drawer__ml-banner--activa" : " stock-drawer__ml-banner--pausada"}`}>
						{publicacionActiva ? "Publicado en MercadoLibre" : "Pausado en MercadoLibre"}
						<a href={(publicacionActiva || publicacionPausada).permalink} target="_blank" rel="noopener noreferrer">
							Ver publicación ↗
						</a>
					</div>
				)}

				<div className="stock-drawer__divider" />

				{/* ── Patente (solo CRM) ── */}
				<div className="stock-drawer__section">
					<div className="stock-drawer__field">
						<label className="stock-drawer__field-label">Patente</label>
						{esAdmin || esSupervisor ? (
							<>
								<input
									className="stock-drawer__field-input stock-drawer__field-input--patente"
									type="text"
									value={patente}
									maxLength={10}
									onChange={(e) => {
										setPatente(e.target.value.toUpperCase());
										if (patenteError) setPatenteError("");
									}}
									onBlur={() => {
										setPatenteError(validarPatente(patente));
										setPatente((p) => normalizarPatente(p));
									}}
									placeholder="ej: AB123CD"
								/>
								{patenteError && <span className="stock-drawer__field-error">{patenteError}</span>}
							</>
						) : (
							<p className="stock-drawer__field-value">{auto.patente || <span className="stock-drawer__sin-datos">Sin datos</span>}</p>
						)}
					</div>
				</div>

				{/* ── Estado ── */}
				{esAdmin && (
					<div className="stock-drawer__section">
						<p className="stock-drawer__section-label">Estado</p>
						<div className="stock-drawer__estados-grid">
							{ESTADOS_STOCK.map((e) => {
								const activo = estados.includes(e.id);
								return (
									<button
										key={e.id}
										className={`stock-drawer__estado-btn${activo ? " stock-drawer__estado-btn--active" : ""}`}
										style={{ "--e-color": e.color }}
										onClick={() => toggleEstado(e.id)}
									>
										<span className="stock-drawer__estado-dot" />
										{e.label}
										{activo && (
											<svg className="stock-drawer__check" width="11" height="11" viewBox="0 0 10 10" fill="none">
												<path
													d="M1.5 5l2.5 2.5L8.5 2"
													stroke="currentColor"
													strokeWidth="1.8"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										)}
									</button>
								);
							})}
						</div>
					</div>
				)}

				<div className="stock-drawer__divider" />

				{/* ── Tipo ── */}
				{esAdmin && (
					<div className="stock-drawer__section">
						<p className="stock-drawer__section-label">Tipo de vehículo</p>
						<div className="stock-drawer__estados-grid stock-drawer__estados-grid_tipos">
							{TIPOS_OPCIONES.map((t) => (
								<button
									key={t.id}
									className={`stock-drawer__estado-btn${tipo === t.id ? " stock-drawer__estado-btn--active" : ""}`}
									style={{ "--e-color": tipo === t.id ? "#cc0000" : "#555" }}
									onClick={() => setTipo((prev) => (prev === t.id ? null : t.id))}
								>
									<span className="stock-drawer__estado-dot" />
									{t.label}
									{tipo === t.id && (
										<svg className="stock-drawer__check" width="11" height="11" viewBox="0 0 10 10" fill="none">
											<path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									)}
								</button>
							))}
						</div>
					</div>
				)}

				{/* ── Propietario y datos de compra ── */}
				{esAdmin && (
					<>
						<div className="stock-drawer__divider" />
						<div className="stock-drawer__section">
							<p className="stock-drawer__section-label">Propietario</p>
							<div className="stock-drawer__estados-grid stock-drawer__estados-grid_tipos">
								{PROPIETARIO_OPCIONES.map((p) => (
									<button
										key={p.id}
										className={`stock-drawer__estado-btn${propietario === p.id ? " stock-drawer__estado-btn--active" : ""}`}
										style={{ "--e-color": propietario === p.id ? "#cc0000" : "#555" }}
										onClick={() => setPropietario(p.id)}
										type="button"
									>
										<span className="stock-drawer__estado-dot" />
										{p.label}
										{propietario === p.id && (
											<svg className="stock-drawer__check" width="11" height="11" viewBox="0 0 10 10" fill="none">
												<path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										)}
									</button>
								))}
							</div>

							<div className="stock-drawer__field">
								<label className="stock-drawer__field-label">Fecha de compra</label>
								<input
									className="stock-drawer__field-input"
									type="date"
									value={fechaCompra}
									onChange={(e) => setFechaCompra(e.target.value)}
								/>
							</div>
							<div className="stock-drawer__field">
								<label className="stock-drawer__field-label">Precio de compra</label>
								<input
									ref={precioCompraRef}
									className="stock-drawer__field-input"
									type="text"
									value={precioCompra}
									onChange={(e) => handlePrecioChange(e, setPrecioCompra, precioCompraRef)}
									placeholder="ej: 15.000.000"
								/>
							</div>
						</div>
					</>
				)}

				{/* ── Visible + Alistaje (toggles en fila) ── */}
				{esAdmin && (
					<>
						<div className="stock-drawer__divider" />
						<div className="stock-drawer__section stock-drawer__section--toggles">
							<div className="stock-drawer__toggle-row">
								<div>
									<p className="stock-drawer__section-label">Visible en catálogo</p>
									<p className="stock-drawer__toggle-desc">{visible ? "El auto aparece en el sitio" : "Oculto para el público"}</p>
								</div>
								<button
									className={`stock-drawer__toggle${visible ? " stock-drawer__toggle--on stock-drawer__toggle--green" : ""}`}
									onClick={() => setVisible((p) => !p)}
								>
									<span className="stock-drawer__toggle-thumb" />
								</button>
							</div>
						</div>
					</>
				)}

				{/* ── Datos de precio ── */}
				<div className="stock-drawer__divider" />
				<div className="stock-drawer__section">
					{/* Fecha de recepción — solo admin */}
					{esAdmin && (
						<div className="stock-drawer__field">
							<label className="stock-drawer__field-label">Fecha de recepción</label>
							<input
								className="stock-drawer__field-input"
								type="date"
								value={fechaRecepcion}
								onChange={(e) => setFechaRecepcion(e.target.value)}
							/>
						</div>
					)}

					{/* Precio InfoAuto mes anterior — todos ven, solo admin edita */}
					<div className="stock-drawer__field">
						<label className="stock-drawer__field-label">Precio InfoAuto {mesAnterior}</label>
						{esAdmin ? (
							<input
								ref={precioInfoAnteriorRef}
								className="stock-drawer__field-input"
								type="text"
								value={precioInfoMesAnterior}
								onChange={(e) => handlePrecioChange(e, setPrecioInfoMesAnterior, precioInfoAnteriorRef)}
								placeholder="ej: 18.500.000"
							/>
						) : (
							<p className="stock-drawer__field-value">
								{precioInfoMesAnterior ? `AR$ ${precioInfoMesAnterior}` : <span className="stock-drawer__sin-datos">Sin datos</span>}
							</p>
						)}
					</div>

					{/* Precio InfoAuto mes actual — todos ven, solo admin edita */}
					<div className="stock-drawer__field">
						<label className="stock-drawer__field-label">Precio InfoAuto {mesActual}</label>
						{esAdmin ? (
							<input
								ref={precioInfoActualRef}
								className="stock-drawer__field-input"
								type="text"
								value={precioInfoMesActual}
								onChange={(e) => handlePrecioChange(e, setPrecioInfoMesActual, precioInfoActualRef)}
								placeholder="ej: 19.200.000"
							/>
						) : (
							<p className="stock-drawer__field-value">
								{precioInfoMesActual ? `AR$ ${precioInfoMesActual}` : <span className="stock-drawer__sin-datos">Sin datos</span>}
							</p>
						)}
					</div>

					{/* Precio cliente — solo consignación, solo admin edita */}
					{(esAdmin || esSupervisor) && (auto.tipo === "consignacion" || auto.tipo === "consignacion_online") && (
						<div className="stock-drawer__field stock-drawer__field--cliente">
							<label className="stock-drawer__field-label stock-drawer__field-label--cliente">Precio cliente</label>
							{esAdmin ? (
								<input
									ref={precioClienteRef}
									className="stock-drawer__field-input stock-drawer__field-input--cliente"
									type="text"
									value={precioCliente}
									onChange={(e) => handlePrecioChange(e, setPrecioCliente, precioClienteRef)}
									placeholder="ej: 17.000.000"
								/>
							) : (
								<p className="stock-drawer__field-value">
									{precioCliente ? `AR$ ${precioCliente}` : <span className="stock-drawer__sin-datos">Sin datos</span>}
								</p>
							)}
						</div>
					)}

					{/* Precio de lista y moneda — solo admin */}
					{esAdmin && (
						<div className="stock-drawer__field stock-drawer__field--destacado">
							<label className="stock-drawer__field-label stock-drawer__field-label--destacado">Precio de lista</label>
							<div style={{ display: "flex", gap: 8 }}>
								<input
									ref={precioRef}
									className="stock-drawer__field-input stock-drawer__field-input--destacado"
									type="text"
									value={precio}
									onChange={(e) => handlePrecioChange(e, setPrecio, precioRef)}
									placeholder="ej: 21.300.000"
									style={{ flex: 1 }}
								/>
								<select
									className="stock-drawer__field-input"
									value={moneda}
									onChange={(e) => setMoneda(e.target.value)}
									style={{ width: 80 }}
								>
									<option value="AR$">AR$</option>
									<option value="U$D">U$D</option>
								</select>
							</div>
						</div>
					)}

					{/* Precio de oferta — solo admin */}
					{esAdmin && (
						<div className="stock-drawer__field--oferta-wrap">
							<button
								className={`stock-drawer__oferta-toggle${oferta ? " stock-drawer__oferta-toggle--on" : ""}`}
								onClick={() => setOferta((p) => !p)}
								type="button"
							>
								<span className="stock-drawer__oferta-toggle-box">
									{oferta && (
										<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
											<path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									)}
								</span>
								Precio de oferta
							</button>

							{oferta && (
								<div className="stock-drawer__field stock-drawer__field--oferta">
									<label className="stock-drawer__field-label stock-drawer__field-label--oferta">Precio de oferta</label>
									<input
										ref={precioOfertaRef}
										className="stock-drawer__field-input stock-drawer__field-input--oferta"
										type="text"
										value={precioOferta}
										onChange={(e) => handlePrecioChange(e, setPrecioOferta, precioOfertaRef)}
										placeholder="ej: 14.900.000"
									/>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="stock-drawer__divider" />

				{/* ── Alistaje ── */}
				<div className="stock-drawer__section">
					<div className="stock-drawer__alistaje-header">
						<div>
							<p className="stock-drawer__section-label">Alistaje</p>
							{tareas.length > 0 && (
								<p className="stock-drawer__alistaje-progress">
									{tareasHechas}/{tareas.length} tareas · {progresoAlistaje}%
								</p>
							)}
						</div>
					</div>

					{tareas.length === 0 && !esAdmin && <p className="stock-drawer__sin-datos">No hay tareas todavía.</p>}

					{tareas.length > 0 && (
						<div className="stock-drawer__alistaje-bar">
							<div className="stock-drawer__alistaje-fill" style={{ width: `${progresoAlistaje}%` }} />
						</div>
					)}

					{tareas.length > 0 && (
						<ul className="stock-drawer__tareas">
							{tareas.map((t) => (
								<li key={t.id} className={`stock-drawer__tarea${t.hecha ? " stock-drawer__tarea--hecha" : ""}`}>
									<button className="stock-drawer__tarea-check" onClick={() => esAdmin && toggleTarea(t.id)} disabled={!esAdmin}>
										{t.hecha && (
											<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
												<path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										)}
									</button>
									<span className="stock-drawer__tarea-texto">{t.texto}</span>
									{esAdmin && (
										<input
											className="stock-drawer__field-input stock-drawer__tarea-precio"
											type="text"
											value={t.precio || ""}
											onChange={(e) => actualizarPrecioTarea(t.id, e.target.value)}
											placeholder="Gasto (opcional)"
											style={{ width: 110 }}
										/>
									)}
									{esAdmin && (
										<button className="stock-drawer__tarea-del" onClick={() => eliminarTarea(t.id)}>
											<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
												<path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
											</svg>
										</button>
									)}
								</li>
							))}
						</ul>
					)}

					{esAdmin && (
						<>
							<div className="stock-drawer__tarea-add">
								<input
									className="stock-drawer__tarea-input"
									value={nuevaTarea}
									onChange={(e) => setNuevaTarea(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleAgregarTarea(nuevaTarea)}
									placeholder="Agregar tarea…"
								/>
								<button
									className="stock-drawer__tarea-add-btn"
									onClick={() => handleAgregarTarea(nuevaTarea)}
									disabled={!nuevaTarea.trim()}
								>
									+
								</button>
							</div>
							<div className="stock-drawer__templates">
								{TAREAS_ALISTAJE_TEMPLATES.filter((tmpl) => !tareas.some((t) => t.texto === tmpl)).map((tmpl) => (
									<button key={tmpl} className="stock-drawer__template-btn" onClick={() => handleAgregarTarea(tmpl)}>
										+ {tmpl}
									</button>
								))}
							</div>
						</>
					)}
				</div>

				<div className="stock-drawer__divider" />
				{/* ── Características Detalladas ── */}
				<div className="stock-drawer__section">
					<p className="stock-drawer__section-label">Características Detalladas</p>
					{esAdmin ? (
						<textarea
							className="stock-drawer__notas"
							value={notas}
							onChange={(e) => setNotas(e.target.value)}
							rows={3}
							placeholder="Observaciones, historial, señas recibidas…"
						/>
					) : notas?.trim() ? (
						<p className="stock-drawer__notas-texto">{notas}</p>
					) : (
						<p className="stock-drawer__sin-datos">Sin notas todavía.</p>
					)}
				</div>

				{/* ── Marcar como vendido ── */}
				{esAdmin && (
					<>
						<div className="stock-drawer__divider" />
						<div className="stock-drawer__section">
							{!confirmandoVenta ? (
								<button className="stock-drawer__vender-btn" onClick={() => setConfirmandoVenta(true)}>
									<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
										<path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									Marcar como vendido
								</button>
							) : (
								<div className="stock-drawer__venta-confirm">
									<p className="stock-drawer__venta-confirm-text">¿Confirmás? El auto se eliminará del stock{(publicacionActiva || publicacionPausada) ? " y su publicación en MercadoLibre se elimina también" : ""}.</p>
									<div className="stock-drawer__venta-confirm-btns">
										<button className="stock-drawer__cancel-btn" onClick={() => setConfirmandoVenta(false)}>
											Cancelar
										</button>
										<button className="stock-drawer__vender-btn" onClick={handleMarcarVendido}>
											Sí, marcar como vendido
										</button>
									</div>
								</div>
							)}
						</div>
					</>
				)}

				{/* ── Footer ── */}
				{esAdmin ? (
					<div className="stock-drawer__footer">
						{(publicacionActiva || publicacionPausada) && (
							<p className="stock-drawer__ml-footer-warning">
								Publicado en MercadoLibre — al guardar, precio/km/fotos se sincronizan también ahí.
							</p>
						)}
						<div className="stock-drawer__footer-btns">
							<button className="stock-drawer__cancel-btn" onClick={onClose} disabled={guardando}>
								Cancelar
							</button>
							<button className="stock-drawer__guardar-btn" onClick={handleGuardar} disabled={guardando}>
								{guardando ? "Guardando…" : "Guardar cambios"}
							</button>
						</div>
					</div>
				) : (
					<div className="stock-drawer__footer">
						<button className="stock-drawer__guardar-btn" onClick={onClose}>
							Cerrar
						</button>
					</div>
				)}
			</div>
		</Drawer>
	);
}