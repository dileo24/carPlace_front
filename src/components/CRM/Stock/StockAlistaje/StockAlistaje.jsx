// components/CRM/Stock/StockAlistaje/StockAlistaje.jsx
import React from "react";
import "./StockAlistaje.css";
import { titleCase } from "../../../../constants/crmStock";

export default function StockAlistaje({ autos, onOpen, onToggleTarea }) {
	const enAlistaje = autos.filter((a) => a.en_alistaje);

	if (enAlistaje.length === 0) {
		return (
			<div className="stock-alistaje__empty">
				<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
					<rect x="3" y="3" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" />
					<path d="M10 13h16M10 19h12M10 25h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<p>No hay vehículos en alistaje</p>
				<span>
					Usá el botón <strong>Alistar</strong> en cualquier tarjeta del stock
				</span>
			</div>
		);
	}

	return (
		<div className="stock-alistaje">
			<div className="stock-alistaje__header">
				<p className="stock-alistaje__title">Alistaje</p>
				<span className="stock-alistaje__count">{enAlistaje.length} vehículos en preparación</span>
			</div>

			<div className="stock-alistaje__list">
				{enAlistaje.map((auto, idx) => {
					const tareas = auto.tareasAlistaje || [];
					const hechas = tareas.filter((t) => t.hecha).length;
					const progreso = tareas.length > 0 ? Math.round((hechas / tareas.length) * 100) : 0;
					const imagen = auto.img?.[0];

					return (
						<div key={auto.id} className="stock-alistaje__row" style={{ animationDelay: `${idx * 50}ms` }}>
							{/* Miniatura */}
							<div className="stock-alistaje__thumb" onClick={() => onOpen(auto)}>
								{imagen ? <img src={imagen} alt={auto.modelo} /> : <div className="stock-alistaje__thumb-placeholder" />}
							</div>

							{/* Info */}
							<div className="stock-alistaje__info" onClick={() => onOpen(auto)}>
								<p className="stock-alistaje__modelo">
									{titleCase(auto.marca)} <span>{auto.modelo}</span>
								</p>
								<p className="stock-alistaje__specs">
									{auto.anio} · {auto.km} km
								</p>

								{/* Barra progreso */}
								<div className="stock-alistaje__bar-wrap">
									<div className="stock-alistaje__bar-track">
										<div className="stock-alistaje__bar-fill" style={{ width: `${progreso}%` }} />
									</div>
									<span className="stock-alistaje__bar-pct">
										{hechas}/{tareas.length}
									</span>
								</div>
							</div>

							{/* Tareas */}
							<div className="stock-alistaje__tareas">
								{tareas.length === 0 ? (
									<p className="stock-alistaje__sin-tareas">Sin tareas — abrí el auto para agregar</p>
								) : (
									tareas.map((t) => (
										<div
											key={t.id}
											className={`stock-alistaje__tarea${t.hecha ? " stock-alistaje__tarea--hecha" : ""}`}
											onClick={() => onToggleTarea(auto.id, t.id)}
										>
											<span className="stock-alistaje__tarea-check">
												{t.hecha && (
													<svg width="8" height="8" viewBox="0 0 10 10" fill="none">
														<path
															d="M1.5 5l2.5 2.5L8.5 2"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												)}
											</span>
											<span className="stock-alistaje__tarea-texto">{t.texto}</span>
										</div>
									))
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
