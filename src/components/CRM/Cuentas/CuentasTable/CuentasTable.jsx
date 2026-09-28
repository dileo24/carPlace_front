import React from "react";
import "./CuentasTable.css";

const formatMonto = (n) => Number(n).toLocaleString("es-AR");

const formatFecha = (f) => {
	if (!f) return "—";
	const [y, m, d] = f.split("-");
	return `${d}/${m}/${y}`;
};

const CuentasTable = ({ deudas, loading, error, confirmDeleteId, onDeleteRequest, onDeleteConfirm, onDeleteCancel }) => {
	if (loading) {
		return (
			<div className="cuentas-table__state">
				<span className="cuentas-table__spinner" />
				<span className="cuentas-table__state-text">Cargando cuentas…</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="cuentas-table__state cuentas-table__state--error">
				<svg viewBox="0 0 20 20" fill="none" className="cuentas-table__state-icon">
					<circle cx="10" cy="10" r="8.5" stroke="#cc0000" strokeWidth="1.5" />
					<path d="M10 6v5M10 13.5v.5" stroke="#cc0000" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<span className="cuentas-table__state-text">{error}</span>
			</div>
		);
	}

	if (deudas.length === 0) {
		return (
			<div className="cuentas-table__state">
				<span className="cuentas-table__state-text">No hay deudas cargadas todavía.</span>
			</div>
		);
	}

	return (
		<div className="cuentas-table__scroll">
			<table className="cuentas-table">
				<thead>
					<tr className="cuentas-table__head-row">
						<th className="cuentas-table__th">Fecha</th>
						<th className="cuentas-table__th">Motivo</th>
						<th className="cuentas-table__th">Detalle</th>
						<th className="cuentas-table__th cuentas-table__th--monto">Monto</th>
						<th className="cuentas-table__th cuentas-table__th--actions">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{deudas.map((d, i) => (
						<tr key={d.id} className="cuentas-table__row" style={{ animationDelay: `${i * 35}ms` }}>
							<td className="cuentas-table__td">{formatFecha(d.fecha)}</td>
							<td className="cuentas-table__td cuentas-table__td--motivo">{d.motivo}</td>
							<td className="cuentas-table__td cuentas-table__td--detalle">
								{/* Convención pedida por el cliente: rojo = quien debe, verde = a quien le deben. */}
								<span className="cuentas-table__nombre-debe">{d.deudorNombre}</span>
								<span className="cuentas-table__flecha">→</span>
								<span className="cuentas-table__nombre-recibe">{d.acreedorNombre}</span>
							</td>
							<td className="cuentas-table__td cuentas-table__td--monto">
								{d.moneda} {formatMonto(d.monto)}
							</td>
								<td className="cuentas-table__td cuentas-table__td--actions">
								{confirmDeleteId === d.id ? (
									<div className="cuentas-table__confirm">
										<span className="cuentas-table__confirm-label">¿Eliminar?</span>
										<button className="cuentas-table__btn cuentas-table__btn--confirm" onClick={() => onDeleteConfirm(d.id)}>
											Sí
										</button>
										<button className="cuentas-table__btn cuentas-table__btn--cancel" onClick={onDeleteCancel}>
											No
										</button>
									</div>
								) : (
									<div className="cuentas-table__actions">
										<button className="cuentas-table__btn cuentas-table__btn--delete" onClick={() => onDeleteRequest(d.id)}>
											Eliminar
										</button>
									</div>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default CuentasTable;
