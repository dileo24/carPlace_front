// components/CRM/Stock/StockFilters/StockFilters.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./StockFilters.css";
import { ESTADOS_STOCK, CONDICION_OPCIONES, TIPOS_OPCIONES } from "../../../../constants/crmStock";

// Pills de estado: excluir "vendido" siempre; excluir "no_disponible" si no tiene permiso
function buildFiltrosEstado(puedeVerNoDisp) {
	const base = [{ id: "todos", label: "Todos", color: null }];
	const estados = ESTADOS_STOCK.filter((e) => {
		if (e.id === "vendido") return false;
		if (e.id === "no_disponible" && !puedeVerNoDisp) return false;
		return true;
	});
	return [...base, ...estados];
}

export default function StockFilters({
	filtroEstado,
	onFiltroEstado,
	vistaAlistaje,
	onToggleAlistaje,
	busqueda,
	onBusqueda,
	totalFiltrados,
	esVendedor,
	esAdmin,
	esPublicVend,
	filtroCondicion,
	onFiltroCondicion,
	filtroTipo,
	onFiltroTipo,
	puedeVerNoDisp = false,
}) {
	const navigate = useNavigate();
	const FILTROS_ESTADO = buildFiltrosEstado(puedeVerNoDisp);

	return (
		<div className="stock-filters">
			{/* ── Fila 1: búsqueda + acciones ── */}
			<div className="stock-filters__top">
				<div className="stock-filters__search">
					<svg className="stock-filters__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
						<circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
						<path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					<input
						className="stock-filters__search-input"
						type="text"
						placeholder="Buscar marca, modelo, patente…"
						value={busqueda}
						onChange={(e) => onBusqueda(e.target.value)}
					/>
					{busqueda && (
						<button className="stock-filters__search-clear" onClick={() => onBusqueda("")}>
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
								<path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>
					)}
				</div>

				<div className="stock-filters__select-group">
					<span className="stock-filters__select-label">Condición</span>
					<select className="stock-filters__select" value={filtroCondicion} onChange={(e) => onFiltroCondicion(e.target.value)}>
						<option value="">Todas</option>
						{CONDICION_OPCIONES.map((o) => (
							<option key={o.id} value={o.id}>
								{o.label}
							</option>
						))}
					</select>
				</div>

				<motion.button
					className={`stock-filters__alistaje-btn${vistaAlistaje ? " stock-filters__alistaje-btn--active" : ""}`}
					onClick={onToggleAlistaje}
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.97 }}
				>
					<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
						<path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
					</svg>
					{vistaAlistaje ? "Ver todo el stock" : "Alistaje"}
				</motion.button>

				{(esAdmin || esPublicVend) && (
					<motion.button
						className="stock-filters__nuevo-btn"
						onClick={() => navigate("/nuevo_auto")}
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
					>
						<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
							<path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						</svg>
						Nuevo auto
					</motion.button>
				)}
			</div>

			{/* ── Fila 2: pills de estado + pills de tipo ── */}
			{!vistaAlistaje && (
				<div className="stock-filters__bottom">
					<div className="stock-filters__estados">
						{FILTROS_ESTADO.map((e) => (
							<button
								key={e.id}
								className={`stock-filters__estado-pill${filtroEstado === e.id ? " stock-filters__estado-pill--active" : ""}`}
								style={filtroEstado === e.id && e.color ? { "--pill-color": e.color } : {}}
								onClick={() => onFiltroEstado(e.id)}
							>
								{e.color && <span className="stock-filters__estado-dot" style={{ background: e.color }} />}
								{e.label}
							</button>
						))}
					</div>

					{!esVendedor && <div className="stock-filters__separator" />}

					{!esVendedor && (
						<div className="stock-filters__estados">
							<button
								className={`stock-filters__estado-pill${filtroTipo === "" ? " stock-filters__estado-pill--active" : ""}`}
								onClick={() => onFiltroTipo("")}
							>
								Todos
							</button>
							{TIPOS_OPCIONES.map((o) => (
								<button
									key={o.id}
									className={`stock-filters__estado-pill${filtroTipo === o.id ? " stock-filters__estado-pill--active" : ""}`}
									onClick={() => onFiltroTipo(o.id)}
								>
									{o.label}
								</button>
							))}
						</div>
					)}

					<span className="stock-filters__count" style={{ marginLeft: "auto" }}>
						{totalFiltrados} unidades
					</span>
				</div>
			)}
		</div>
	);
}
