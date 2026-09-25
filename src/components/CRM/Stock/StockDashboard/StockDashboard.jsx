// components/CRM/Stock/StockDashboard/StockDashboard.jsx
import React, { useEffect, useState } from "react";
import "./StockDashboard.css";

export default function StockDashboard({ autos, esVendedor }) {
	const totalStock = autos.length;
	const disponibles = autos.filter((a) => a.estado === "disponible").length;
	const señados = autos.filter((a) => a.estado === "senado").length;
	const noDisponibles = autos.filter((a) => a.estado === "no_disponible").length;
	const enAlistaje = autos.filter((a) => a.en_alistaje).length;
	const patrimonio = autos.filter((a) => a.tipo === "patrimonio");

	const [dolarBlue, setDolarBlue] = useState(null);

	useEffect(() => {
		fetch("https://api.bluelytics.com.ar/v2/latest")
			.then((r) => r.json())
			.then((d) => setDolarBlue(d.blue.value_sell))
			.catch(() => setDolarBlue(1));
	}, []);

	const valorPatrimonio = patrimonio.reduce((acc, a) => {
		const raw = String(a.precio || "0").replace(/\./g, "");
		const base = parseFloat(raw) || 0;
		const enPesos = a.moneda === "U$D" ? base * (dolarBlue ?? 0) : base;
		return acc + enPesos;
	}, 0);

	return (
		<div className="stock-dashboard">
			{/* ── Inventario ── */}
			<div className="stock-dashboard__group">
				<p className="stock-dashboard__group-label">Inventario</p>
				<div className="stock-dashboard__metrics">
					<Metric valor={totalStock} label="en stock" />
					<MetricSep />
					<Metric valor={disponibles} label="disponibles" color="#4caf50" />
					<MetricSep />
					<Metric valor={señados} label="señados" color="#ffc107" />
					<MetricSep />
					<Metric valor={enAlistaje} label="en alistaje" color="#6495ed" />
					{/* No disponibles: solo si hay alguno (admin/supervisor ya los ven) */}
					{noDisponibles > 0 && (
						<>
							<MetricSep />
							<Metric valor={noDisponibles} label="no disponibles" color="#6b7280" />
						</>
					)}
				</div>
			</div>

			{!esVendedor && (
				<>
					<div className="stock-dashboard__divider" />
					<div className="stock-dashboard__group">
						<p className="stock-dashboard__group-label">Patrimonio propio</p>
						<div className="stock-dashboard__metrics">
							<Metric valor={patrimonio.length} label="unidades" />
							<MetricSep />
							<div className="stock-dashboard__metric">
								<span className="stock-dashboard__metric-valor stock-dashboard__metric-valor--lg">
									AR$ {formatMillones(valorPatrimonio)}
								</span>
								<span className="stock-dashboard__metric-label">valor estimado</span>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

function Metric({ valor, label, color }) {
	return (
		<div className="stock-dashboard__metric">
			<span className="stock-dashboard__metric-valor" style={color ? { color } : undefined}>
				{valor}
			</span>
			<span className="stock-dashboard__metric-label">{label}</span>
		</div>
	);
}

function MetricSep() {
	return <div className="stock-dashboard__metric-sep" />;
}

function formatMillones(n) {
	if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
	return n.toLocaleString("es-AR");
}
