import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import "./VentaDrawer.css";
import { DASH, cap, formatMonto, getAutoDatos, tituloVehiculo, valorOGuion, listaOGuion } from "../ventaVehiculo";

const PROPIETARIO_LABELS = { agencia: "Agencia", socio: "Socio", compartido: "Compartido 50/50" };
const TIPO_LABELS = { patrimonio: "Patrimonio propio", consignacion: "Consignación", consignacion_online: "Consignación online" };

function formatFechaCorta(iso) {
	if (!iso) return DASH;
	const [y, m, d] = String(iso).split("T")[0].split("-");
	return `${d}/${m}/${y}`;
}

function Spec({ label, value }) {
	return (
		<div className="venta-drawer__spec">
			<span className="venta-drawer__spec-label">{label}</span>
			<span className="venta-drawer__spec-value">{value}</span>
		</div>
	);
}

function VentaDetalle({ venta }) {
	const d = getAutoDatos(venta);
	const moneda = d?.moneda || venta.moneda || "ARS";
	const categorias = Array.isArray(d?.categorias) && d.categorias.length ? d.categorias.map(cap).join(", ") : DASH;
	const precioLista = d?.precio ? `${d.moneda || ""} ${d.precio}`.trim() : DASH;
	const precioOferta = d?.precio_oferta ? `${d.moneda || ""} ${d.precio_oferta}`.trim() : DASH;
	const detalleGastos = Array.isArray(venta.gastosDetalle) ? venta.gastosDetalle : [];
	const mostrarFinanzas = venta.ganancia != null || venta.precioCompra != null || venta.gastos != null || venta.propietarioAuto;

	return (
		<>
			<div className="venta-drawer__section">
				<h3 className="venta-drawer__sec-titulo">Vehículo</h3>
				<div className="venta-drawer__veh-titulo">{tituloVehiculo(venta)}</div>
				{!d && <p className="venta-drawer__nota">Venta anterior: sin ficha técnica guardada del vehículo.</p>}
				<div className="venta-drawer__specs">
					<Spec label="Marca" value={d?.marca ? cap(d.marca) : DASH} />
					<Spec label="Modelo" value={valorOGuion(d?.modelo)} />
					<Spec label="Año" value={valorOGuion(d?.anio)} />
					<Spec label="Kilómetros" value={d?.km != null && d?.km !== "" ? `${d.km} km` : DASH} />
					<Spec label="Patente" value={d?.patente ? String(d.patente).toUpperCase() : DASH} />
					<Spec label="Color" value={d?.color ? cap(d.color) : DASH} />
					<Spec label="Motor" value={valorOGuion(d?.motor)} />
					<Spec label="Transmisión" value={listaOGuion(d?.transmision)} />
					<Spec label="Combustible" value={listaOGuion(d?.combustible)} />
					<Spec label="Tracción" value={listaOGuion(d?.traccion)} />
					<Spec label="Tipo" value={d?.tipo ? TIPO_LABELS[d.tipo] || cap(d.tipo) : DASH} />
					<Spec label="Categorías" value={categorias} />
					<Spec label="Moneda" value={d ? moneda : DASH} />
					<Spec label="Precio de lista" value={precioLista} />
					<Spec label="Precio de oferta" value={precioOferta} />
				</div>
				{d?.notas && (
					<div className="venta-drawer__notas">
						<span className="venta-drawer__spec-label">Notas</span>
						<p>{d.notas}</p>
					</div>
				)}
			</div>

			<div className="venta-drawer__section">
				<h3 className="venta-drawer__sec-titulo">Venta</h3>
				<div className="venta-drawer__specs">
					<Spec label="Fecha" value={formatFechaCorta(venta.fechaVenta)} />
					<Spec label="Precio de venta" value={venta.precioVendido ? `${venta.moneda || "ARS"} ${venta.precioVendido}` : DASH} />
					<Spec label="Cliente" value={`${venta.nombre || ""} ${venta.apellido || ""}`.trim() || DASH} />
					<Spec label="Teléfono" value={valorOGuion(venta.telefono)} />
					<Spec label="Auto recibido" value={venta.recibioPago ? valorOGuion(venta.autoRecibido) : "No"} />
				</div>
			</div>

			{mostrarFinanzas && (
				<div className="venta-drawer__section">
					<h3 className="venta-drawer__sec-titulo">Compra y ganancia</h3>
					<div className="venta-drawer__specs">
						<Spec label="Propietario" value={venta.propietarioAuto ? PROPIETARIO_LABELS[venta.propietarioAuto] || venta.propietarioAuto : DASH} />
						<Spec label="Fecha de compra" value={formatFechaCorta(venta.fechaCompra)} />
						<Spec label="Precio de compra" value={venta.precioCompra != null ? formatMonto(venta.precioCompra) : DASH} />
						<Spec label="Gastos" value={venta.gastos != null ? formatMonto(venta.gastos) : DASH} />
						<Spec label="Ganancia" value={venta.ganancia != null ? formatMonto(venta.ganancia) : DASH} />
					</div>
					{detalleGastos.length > 0 && (
						<ul className="venta-drawer__gastos">
							{detalleGastos.map((g, i) => (
								<li key={i}>
									<span>{g.texto}</span>
									<span>{g.precio ? formatMonto(g.precio) : DASH}</span>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</>
	);
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function getAnios() {
	const actual = new Date().getFullYear();
	const anios = [];
	for (let y = 2024; y <= actual; y++) anios.push(y);
	return anios;
}

function diasEnMes(mes, anio) {
	return new Date(anio, mes, 0).getDate();
}

function isoAPartes(iso) {
	if (!iso) {
		const hoy = new Date();
		return { dia: hoy.getDate(), mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
	}
	const [y, m, d] = iso.split("-").map(Number);
	return { dia: d, mes: m, anio: y };
}

function partesAIso({ dia, mes, anio }) {
	return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function normalizar(s) {
	return (s || "")
		.toString()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

// Si el texto libre que cargó el vendedor coincide con un auto que sigue en el
// stock, lo devolvemos para forzar el vínculo con el catálogo — de lo contrario
// la venta queda registrada pero el auto sigue figurando "disponible" para siempre,
// porque nada más lo da de baja del catálogo.
function buscarAutoCoincidente(texto, autos) {
	const norm = normalizar(texto);
	if (!norm) return null;
	return (
		autos.find((a) => {
			const marca = normalizar(a.marca);
			const modelo = normalizar(a.modelo);
			const anio = String(a.anio || "");
			return marca && modelo && norm.includes(marca) && norm.includes(modelo) && (!anio || norm.includes(anio));
		}) || null
	);
}

function formVacio() {
	const hoy = new Date();
	return {
		esPrestamo: false,
		estaEnCatalogo: false,
		autoId: "",
		vehiculoVendido: "",
		fechaVenta: partesAIso({ dia: hoy.getDate(), mes: hoy.getMonth() + 1, anio: hoy.getFullYear() }),
		nombre: "",
		apellido: "",
		telefono: "",
		recibioPago: false,
		autoRecibido: "",
		precioVendido: "",
		moneda: "ARS",
	};
}

function FechaSelector({ value, onChange }) {
	const partes = isoAPartes(value);
	const [dia, setDia] = useState(partes.dia);
	const [mes, setMes] = useState(partes.mes);
	const [anio, setAnio] = useState(partes.anio);

	const anios = getAnios();
	const maxDia = diasEnMes(mes, anio);
	const dias = Array.from({ length: maxDia }, (_, i) => i + 1);

	function handleMes(nuevoMes) {
		const nm = Number(nuevoMes);
		const maxD = diasEnMes(nm, anio);
		const nuevoDia = Math.min(dia, maxD);
		setMes(nm);
		setDia(nuevoDia);
		onChange(partesAIso({ dia: nuevoDia, mes: nm, anio }));
	}

	function handleAnio(nuevoAnio) {
		const na = Number(nuevoAnio);
		const maxD = diasEnMes(mes, na);
		const nuevoDia = Math.min(dia, maxD);
		setAnio(na);
		setDia(nuevoDia);
		onChange(partesAIso({ dia: nuevoDia, mes, anio: na }));
	}

	function handleDia(nuevoDia) {
		const nd = Number(nuevoDia);
		setDia(nd);
		onChange(partesAIso({ dia: nd, mes, anio }));
	}

	return (
		<div style={{ display: "flex", gap: 6 }}>
			<select className="venta-drawer__form-select" value={dia} onChange={(e) => handleDia(e.target.value)} style={{ flex: "0 0 72px" }}>
				{dias.map((d) => (
					<option key={d} value={d}>
						{String(d).padStart(2, "0")}
					</option>
				))}
			</select>
			<select className="venta-drawer__form-select" value={mes} onChange={(e) => handleMes(e.target.value)} style={{ flex: 1 }}>
				{MESES.map((nombre, i) => (
					<option key={i + 1} value={i + 1}>
						{nombre}
					</option>
				))}
			</select>
			<select className="venta-drawer__form-select" value={anio} onChange={(e) => handleAnio(e.target.value)} style={{ flex: "0 0 80px" }}>
				{anios.map((a) => (
					<option key={a} value={a}>
						{a}
					</option>
				))}
			</select>
		</div>
	);
}

export default function VentaDrawer({ modo, venta, onClose, onGuardar, autos, autoPreseleccionado }) {
	const [form, setForm] = useState(formVacio());
	const [error, setError] = useState("");
	const [guardando, setGuardando] = useState(false);

	useEffect(() => {
		if (modo === "nueva") {
			if (autoPreseleccionado) {
				// Viene del stock: preseleccionar el auto
				setForm({
					...formVacio(),
					estaEnCatalogo: true,
					autoId: String(autoPreseleccionado.id),
					vehiculoVendido: autoPreseleccionado.label,
				});
			} else {
				setForm(formVacio());
			}
			setError("");
		} else if (modo === "editar" && venta) {
			setForm({
				estaEnCatalogo: false, // en edición no rehacemos el flujo de catálogo
				autoId: "",
				vehiculoVendido: venta.vehiculoVendido || "",
				fechaVenta: venta.fechaVenta || "",
				nombre: venta.nombre || "",
				apellido: venta.apellido || "",
				telefono: venta.telefono || "",
				recibioPago: venta.recibioPago || false,
				autoRecibido: venta.autoRecibido || "",
				precioVendido: venta.precioVendido || "",
				moneda: venta.moneda || "ARS",
			});
			setError("");
		}
	}, [modo, venta]);

	const abierto = modo === "nueva" || modo === "editar" || (modo === "ver" && !!venta);
	const esPrestamo = modo === "nueva" && form.esPrestamo;
	const titulo = modo === "ver" ? "Detalle de venta" : modo === "nueva" ? (esPrestamo ? "Nuevo préstamo" : "Nueva venta") : "Editar venta";

	function handleMonto(e, campo) {
		const raw = e.target.value.replace(/\./g, "");
		if (raw && isNaN(Number(raw))) return;
		set(campo, raw.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
	}

	function set(campo, valor) {
		setForm((prev) => ({ ...prev, [campo]: valor }));
		setError("");
	}

	function handleToggleCatalogo(checked) {
		setForm((prev) => ({
			...prev,
			estaEnCatalogo: checked,
			autoId: "",
			vehiculoVendido: "",
		}));
		setError("");
	}

	function handleSelectAuto(e) {
		const id = e.target.value;
		if (!id) {
			set("autoId", "");
			set("vehiculoVendido", "");
			return;
		}
		const auto = autos.find((a) => String(a.id) === id);
		if (auto) {
			const marca = auto.marca.charAt(0).toUpperCase() + auto.marca.slice(1);
			setForm((prev) => ({
				...prev,
				autoId: id,
				vehiculoVendido: `${marca} ${auto.modelo} ${auto.anio}`,
			}));
		}
		setError("");
	}

	async function handleGuardarPrestamo() {
		if (!form.nombre.trim()) return setError("Ingresá el nombre de la persona.");
		if (!form.apellido.trim()) return setError("Ingresá el apellido de la persona.");
		if (!form.telefono.trim()) return setError("Ingresá el teléfono.");
		if (!form.fechaVenta) return setError("Seleccioná la fecha del préstamo.");
		if (!form.precioVendido.trim()) return setError("Ingresá el monto prestado.");
		setGuardando(true);
		try {
			await onGuardar({
				esPrestamo: true,
				vehiculoVendido: form.vehiculoVendido.trim() || "Préstamo",
				fechaVenta: form.fechaVenta,
				nombre: form.nombre.trim(),
				apellido: form.apellido.trim(),
				telefono: form.telefono.trim(),
				recibioPago: false,
				precioVendido: form.precioVendido.trim(),
				moneda: form.moneda,
				autoRecibido: null,
				autoId: null,
			});
		} finally {
			setGuardando(false);
		}
	}

	async function handleGuardar() {
		if (esPrestamo) return handleGuardarPrestamo();
		if (modo === "nueva" && form.estaEnCatalogo && !form.autoId) {
			setError("Seleccioná el vehículo del catálogo.");
			return;
		}
		if (!form.vehiculoVendido.trim()) {
			setError("Ingresá el nombre del vehículo vendido.");
			return;
		}
		if (modo === "nueva" && !form.estaEnCatalogo) {
			const coincidente = buscarAutoCoincidente(form.vehiculoVendido, autos);
			if (coincidente) {
				const marca = coincidente.marca.charAt(0).toUpperCase() + coincidente.marca.slice(1);
				setError(
					`Este vehículo sigue publicado en el catálogo (${marca} ${coincidente.modelo} ${coincidente.anio}). Tildá "¿El auto vendido estaba publicado en el catálogo?" y seleccionalo de la lista, así se da de baja del stock automáticamente al registrar la venta.`,
				);
				return;
			}
		}
		if (!form.nombre.trim()) {
			setError("Ingresá el nombre del cliente.");
			return;
		}
		if (!form.apellido.trim()) {
			setError("Ingresá el apellido del cliente.");
			return;
		}
		if (!form.telefono.trim()) {
			setError("Ingresá el teléfono.");
			return;
		}
		if (!form.fechaVenta) {
			setError("Seleccioná la fecha de venta.");
			return;
		}
		if (form.recibioPago && !form.autoRecibido.trim()) {
			setError("Indicá qué auto se recibió como parte de pago.");
			return;
		}

		setGuardando(true);
		try {
			// El borrado del auto del catálogo (cuando corresponde) lo hace el backend
			// en la misma transacción que crea la venta — así no puede pasar que el
			// auto se borre y la venta falle (o viceversa) por llamadas separadas.
			const datosVenta = {
				vehiculoVendido: form.vehiculoVendido.trim(),
				fechaVenta: form.fechaVenta,
				nombre: form.nombre.trim(),
				apellido: form.apellido.trim(),
				telefono: form.telefono.trim(),
				recibioPago: form.recibioPago,
				precioVendido: form.precioVendido.trim() || null,
				moneda: form.moneda,
				autoRecibido: form.recibioPago ? form.autoRecibido.trim() : null,
				autoId: modo === "nueva" && form.estaEnCatalogo && form.autoId ? form.autoId : null,
			};

			onGuardar(datosVenta);
		} catch (err) {
			console.error("Error al guardar venta:", err);
			setError("Hubo un error al guardar. Intentá de nuevo.");
		} finally {
			setGuardando(false);
		}
	}

	return (
		<Drawer anchor="right" open={abierto} onClose={onClose} className="venta-drawer" ModalProps={{ keepMounted: false }}>
			<div className="venta-drawer__inner">
				<div className="venta-drawer__header">
					<span className="venta-drawer__titulo">{titulo}</span>
					<button className="venta-drawer__close-btn" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="venta-drawer__scroll">
					{modo === "ver" && venta && (
						<>
							<VentaDetalle venta={venta} />
							<div className="venta-drawer__form-actions">
								<button className="venta-drawer__btn-cancelar" onClick={onClose}>
									Cerrar
								</button>
							</div>
						</>
					)}

					{modo !== "ver" && (
					<>
					<div className="venta-drawer__section">
						<div className="venta-drawer__form">
							{/* ── Préstamo (solo alta) ── */}
							{modo === "nueva" && !autoPreseleccionado && (
								<div className="venta-drawer__form-group">
									<label className="venta-drawer__checkbox-row">
										<input type="checkbox" checked={form.esPrestamo} onChange={(e) => set("esPrestamo", e.target.checked)} />
										<span className="venta-drawer__checkbox-label">Es un préstamo (la empresa le presta dinero a alguien)</span>
									</label>
								</div>
							)}

							{/* ── Paso 1: ¿estaba en el catálogo? ── */}
							{modo === "nueva" && !esPrestamo && (
								<div className="venta-drawer__form-group">
									<label className="venta-drawer__checkbox-row">
										<input type="checkbox" checked={form.estaEnCatalogo} onChange={(e) => handleToggleCatalogo(e.target.checked)} />
										<span className="venta-drawer__checkbox-label">¿El auto vendido estaba publicado en el catálogo?</span>
									</label>
								</div>
							)}

							{/* ── Vehículo: selector o input según el check ── */}
							{!esPrestamo && (
							<div className="venta-drawer__form-group">
								<label className="venta-drawer__form-label">Vehículo vendido *</label>

								{modo === "nueva" && form.estaEnCatalogo ? (
									// Estaba en catálogo: solo el selector
									<select className="venta-drawer__form-select" value={form.autoId} onChange={handleSelectAuto}>
										<option value="">— Seleccionar del catálogo —</option>
										{[...autos]
											.sort((a, b) => a.marca.localeCompare(b.marca))
											.map((a) => (
												<option key={a.id} value={String(a.id)}>
													{a.marca.charAt(0).toUpperCase() + a.marca.slice(1)} {a.modelo} {a.anio}
												</option>
											))}
									</select>
								) : (
									// No estaba en catálogo: solo el input libre
									<input
										className="venta-drawer__form-input"
										type="text"
										placeholder="Ej: Volkswagen Golf 2020"
										value={form.vehiculoVendido}
										onChange={(e) => set("vehiculoVendido", e.target.value)}
									/>
								)}
							</div>
							)}

							{/* Fecha */}
							<div className="venta-drawer__form-group">
								<label className="venta-drawer__form-label">{esPrestamo ? "Fecha del préstamo *" : "Fecha de venta *"}</label>
								<FechaSelector value={form.fechaVenta} onChange={(iso) => set("fechaVenta", iso)} />
							</div>

							{/* Nombre */}
							<div className="venta-drawer__form-group">
								<label className="venta-drawer__form-label">Nombre *</label>
								<input
									className="venta-drawer__form-input"
									type="text"
									placeholder="Nombre del cliente"
									value={form.nombre}
									onChange={(e) => set("nombre", e.target.value)}
								/>
							</div>

							{/* Apellido */}
							<div className="venta-drawer__form-group">
								<label className="venta-drawer__form-label">Apellido *</label>
								<input
									className="venta-drawer__form-input"
									type="text"
									placeholder="Apellido del cliente"
									value={form.apellido}
									onChange={(e) => set("apellido", e.target.value)}
								/>
							</div>

							{/* Teléfono */}
							<div className="venta-drawer__form-group">
								<label className="venta-drawer__form-label">Teléfono *</label>
								<input
									className="venta-drawer__form-input"
									type="text"
									placeholder="+54 9 351 000-0000"
									value={form.telefono}
									onChange={(e) => set("telefono", e.target.value)}
								/>
							</div>

							{/* Precio vendido */}
							<div className="venta-drawer__form-group">
								<label className="venta-drawer__form-label">{esPrestamo ? "Monto prestado *" : "Precio de venta *"}</label>
								<div style={{ display: "flex", gap: 6 }}>
									<select
										className="venta-drawer__form-select"
										value={form.moneda}
										onChange={(e) => set("moneda", e.target.value)}
										style={{ flex: "0 0 90px" }}
									>
										<option value="ARS">ARS</option>
										<option value="USD">USD</option>
									</select>
									<input
										className="venta-drawer__form-input"
										type="text"
										inputMode="numeric"
										placeholder="Ej: 15.000.000"
										value={form.precioVendido}
										style={{ flex: 1 }}
										onChange={(e) => handleMonto(e, "precioVendido")}
									/>
								</div>
							</div>

							{esPrestamo && (
								<div className="venta-drawer__form-group">
									<label className="venta-drawer__form-label">Motivo / detalle (opcional)</label>
									<textarea
										className="venta-drawer__form-input"
										rows={3}
										placeholder="Ej: Adelanto para compra de repuestos"
										value={form.vehiculoVendido}
										onChange={(e) => set("vehiculoVendido", e.target.value)}
									/>
								</div>
							)}

							{/* Parte de pago */}
							{!esPrestamo && (
							<div className="venta-drawer__form-group">
								<label className="venta-drawer__checkbox-row">
									<input type="checkbox" checked={form.recibioPago} onChange={(e) => set("recibioPago", e.target.checked)} />
									<span className="venta-drawer__checkbox-label">Se recibió un vehículo como parte de pago</span>
								</label>
							</div>
							)}

							{!esPrestamo && form.recibioPago && (
								<div className="venta-drawer__form-group">
									<label className="venta-drawer__form-label">Vehículo recibido</label>
									<input
										className="venta-drawer__form-input"
										type="text"
										placeholder="Ej: Ford Ka 2018, Toyota Corolla 2020..."
										value={form.autoRecibido}
										onChange={(e) => set("autoRecibido", e.target.value)}
										autoFocus
									/>
								</div>
							)}
						</div>
					</div>

					{error && <p className="venta-drawer__error">{error}</p>}

					<div className="venta-drawer__form-actions">
						<button className="venta-drawer__btn-guardar" onClick={handleGuardar} disabled={guardando}>
							{guardando ? "Guardando…" : esPrestamo ? "Registrar préstamo" : modo === "nueva" ? "Registrar venta" : "Guardar cambios"}
						</button>
						<button className="venta-drawer__btn-cancelar" onClick={onClose} disabled={guardando}>
							Cancelar
						</button>
					</div>
					</>
					)}
				</div>
			</div>
		</Drawer>
	);
}
