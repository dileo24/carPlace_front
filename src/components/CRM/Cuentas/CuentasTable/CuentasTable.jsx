import React from "react";
import "./CuentasTable.css";

const formatMonto = (n) => Number(n).toLocaleString("es-AR");

const formatFecha = (f) => {
	if (!f) return "—";
	const [y, m, d] = String(f).slice(0, 10).split("-");
	return `${d}/${m}/${y}`;
};

const TIPO_LABEL = { interna: "Interna", empresa: "Empresa", prestamo: "Préstamo" };

const CuentasTable = ({ deudas, loading, error, currentUserId, onSaldar }) => {
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
				<span className="cuentas-table__state-text">No hay cuentas que coincidan con los filtros.</span>
			</div>
		);
	}

	const esMio = (id) => currentUserId != null && id != null && Number(id) === Number(currentUserId);

	return (
		<div className="cuentas-table__scroll">
			<table className="cuentas-table">
				<thead>
					<tr className="cuentas-table__head-row">
						<th className="cuentas-table__th">Fecha</th>
						<th className="cuentas-table__th">Motivo</th>
						<th className="cuentas-table__th">Quién debe</th>
						<th className="cuentas-table__th">A quién le debe</th>
						<th className="cuentas-table__th cuentas-table__th--monto">Monto</th>
						<th className="cuentas-table__th cuentas-table__th--actions">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{deudas.map((d, i) => {
						const parcial = !d.saldada && Number(d.montoSaldado) > 0;
						const pagos = Array.isArray(d.pagos) ? d.pagos : [];
						const yoDebo = esMio(d.deudorId) && !d.deudorEmpresa;
						const meDeben = esMio(d.acreedorId) && !d.acreedorEmpresa;
						return (
							<tr
								key={d.id}
								className={`cuentas-table__row${d.saldada ? " cuentas-table__row--saldada" : ""}`}
								style={{ animationDelay: `${i * 35}ms` }}
							>
								<td className="cuentas-table__td">{formatFecha(d.fecha)}</td>
								<td className="cuentas-table__td cuentas-table__td--motivo">
									<div className="cuentas-table__motivo-line">
										<span className={`cuentas-table__tipo cuentas-table__tipo--${d.tipo}`}>{TIPO_LABEL[d.tipo] || d.tipo}</span>
										<span className="cuentas-table__motivo-text">{d.motivo}</span>
									</div>
									{pagos.length > 0 && (
										<ul className="cuentas-table__pagos">
											{pagos.map((p, idx) => (
												<li key={idx} className="cuentas-table__pago">
													{formatFecha(p.fecha)} · {d.moneda} {formatMonto(p.monto)}
													{p.metodo ? ` · ${p.metodo}` : ""}
													{p.comentario ? ` · "${p.comentario}"` : ""}
												</li>
											))}
										</ul>
									)}
								</td>
								<td className="cuentas-table__td cuentas-table__td--detalle">
									<span className="cuentas-table__nombre-debe">{d.deudorNombre}</span>
									{yoDebo && <span className="cuentas-table__chip cuentas-table__chip--debo">Vos debés</span>}
								</td>
								<td className="cuentas-table__td cuentas-table__td--detalle">
									<span className="cuentas-table__nombre-recibe">{d.acreedorNombre}</span>
									{meDeben && <span className="cuentas-table__chip cuentas-table__chip--me-deben">Te deben a vos</span>}
								</td>
								<td className="cuentas-table__td cuentas-table__td--monto">
									<div>
										{d.moneda} {formatMonto(d.monto)}
									</div>
									{parcial && (
										<div className="cuentas-table__pendiente">
											Pendiente: {d.moneda} {formatMonto(d.pendiente)}
										</div>
									)}
								</td>
								<td className="cuentas-table__td cuentas-table__td--actions">
									{d.saldada ? (
										<span className="cuentas-table__badge-saldada">Saldada {formatFecha(d.saldadaEn)}</span>
									) : (
										<div className="cuentas-table__actions">
											<button className="cuentas-table__btn cuentas-table__btn--saldar" onClick={() => onSaldar(d)}>
												Saldar
											</button>
										</div>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default CuentasTable;
