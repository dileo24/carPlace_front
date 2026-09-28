import React from "react";
import "./CuentasHeader.css";

const formatMonto = (n) => Math.abs(n).toLocaleString("es-AR");

// Convención pedida por el cliente: rojo = debe, verde = le deben.
const CuentasHeader = ({ total, miSaldo, onNuevo }) => {
	const monedas = ["ARS", "USD"].filter((m) => (miSaldo?.[m] ?? 0) !== 0);

	return (
		<div className="cuentas-header">
			<div className="cuentas-header__left">
				<h1 className="cuentas-header__title">Cuentas</h1>
				<span className="cuentas-header__meta">
					(<span className="cuentas-header__metric">{total}</span>)
				</span>
			</div>

			<div className="cuentas-header__right">
				<div className="cuentas-header__saldos">
					{monedas.length === 0 ? (
						<span className="cuentas-header__saldo cuentas-header__saldo--neutral">Todo saldado</span>
					) : (
						monedas.map((m) => {
							const valor = miSaldo[m];
							const debo = valor < 0;
							return (
								<span
									key={m}
									className={`cuentas-header__saldo ${debo ? "cuentas-header__saldo--debo" : "cuentas-header__saldo--me-deben"}`}
								>
									{debo ? "Debés" : "Te deben"} {m} {formatMonto(valor)}
								</span>
							);
						})
					)}
				</div>

				<button className="cuentas-header__btn-nuevo" onClick={onNuevo}>
					<svg viewBox="0 0 16 16" fill="none" className="cuentas-header__btn-icon">
						<path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
					</svg>
					Nueva deuda
				</button>
			</div>
		</div>
	);
};

export default CuentasHeader;
