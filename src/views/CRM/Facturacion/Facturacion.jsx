import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NuevoGastoDrawer from "../../../components/CRM/Facturacion/NuevoGastoDrawer/NuevoGastoDrawer";
import { getGastos, deleteGasto } from "../../../services/gastos.service";
import { getVentas } from "../../../services/ventas.service";
import { getCuentas } from "../../../services/cuentas.service";
import { LoadingState, ErrorState } from "../../../components/CRM/PageState/PageState";
import "./Facturacion.css";

function Panel({ title, subtitle, children, actions, full }) {
	return (
		<div className={`fact-panel${full ? " fact-panel--full" : ""}`}>
			<div className="fact-panel__head">
				<div>
					<span className="fact-panel__title">{title}</span>
					{subtitle && <span className="fact-panel__sub">{subtitle}</span>}
				</div>
				{actions}
			</div>
			{children}
		</div>
	);
}

function Stat({ label, value, color }) {
	return (
		<div className="fact-stat">
			<span className="fact-stat__val" style={color ? { color } : undefined}>
				{value}
			</span>
			<span className="fact-stat__label">{label}</span>
		</div>
	);
}

const formatMonto = (n) => Math.round(Math.abs(n)).toLocaleString("es-AR");
const formatFecha = (f) => {
	if (!f) return "—";
	const [y, m, d] = f.split("-");
	return `${d}/${m}/${y}`;
};
const mesActualISO = () => new Date().toISOString().slice(0, 7);
const esMesActual = (fechaISO) => fechaISO?.slice(0, 7) === mesActualISO();

