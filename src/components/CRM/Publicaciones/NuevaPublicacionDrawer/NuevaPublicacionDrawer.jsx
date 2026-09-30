import React, { useState, useEffect, useRef } from "react";
import Drawer from "@mui/material/Drawer";
import { getAutos } from "../../../../services/autos.service";
import { crearPublicacion, getCupoPublicaciones, getPublicaciones } from "../../../../services/publicaciones.service";
import "./NuevaPublicacionDrawer.css";

// Descripción por defecto — siempre la misma para todos los autos (info de
// financiación + la empresa, no datos del vehículo puntual, que ya se ven en
// la ficha técnica de MercadoLibre). El admin la puede editar por publicación
// desde este mismo drawer antes de confirmar.
const DESCRIPCION_DEFAULT = `~ OPCIONES DE PAGO ~

· Financiación a tu medida
· Créditos prendarios y personales
· Trabajamos con los principales bancos del país
· Recibimos su vehículo como parte de pago
· Planes en tasa fija o UVA
· Entrega inmediata
· Gestión integral de la operación

~ SOBRE NOSOTROS ~

En Car Place nos dedicamos a la compra y venta de vehículos usados seleccionados.

Brindamos atención personalizada, transparencia y asesoramiento profesional en cada operación.

Córdoba Capital
CAR PLACE`;

/**
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onCreated: () => void
 *  - autoInicial: auto ya elegido de antemano (ej. recién creado) — si viene,
 *    se salta el paso de "buscar" y arranca directo en "confirmar" para ESE
 *    auto. El botón secundario pasa a ser "Omitir" (cerrar sin publicar) en
 *    vez de "Volver a buscar", porque no hay a qué volver.
 */
