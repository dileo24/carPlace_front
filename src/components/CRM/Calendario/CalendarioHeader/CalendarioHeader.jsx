// components/CRM/Calendario/CalendarioHeader/CalendarioHeader.jsx
import React from "react";
import { motion } from "framer-motion";
import "./CalendarioHeader.css";
import { mesNombre } from "../../../../constants/crmCalendario";

export default function CalendarioHeader({
	year,
	month,
	onPrev,
	onNext,
	usuarioFiltro,
	onUsuarioFiltro,
	usuarios, // [{ id, name }] — viene de Calendario.jsx
	onNuevaCita,
	totalCitas,
	citasConfirmadas,
	citasPendientes,
}) {
	return (
		<div className="cal-header">
			{/* ── Fila 1: navegación + botón nuevo evento ── */}
			<div className="cal-header__top">
				<div className="cal-header__nav">
					<button className="cal-header__nav-btn" onClick={onPrev} aria-label="Mes anterior">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>

					<h2 className="cal-header__title">
						{mesNombre(month)} <span className="cal-header__year">{year}</span>
					</h2>

					<button className="cal-header__nav-btn" onClick={onNext} aria-label="Mes siguiente">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				</div>

				<motion.button className="cal-header__nueva-btn" onClick={onNuevaCita} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
					</svg>
					<span className="cal-header__nueva-btn-text">Nuevo evento</span>
				</motion.button>
			</div>

			{/* ── Fila 2: filtro usuarios + métricas ── */}
			<div className="cal-header__bottom">
				{/* Pills de usuarios — solo visibles para admin */}
				{usuarios?.length > 0 && (
					<div className="cal-header__asesores">
						<button
							className={`cal-header__asesor-pill${usuarioFiltro === "todos" ? " cal-header__asesor-pill--active" : ""}`}
							onClick={() => onUsuarioFiltro("todos")}
						>
							Todos
						</button>
						{usuarios.map((u) => (
							<button
								key={u.id}
								className={`cal-header__asesor-pill${usuarioFiltro === u.id ? " cal-header__asesor-pill--active" : ""}`}
								onClick={() => onUsuarioFiltro(u.id)}
							>
								{u.name}
							</button>
						))}
					</div>
				)}

				{/* Métricas */}
				<div className="cal-header__metricas">
					<div className="cal-header__metrica">
						<span className="cal-header__metrica-valor">{totalCitas}</span>
						<span className="cal-header__metrica-label">eventos</span>
					</div>
					<div className="cal-header__metrica-sep" />
					<div className="cal-header__metrica">
						<span className="cal-header__metrica-valor cal-header__metrica-valor--green">{citasConfirmadas}</span>
						<span className="cal-header__metrica-label">confirmados</span>
					</div>
					<div className="cal-header__metrica-sep" />
					<div className="cal-header__metrica">
						<span className="cal-header__metrica-valor cal-header__metrica-valor--yellow">{citasPendientes}</span>
						<span className="cal-header__metrica-label">pendientes</span>
					</div>
				</div>
			</div>
		</div>
	);
}
