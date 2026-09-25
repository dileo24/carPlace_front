import React from "react";
import "./StockCard.css";
import { getEstado, titleCase } from "../../../../constants/crmStock";
import { formatearLista } from "../../../../data/filters";

export default function StockCard({ auto, onOpen, animDelay = 0, esAdmin, enML = false }) {
	const imagen = auto.img?.[0] || null;
	const estadoObj = getEstado(auto.estado || "disponible");
	const estados = [estadoObj];
	const tareas = auto.tareasAlistaje || [];
	const tareasHechas = tareas.filter((t) => t.hecha).length;
	const progresoAlistaje = tareas.length > 0 ? Math.round((tareasHechas / tareas.length) * 100) : 0;

	return (
		<div className={`stock-card${auto.en_alistaje ? " stock-card--alistaje" : ""}`} style={{ animationDelay: `${animDelay}ms` }}>
			{/* ── Imagen ── */}
			<div className="stock-card__img-wrap" onClick={() => onOpen(auto)}>
				{imagen ? (
					<img className="stock-card__img" src={imagen} alt={`${auto.marca} ${auto.modelo}`} loading="lazy" />
				) : (
					<div className="stock-card__img-placeholder">
						<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
							<rect x="2" y="9" width="28" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
							<path d="M8 9l3-5h10l3 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
							<circle cx="9" cy="22" r="2" stroke="currentColor" strokeWidth="1.5" />
							<circle cx="23" cy="22" r="2" stroke="currentColor" strokeWidth="1.5" />
						</svg>
					</div>
				)}

				{/* Chips de estado */}
				<div className="stock-card__estados">
					{estados.map((e) => (
						<span key={e.id} className="stock-card__estado-chip" style={{ "--chip-color": e.color }}>
							{e.label}
						</span>
					))}

					{/* ── Chip de tipo ── */}
					{auto.tipo &&
						(() => {
							const TIPO_MAP = {
								patrimonio: { label: "Agencia", color: "#cc0000" },
								consignacion: { label: "Consignación", color: "#f0a500" },
								consignacion_online: { label: "Online", color: "#22bac5" },
							};
							const t = TIPO_MAP[auto.tipo];
							return t ? (
								<span className="stock-card__estado-chip" style={{ "--chip-color": t.color }}>
									{t.label}
								</span>
							) : null;
						})()}

					{/* ── Chip de propietario (solo admin, para distinguir los autos del socio) ── */}
					{esAdmin &&
						auto.propietario &&
						auto.propietario !== "agencia" &&
						(() => {
							const PROPIETARIO_MAP = {
								socio: { label: "Socio", color: "#7c4dff" },
								compartido: { label: "Compartido 50/50", color: "#ff9800" },
							};
							const p = PROPIETARIO_MAP[auto.propietario];
							return p ? (
								<span className="stock-card__estado-chip" style={{ "--chip-color": p.color }}>
									{p.label}
								</span>
							) : null;
						})()}
				</div>

				{/* Badges de la esquina superior derecha — en columna para que nunca se pisen */}
				<div className="stock-card__top-right-badges">
					{auto.tipo === "patrimonio" && esAdmin && (
						<span className="stock-card__patrimonio-badge" title="Vehículo propio">
							P
						</span>
					)}
					{enML && (
						<span className="stock-card__ml-badge" title="Publicado en MercadoLibre">
							ML
						</span>
					)}
				</div>

				{/* Badge oferta */}
				{auto.oferta && <span className="stock-card__oferta-badge">Oferta</span>}
				{/* Badge alistaje */}
				{auto.en_alistaje && <span className="stock-card__alistaje-badge">Alistaje</span>}
			</div>

			{/* ── Info ── */}
			<div className="stock-card__body" onClick={() => onOpen(auto)}>
				<p className="stock-card__marca">{titleCase(auto.marca)}</p>
				<p className="stock-card__modelo">{auto.modelo}</p>

				<div className="stock-card__specs">
					<span>{auto.anio}</span>
					<span className="stock-card__spec-sep">·</span>
					<span>{auto.km} km</span>
					<span className="stock-card__spec-sep">·</span>
					<span title={formatearLista(auto.transmision)}>{formatearLista(auto.transmision)}</span>
				</div>

				<div className="stock-card__precio-wrap">
					{auto.oferta && auto.precio_oferta ? (
						<>
							<span className="stock-card__precio-tachado">
								{auto.moneda} {auto.precio}
							</span>
							<span className="stock-card__precio-oferta">
								{auto.moneda} {auto.precio_oferta}
							</span>
						</>
					) : (
						<span className="stock-card__precio">
							{auto.moneda} {auto.precio}
						</span>
					)}
				</div>

				{/* Barra progreso alistaje */}
				{auto.en_alistaje && tareas.length > 0 && (
					<div className="stock-card__alistaje-bar">
						<div className="stock-card__alistaje-track">
							<div className="stock-card__alistaje-fill" style={{ width: `${progresoAlistaje}%` }} />
						</div>
						<span className="stock-card__alistaje-pct">
							{tareasHechas}/{tareas.length}
						</span>
					</div>
				)}
			</div>

			{/* ── Footer — solo Ver detalle ── */}
			<div className="stock-card__footer">
				<button className="stock-card__ver-btn" onClick={() => onOpen(auto)}>
					Ver detalle
				</button>
			</div>
		</div>
	);
}
