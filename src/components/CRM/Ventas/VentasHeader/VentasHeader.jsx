import React from "react";
import "./VentasHeader.css";

export default function VentasHeader({ ventas, busqueda, onBusqueda, ordenAsc, onToggleOrden, onNuevaVenta, puedeCrear = true }) {
	// ventas ya viene filtrado por el mes visible (ventasDelMes)
	const total = ventas.length;
	const conUsado = ventas.filter((v) => v.recibioPago).length;

	return (
		<div className="ventas-header">
			<div className="ventas-header__top">
				<span className="ventas-header__title">Ventas</span>

				<div className="ventas-header__metrics">
					<div className="ventas-metric">
						<span className="ventas-metric__label">Ventas del mes</span>
						<span className="ventas-metric__value">{total}</span>
					</div>
					<div className="ventas-metric">
						<span className="ventas-metric__label">Con toma de usado</span>
						<span className="ventas-metric__value ventas-metric__value--accent">{conUsado}</span>
					</div>
				</div>
			</div>

			<div className="ventas-header__controls">
				<input
					className="ventas-search"
					type="text"
					placeholder="Buscar por cliente o vehículo..."
					value={busqueda}
					onChange={(e) => onBusqueda(e.target.value)}
				/>

				<button
					className={`ventas-sort-btn${ordenAsc ? " ventas-sort-btn--active" : ""}`}
					onClick={onToggleOrden}
					title={ordenAsc ? "Más antigua primero" : "Más reciente primero"}
				>
					{ordenAsc ? "↑" : "↓"} Fecha
				</button>

				{puedeCrear && (
					<button className="ventas-nueva-btn" onClick={onNuevaVenta}>
						+ Nueva venta
					</button>
				)}
			</div>
		</div>
	);
}