const NuevaPublicacionDrawer = ({ open, onClose, onCreated, autoInicial = null }) => {
	const [paso, setPaso] = useState(autoInicial ? "confirmar" : "buscar"); // "buscar" | "confirmar"
	const [searchText, setSearchText] = useState("");
	const [resultados, setResultados] = useState([]);
	const [buscando, setBuscando] = useState(false);
	const [autoSeleccionado, setAutoSeleccionado] = useState(autoInicial);

	const [titulo, setTitulo] = useState("");
	const [descripcion, setDescripcion] = useState("");
	const [listingType, setListingType] = useState("silver");
	const [cupo, setCupo] = useState(null); // { gold, silver } | null mientras carga
	const [autosPublicadosIds, setAutosPublicadosIds] = useState(new Set());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const debounceRef = useRef(null);

	useEffect(() => {
		if (!open) return;

		if (autoInicial) {
			setPaso("confirmar");
			setAutoSeleccionado(autoInicial);
			setTitulo(`${autoInicial.marca} ${autoInicial.modelo} ${autoInicial.anio}`);
			setDescripcion(DESCRIPCION_DEFAULT);
		} else {
			setPaso("buscar");
			setSearchText("");
			setResultados([]);
			setAutoSeleccionado(null);
			setTitulo("");
			setDescripcion("");
		}
		setListingType("silver");
		setCupo(null);
		setAutosPublicadosIds(new Set());
		setError("");
		getCupoPublicaciones()
			.then((data) => setCupo(data?.resp || null))
			.catch(() => setCupo(null));
		if (!autoInicial) {
			getPublicaciones()
				.then((data) => {
					const publicadas = (Array.isArray(data?.resp) ? data.resp : []).filter((p) =>
						["publicada", "pausada"].includes(p.estado),
					);
					setAutosPublicadosIds(new Set(publicadas.map((p) => p.autoId)));
				})
				.catch(() => setAutosPublicadosIds(new Set()));
		}
	}, [open, autoInicial]);

	useEffect(() => {
		if (!open || paso !== "buscar") return;
		clearTimeout(debounceRef.current);
		if (!searchText.trim()) {
			setResultados([]);
			return;
		}
		debounceRef.current = setTimeout(async () => {
			setBuscando(true);
			try {
				const data = await getAutos({ searchText });
				const todos = Array.isArray(data?.resp) ? data.resp : [];
				setResultados(todos.filter((auto) => !autosPublicadosIds.has(auto.id)));
			} catch {
				setResultados([]);
			} finally {
				setBuscando(false);
			}
		}, 300);
		return () => clearTimeout(debounceRef.current);
	}, [searchText, open, paso, autosPublicadosIds]);

	const handleElegirAuto = (auto) => {
		setAutoSeleccionado(auto);
		setTitulo(`${auto.marca} ${auto.modelo} ${auto.anio}`);
		setDescripcion(DESCRIPCION_DEFAULT);
		setPaso("confirmar");
	};

	const handleVolver = () => {
		if (autoInicial) {
			onClose();
			return;
		}
		setPaso("buscar");
		setAutoSeleccionado(null);
		setError("");
	};

	const handlePublicar = async () => {
		if (!autoSeleccionado) return;
		setError("");
		setLoading(true);
		try {
			await crearPublicacion({ autoId: autoSeleccionado.id, titulo, descripcion, listingType });
			onCreated();
		} catch (err) {
			const msg = err?.response?.data?.error || "No se pudo publicar en MercadoLibre.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "nueva-publicacion-drawer__paper" }}>
			<div className="nueva-publicacion-drawer">
				<div className="nueva-publicacion-drawer__header">
					<span className="nueva-publicacion-drawer__title">
						{paso === "buscar" ? "Publicar auto" : autoInicial ? "¿Publicar en MercadoLibre?" : "Confirmar publicación"}
					</span>
					<button className="nueva-publicacion-drawer__close" onClick={onClose} aria-label="Cerrar">
						<svg viewBox="0 0 16 16" fill="none">
							<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				{paso === "buscar" ? (
					<div className="nueva-publicacion-drawer__body">
						<div className="nueva-publicacion-drawer__field">
							<label className="nueva-publicacion-drawer__label">Buscar auto en stock</label>
							<input
								className="nueva-publicacion-drawer__input"
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								placeholder="ej: Peugeot 208"
								autoComplete="off"
								autoFocus
							/>
						</div>

						<div className="nueva-publicacion-drawer__resultados">
							{buscando && <span className="nueva-publicacion-drawer__hint">Buscando…</span>}
							{!buscando && searchText.trim() && resultados.length === 0 && (
								<span className="nueva-publicacion-drawer__hint">No se encontraron autos.</span>
							)}
							{resultados.map((auto) => (
								<button key={auto.id} className="nueva-publicacion-drawer__resultado" onClick={() => handleElegirAuto(auto)}>
									<img
										src={(Array.isArray(auto.img) ? auto.img : [])[0] || ""}
										alt=""
										className="nueva-publicacion-drawer__resultado-foto"
									/>
									<div className="nueva-publicacion-drawer__resultado-info">
										<span className="nueva-publicacion-drawer__resultado-nombre">
											{auto.marca} {auto.modelo} ({auto.anio})
										</span>
										<span className="nueva-publicacion-drawer__resultado-precio">
											{auto.moneda} {auto.precio}
										</span>
									</div>
								</button>
							))}
						</div>
					</div>
				) : (
					<div className="nueva-publicacion-drawer__body">
						<div className="nueva-publicacion-drawer__auto-elegido">
							{autoSeleccionado.marca} {autoSeleccionado.modelo} ({autoSeleccionado.anio})
						</div>

						<div className="nueva-publicacion-drawer__field">
							<label className="nueva-publicacion-drawer__label">Título</label>
							<input
								className="nueva-publicacion-drawer__input"
								value={titulo}
								onChange={(e) => setTitulo(e.target.value)}
							/>
						</div>

						<div className="nueva-publicacion-drawer__field">
							<label className="nueva-publicacion-drawer__label">Tipo de publicación</label>
							<select
								className="nueva-publicacion-drawer__input"
								value={listingType}
								onChange={(e) => setListingType(e.target.value)}
							>
								<option value="silver">Plata{cupo ? ` (${cupo.silver} disponibles este mes)` : ""}</option>
								<option value="gold">Oro{cupo ? ` (${cupo.gold} disponibles este mes)` : ""}</option>
							</select>
							{cupo && cupo[listingType === "gold" ? "gold" : "silver"] <= 0 && (
								<p className="nueva-publicacion-drawer__hint" style={{ color: "#ff6b6b" }}>
									Llegaste al límite de este tipo de publicación este mes en MercadoLibre.
								</p>
							)}
						</div>

						<div className="nueva-publicacion-drawer__field">
							<label className="nueva-publicacion-drawer__label">Descripción</label>
							<textarea
								className="nueva-publicacion-drawer__textarea"
								value={descripcion}
								onChange={(e) => setDescripcion(e.target.value)}
								rows={14}
							/>
						</div>

						{error && <p className="nueva-publicacion-drawer__error">{error}</p>}
					</div>
				)}

				<div className="nueva-publicacion-drawer__footer">
					{paso === "confirmar" ? (
						<>
							<button className="nueva-publicacion-drawer__btn nueva-publicacion-drawer__btn--primary" onClick={handlePublicar} disabled={loading}>
								{loading ? <span className="nueva-publicacion-drawer__spinner" /> : null}
								{loading ? "Publicando…" : "Publicar en MercadoLibre"}
							</button>
							<button className="nueva-publicacion-drawer__btn nueva-publicacion-drawer__btn--secondary" onClick={handleVolver} disabled={loading}>
								{autoInicial ? "Omitir por ahora" : "Volver a buscar"}
							</button>
						</>
					) : (
						<button className="nueva-publicacion-drawer__btn nueva-publicacion-drawer__btn--secondary" onClick={onClose}>
							Cancelar
						</button>
					)}
				</div>
			</div>
		</Drawer>
	);
};

export default NuevaPublicacionDrawer;
