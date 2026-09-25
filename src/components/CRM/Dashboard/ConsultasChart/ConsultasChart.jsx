import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./ConsultasChart.css";

const TooltipConsultas = ({ active, payload, label }) => {
	if (!active || !payload?.length) return null;
	return (
		<div className="consultas-chart__tooltip">
			<span className="consultas-chart__tooltip-label">Semana del {label}</span>
			<span className="consultas-chart__tooltip-value" style={{ color: "#cc0000" }}>
				{payload[0].value} consultas
			</span>
		</div>
	);
};

const TooltipVentas = ({ active, payload, label }) => {
	if (!active || !payload?.length) return null;
	return (
		<div className="consultas-chart__tooltip">
			<span className="consultas-chart__tooltip-label">{label}</span>
			<span className="consultas-chart__tooltip-value" style={{ color: "#22c55e" }}>
				{payload[0].value} {payload[0].value === 1 ? "venta" : "ventas"} este mes
			</span>
		</div>
	);
};

const axisY = { fill: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "Barlow, sans-serif" };
const axisX = { fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "Barlow, sans-serif" };

export default function ConsultasChart({ datosConsultas = [], datosVentas = [] }) {
	return (
		<div className="consultas-chart__wrap" style={{ overflow: "hidden" }}>
			{/* ── Consultas ── */}
			<div className="consultas-chart__bloque">
				<div className="consultas-chart__bloque-label" style={{ color: "#cc0000" }}>
					<span className="consultas-chart__bloque-dot" style={{ background: "#cc0000" }} />
					Consultas por semana
				</div>
				<ResponsiveContainer width="100%" height={110}>
					<AreaChart data={datosConsultas} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
						<defs>
							<linearGradient id="gradConsultas" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#cc0000" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#cc0000" stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis dataKey="dia" tick={axisX} axisLine={false} tickLine={false} />
						<YAxis tick={axisY} axisLine={false} tickLine={false} />
						<Tooltip content={<TooltipConsultas />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
						<Area
							type="monotone"
							dataKey="consultas"
							stroke="#cc0000"
							strokeWidth={2}
							fill="url(#gradConsultas)"
							dot={{ fill: "#cc0000", r: 3, strokeWidth: 0 }}
							activeDot={{ r: 5, fill: "#ff2222" }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<div className="consultas-chart__divisor" />

			{/* ── Ventas cerradas ── */}
			<div className="consultas-chart__bloque">
				<div className="consultas-chart__bloque-label" style={{ color: "#22c55e" }}>
					<span className="consultas-chart__bloque-dot" style={{ background: "#22c55e" }} />
					Ventas por mes
				</div>
				<ResponsiveContainer width="100%" height={110}>
					<AreaChart data={datosVentas} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
						<defs>
							<linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
								<stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis dataKey="semana" tick={axisX} axisLine={false} tickLine={false} />
						<YAxis tick={axisY} axisLine={false} tickLine={false} />
						<Tooltip content={<TooltipVentas />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
						<Area
							type="monotone"
							dataKey="ventas"
							stroke="#22c55e"
							strokeWidth={2}
							fill="url(#gradVentas)"
							dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
							activeDot={{ r: 5, fill: "#4ade80" }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