export default function Facturacion() {
	const navigate = useNavigate();
	const [gastos, setGastos] = useState([]);
	const [ventas, setVentas] = useState([]);
	const [admins, setAdmins] = useState([]);
	const [saldos, setSaldos] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [nuevoGastoOpen, setNuevoGastoOpen] = useState(false);
	const [confirmDeleteId, setConfirmDeleteId] = useState(null);

	const cargar = async () => {
		setLoading(true);
		setError(null);
		try {
			const [gastosData, ventasData, cuentasData] = await Promise.all([getGastos(), getVentas(), getCuentas()]);
			setGastos(Array.isArray(gastosData?.resp) ? gastosData.resp : []);
			setVentas(Array.isArray(ventasData?.resp) ? ventasData.resp : []);
			setAdmins(Array.isArray(cuentasData?.resp?.admins) ? cuentasData.resp.admins : []);
			setSaldos(cuentasData?.resp?.saldos || {});
		} catch (err) {
			console.error("Error al cargar facturación:", err);
			setError("No se pudo cargar la información de facturación.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		cargar();
	}, []);

	const handleDeleteGasto = async (id) => {
		try {
			await deleteGasto(id);
			setConfirmDeleteId(null);
			cargar();
		} catch {
			setConfirmDeleteId(null);
		}
	};

	const { gananciaPorMoneda, gastosPorMoneda, balancePorMoneda, monedasActivas, ventasConGanancia } = useMemo(() => {
		const ganancia = { ARS: 0, USD: 0 };
		ventas.forEach((v) => {
			if (v.ganancia != null && esMesActual(v.fechaVenta)) {
				ganancia[v.moneda === "USD" ? "USD" : "ARS"] += v.ganancia;
			}
		});

		const gastosMes = { ARS: 0, USD: 0 };
		gastos.forEach((g) => {
			if (esMesActual(g.fecha)) {
				gastosMes[g.moneda === "USD" ? "USD" : "ARS"] += g.monto;
			}
		});

		const balance = { ARS: ganancia.ARS - gastosMes.ARS, USD: ganancia.USD - gastosMes.USD };
		const activas = ["ARS", "USD"].filter((m) => ganancia[m] !== 0 || gastosMes[m] !== 0);
		if (activas.length === 0) activas.push("ARS");

		const conGanancia = ventas
			.filter((v) => v.ganancia != null)
			.sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta));

		return { gananciaPorMoneda: ganancia, gastosPorMoneda: gastosMes, balancePorMoneda: balance, monedasActivas: activas, ventasConGanancia: conGanancia };
	}, [ventas, gastos]);

	if (loading) return <LoadingState mensaje="Cargando facturación…" />;
	if (error) return <ErrorState mensaje={error} onRetry={cargar} />;

	return (
		<div className="fact-view">
			<div className="fact-header">
				<h1 className="fact-title">Facturación</h1>
				<p className="fact-subtitle">Gastos del negocio, cuenta corriente entre socios y ganancia por auto vendido.</p>
			</div>

			<div className="fact-grid">
				{/* ── Balance del mes ── */}
				<Panel title="Balance del mes" subtitle="Ganancia por autos vendidos menos gastos del negocio" full>
					<div className="fact-balance-row">
						{monedasActivas.map((m) => (
							<div className="fact-balance-col" key={m}>
								<span className="fact-balance-moneda">{m}</span>
								<div className="fact-stats-row">
									<Stat label="Ganancia (autos)" value={`${m} ${formatMonto(gananciaPorMoneda[m])}`} color="#2ecc71" />
									<Stat label="Gastos" value={`${m} ${formatMonto(gastosPorMoneda[m])}`} color="#ff4d4d" />
									<Stat
										label="Balance"
										value={`${balancePorMoneda[m] < 0 ? "-" : ""}${m} ${formatMonto(balancePorMoneda[m])}`}
										color={balancePorMoneda[m] < 0 ? "#ff4d4d" : "#2ecc71"}
									/>
								</div>
							</div>
						))}
					</div>
				</Panel>

				{/* ── Cuentas entre socios ── */}
				<Panel
					title="Cuentas entre socios"
					subtitle="Saldo actual de cada admin"
					actions={
						<button className="fact-link-btn" onClick={() => navigate("/crm/cuentas")}>
							Ver detalle →
						</button>
					}
				>
					<div className="fact-cuentas-list">
						{admins.length === 0 && <p className="fact-vacio">Sin admins cargados.</p>}
						{admins.map((a) => {
							const saldo = saldos[a.id] || { ARS: 0, USD: 0 };
							const monedas = ["ARS", "USD"].filter((m) => saldo[m] !== 0);
							return (
								<div className="fact-cuenta-row" key={a.id}>
									<span className="fact-cuenta-nombre">{a.name || a.email}</span>
									<div className="fact-cuenta-saldos">
										{monedas.length === 0 ? (
											<span className="fact-cuenta-chip fact-cuenta-chip--neutral">Al día</span>
										) : (
											monedas.map((m) => {
												const debe = saldo[m] < 0;
												return (
													<span key={m} className={`fact-cuenta-chip ${debe ? "fact-cuenta-chip--debe" : "fact-cuenta-chip--recibe"}`}>
														{debe ? "Debe" : "Le deben"} {m} {formatMonto(saldo[m])}
													</span>
												);
											})
										)}
									</div>
								</div>
							);
						})}
					</div>
				</Panel>

				{/* ── Gastos del negocio ── */}
				<Panel
					title="Gastos del negocio"
					subtitle="Alquiler, sueldos, servicios y demás costos fijos"
					full
					actions={
						<button className="fact-btn-nuevo" onClick={() => setNuevoGastoOpen(true)}>
							<svg viewBox="0 0 16 16" fill="none" className="fact-btn-nuevo-icon">
								<path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
							</svg>
							Nuevo gasto
						</button>
					}
				>
					{gastos.length === 0 ? (
						<p className="fact-vacio">No hay gastos cargados todavía.</p>
					) : (
						<div className="fact-table__scroll">
							<table className="fact-table">
								<thead>
									<tr>
										<th>Fecha</th>
										<th>Categoría</th>
										<th>Descripción</th>
										<th className="fact-table__th--monto">Monto</th>
										<th className="fact-table__th--actions">Acciones</th>
									</tr>
								</thead>
								<tbody>
									{gastos.map((g) => (
										<tr key={g.id}>
											<td>{formatFecha(g.fecha)}</td>
											<td>{g.categoria}</td>
											<td className="fact-table__td--desc">{g.descripcion || "—"}</td>
											<td className="fact-table__td--monto">
												{g.moneda} {formatMonto(g.monto)}
											</td>
											<td className="fact-table__td--actions">
												{confirmDeleteId === g.id ? (
													<div className="fact-confirm">
														<span>¿Eliminar?</span>
														<button className="fact-table__btn fact-table__btn--confirm" onClick={() => handleDeleteGasto(g.id)}>
															Sí
														</button>
														<button className="fact-table__btn fact-table__btn--cancel" onClick={() => setConfirmDeleteId(null)}>
															No
														</button>
													</div>
												) : (
													<button className="fact-table__btn fact-table__btn--delete" onClick={() => setConfirmDeleteId(g.id)}>
														Eliminar
													</button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Panel>

				{/* ── Ganancia por auto ── */}
				<Panel title="Ganancia por auto" subtitle="Solo ventas con precio de compra cargado" full>
					{ventasConGanancia.length === 0 ? (
						<p className="fact-vacio">Todavía no hay ventas con ganancia calculada (falta cargar precio de compra en Stock).</p>
					) : (
						<div className="fact-table__scroll">
							<table className="fact-table">
								<thead>
									<tr>
										<th>Fecha</th>
										<th>Vehículo</th>
										<th className="fact-table__th--monto">Ganancia</th>
									</tr>
								</thead>
								<tbody>
									{ventasConGanancia.map((v) => (
										<tr key={v.id}>
											<td>{formatFecha(v.fechaVenta)}</td>
											<td>{v.vehiculoVendido}</td>
											<td className="fact-table__td--monto fact-table__td--ganancia">
												{v.moneda} {formatMonto(v.ganancia)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Panel>
			</div>

			<NuevoGastoDrawer
				open={nuevoGastoOpen}
				onClose={() => setNuevoGastoOpen(false)}
				onCreated={() => {
					setNuevoGastoOpen(false);
					cargar();
				}}
			/>
		</div>
	);
}
