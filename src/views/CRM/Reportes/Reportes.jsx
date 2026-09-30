// views/CRM/Reportes/Reportes.jsx
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	AreaChart,
	Area,
	Cell,
	PieChart,
	Pie,
	LineChart,
	Line,
	CartesianGrid,
} from "recharts";
import "./Reportes.css";
import { LoadingState, ErrorState } from "../../../components/CRM/PageState/PageState";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Tooltip personalizado ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, suffix = "" }) => {
	if (!active || !payload?.length) return null;
	return (
		<div className="rep-tooltip">
			<span className="rep-tooltip__label">{label}</span>
			{payload.map((p) => (
				<span key={p.dataKey} className="rep-tooltip__val" style={{ color: p.color || "#cc0000" }}>
					{p.name}: {p.value}
					{suffix}
				</span>
			))}
		</div>
	);
};

function Panel({ title, subtitle, children, full }) {
	return (
		<div className={`rep-panel${full ? " rep-panel--full" : ""}`}>
			<div className="rep-panel__head">
				<span className="rep-panel__title">{title}</span>
				{subtitle && <span className="rep-panel__sub">{subtitle}</span>}
			</div>
			{children}
		</div>
	);
}

function Stat({ label, value, color, small }) {
	return (
		<div className="rep-stat">
			<span className="rep-stat__val" style={color ? { color } : {}}>
				{value}
			</span>
			<span className={`rep-stat__label${small ? " rep-stat__label--sm" : ""}`}>{label}</span>
		</div>
	);
}

function Vacio({ texto }) {
	return (
		<p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontStyle: "italic", padding: "16px 0", textAlign: "center" }}>{texto}</p>
	);
}

function pct(de, a) {
	if (!de) return 0;
	return Math.round((a / de) * 100);
}

function formatDiasStock(dias) {
	if (dias < 30) return `${dias} día${dias === 1 ? "" : "s"}`;

	const anios = Math.floor(dias / 365);
	const mesesRestantes = Math.floor((dias % 365) / 30);

	if (anios === 0) {
		return `${mesesRestantes} mes${mesesRestantes === 1 ? "" : "es"}`;
	}
	if (mesesRestantes === 0) {
		return `${anios} año${anios === 1 ? "" : "s"}`;
	}
	return `${anios} año${anios === 1 ? "" : "s"} y ${mesesRestantes} mes${mesesRestantes === 1 ? "" : "es"}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Reportes() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [mounted, setMounted] = useState(false);

	const [periodo, setPeriodo] = useState("mes");
	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 60);
		return () => clearTimeout(t);
	}, []);
	useEffect(() => {
		let cancelado = false;
		setLoading(true);
		setError(null);
		axios
			.get(`${API_URL}/reportes`, { params: { periodo } })
			.then((r) => r.data)
			.then((d) => {
				if (cancelado) return;
				if (d.status === 200) {
					setData(d.resp);
				} else setError("Error al cargar los reportes.");
			})
			.catch(() => {
				if (!cancelado) setError("No se pudo conectar con el servidor.");
			})
			.finally(() => {
				if (!cancelado) setLoading(false);
			});
		return () => {
			cancelado = true;
		};
	}, [periodo]);
	const origenTotales = useMemo(() => {
		if (!data?.origenSerie?.length) return [];
		const totales = {};
		data.origenSerie.forEach((row) => {
			Object.entries(row).forEach(([key, val]) => {
				if (key === "label") return;
				totales[key] = (totales[key] || 0) + (val || 0);
			});
		});
		return Object.entries(totales)
			.map(([canal, cantidad]) => ({ canal, cantidad }))
			.filter((o) => o.cantidad > 0)
			.sort((a, b) => b.cantidad - a.cantidad);
	}, [data?.origenSerie]);

	// Cambiar de período no desmonta la vista: solo el primer load muestra el loader a pantalla completa.
	if (!data && loading) return <LoadingState mensaje="Cargando reportes…" />;

	if (error) return <ErrorState mensaje={error} onRetry={() => window.location.reload()} />;

	if (!data) return null;

	const esSemana = periodo === "semana";
	const T = esSemana
		? {
				actual: "Esta semana",
				anterior: "Semana anterior",
				ventasTitulo: "Ventas por semana",
				ventasSub: "Unidades cerradas · últimas 8 semanas",
				ventasVacio: "Todavía no hay ventas registradas en las últimas semanas.",
				nota: "Barra punteada = semana en curso (proyección)",
				gananciaTotal: "Total (8 semanas)",
				evolucion: "Evolución semanal",
				evolucionCanal: "Evolución semanal por canal",
				usadosSerie: "Por semana",
			}
		: {
				actual: "Este mes",
				anterior: "Mes anterior",
				ventasTitulo: "Ventas por mes",
				ventasSub: `Unidades cerradas ${new Date().getFullYear()}`,
				ventasVacio: "Todavía no hay ventas registradas este año.",
				nota: "Barra punteada = mes en curso (proyección)",
				gananciaTotal: "Total (6 meses)",
				evolucion: "Evolución mensual",
				evolucionCanal: "Evolución mensual por canal",
				usadosSerie: "Por mes",
			};

	const {
		embudoEtapas,
		tiempoPorEtapa,
		ventasHistoricas,
			proyeccion,
		periodoActual,
		periodoAnterior,
		gananciaTotal,
		gananciaSerie = [],
		ventasPorAsesor,
		origenSerie,
		conversionPorCanal,
		stockItems,
		stockResumen,
		ventasConUsadoCount,
		totalVentasValidas,
			usadosSerie,
		botSerie,
		botActual,
	} = data;

	// El socio no recibe embudo/performance de asesores/orígenes/bot (ver
	// getReportes.js) — esas secciones directamente no se renderizan.
	const embudoConPct = (embudoEtapas ?? []).map((etapa, i) => {
		const anterior = i === 0 ? null : embudoEtapas[i - 1];
		const porcentaje = anterior ? pct(anterior.cantidad, etapa.cantidad) : 100;
		return { ...etapa, pct: porcentaje };
	});

	// Asesores con tasa
	const asesoresConTasa = (ventasPorAsesor ?? []).map((a) => ({
		...a,
		nombre: a.nombre.split(" ")[0],
		tasa: pct(a.consultasAsignadas, a.ventasCerradas),
	}));

	// Origen: totales para el donut
	const CANAL_COLORS = {
		WhatsApp: "#25d366",
		Instagram: "#e1306c",
		Web: "#64b5f6",
		Facebook: "#4267b2",
		Teléfono: "#8bc34a",
		Presencial: "#ffc107",
		Referido: "#ce93d8",
		Otro: "#aaaaaa",
	};

	const variacionVentas = (periodoActual?.unidades ?? 0) - (periodoAnterior?.unidades ?? 0);
	const tasaDerivacion = pct(botActual?.iniciadas, botActual?.derivadas);
	const tasaAbandono = pct(botActual?.iniciadas, botActual?.abandonadas);

	// Lunes de la semana en curso, hora Argentina (UTC-3) leída con getters UTC.
	const hoyAR = new Date(Date.now() - 3 * 3600000);
	const lunesAR = new Date(Date.UTC(hoyAR.getUTCFullYear(), hoyAR.getUTCMonth(), hoyAR.getUTCDate() - ((hoyAR.getUTCDay() + 6) % 7)));
	const subtitulo = esSemana
		? `Análisis de rendimiento · semana del ${lunesAR.getUTCDate()}/${lunesAR.getUTCMonth() + 1}`
		: `Análisis de rendimiento · ${new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`;

	return (
		<div className={`rep-view${mounted ? " rep-view--mounted" : ""}${loading ? " rep-view--loading" : ""}`}>
			<div className="rep-header">
					<div>
					<h1 className="rep-title">Reportes</h1>
					<p className="rep-subtitle">{subtitulo}</p>
				</div>
				<div className="rep-periodo" role="group" aria-label="Período">
					{[
						{ key: "semana", label: "Semana" },
						{ key: "mes", label: "Mes" },
					].map((p) => (
						<button
							key={p.key}
							type="button"
							className={`rep-periodo__btn${periodo === p.key ? " rep-periodo__btn--activo" : ""}`}
							aria-pressed={periodo === p.key}
							onClick={() => setPeriodo(p.key)}
						>
							{p.label}
						</button>
					))}
				</div>
			</div>

			<div className="rep-grid">
				{/* ══ 1. EMBUDO (no aplica para el socio) ══ */}
				{embudoEtapas && (
					<Panel title="Embudo de conversión" subtitle="Acumulado histórico" full>
						{embudoConPct.length === 0 ? (
							<Vacio texto="Todavía no hay consultas registradas." />
						) : (
							<>
								<div className="rep-embudo">
									{embudoConPct.map((etapa, i) => (
										<div key={etapa.key} className="rep-embudo__etapa">
											{i > 0 && (
												<div className="rep-embudo__flecha">
													<span className="rep-embudo__pct-badge" style={{ color: etapa.color }}>
														{etapa.pct}%
													</span>
													<svg viewBox="0 0 12 20" fill="none" width="12" height="20">
														<path d="M2 2l8 8-8 8" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
													</svg>
												</div>
											)}
											<div className="rep-embudo__bloque" style={{ borderColor: etapa.color + "44" }}>
												<span className="rep-embudo__cantidad" style={{ color: etapa.color }}>
													{etapa.cantidad}
												</span>
												<span className="rep-embudo__label">{etapa.label}</span>
											</div>
										</div>
									))}
								</div>
								<div className="rep-embudo__tiempos">
									<p className="rep-embudo__tiempos-titulo">Tiempo promedio estimado por etapa</p>
									<div className="rep-embudo__tiempos-lista">
										{(tiempoPorEtapa ?? []).map((t) => (
											<div key={t.key} className="rep-embudo__tiempo-item">
												<span className="rep-embudo__tiempo-label">{t.label}</span>
												<span className="rep-embudo__tiempo-dias">{t.dias} días</span>
											</div>
										))}
									</div>
								</div>
							</>
						)}
					</Panel>
				)}

				{/* ══ 2. VENTAS POR MES ══ */}
				<Panel title={T.ventasTitulo} subtitle={T.ventasSub}>
					<div className="rep-stats-row">
<Stat label={T.actual} value={periodoActual?.unidades ?? 0} color="#cc0000" />
					<Stat label={T.anterior} value={periodoAnterior?.unidades ?? 0} />
						<Stat
							label="Variación"
							value={`${variacionVentas > 0 ? "+" : ""}${variacionVentas}`}
							color={variacionVentas >= 0 ? "#22c55e" : "#cc0000"}
						/>
						<Stat label="Proyección" value={proyeccion} color="#f59e0b" />
					</div>
					{ventasHistoricas.length === 0 ? (
						<Vacio texto={T.ventasVacio} />
					) : (
						<>
							<ResponsiveContainer width="100%" height={160}>
<BarChart data={ventasHistoricas} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
								<XAxis
									dataKey="label"
										tick={{ fill: "#444", fontSize: 10, fontFamily: "Barlow, sans-serif" }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
									<Tooltip content={<CustomTooltip suffix=" unidades" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
									<Bar dataKey="unidades" name="Vendidos" radius={[4, 4, 0, 0]}>
										{ventasHistoricas.map((_, i) => (
											<Cell
												key={i}
												fill={i === ventasHistoricas.length - 1 ? "#cc000066" : "#cc0000"}
												stroke={i === ventasHistoricas.length - 1 ? "#cc0000" : "none"}
												strokeWidth={1}
												strokeDasharray={i === ventasHistoricas.length - 1 ? "4 2" : "0"}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
							<p className="rep-nota">{T.nota}</p>
						</>
					)}
				</Panel>

				{/* ══ 3. PERFORMANCE ASESOR (no aplica para el socio) ══ */}
				{ventasPorAsesor && (
					<Panel title="Performance por asesor" subtitle="Acumulado histórico">
						{asesoresConTasa.length === 0 ? (
							<Vacio texto="Todavía no hay consultas asignadas." />
						) : (
							<>
								<div className="rep-stats-row">
									<Stat label="Total consultas" value={ventasPorAsesor.reduce((a, x) => a + x.consultasAsignadas, 0)} />
									<Stat label="Cerradas" value={ventasPorAsesor.reduce((a, x) => a + x.ventasCerradas, 0)} color="#22c55e" />
								</div>
								<ResponsiveContainer width="100%" height={160}>
									<BarChart data={asesoresConTasa} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
										<XAxis type="number" tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
										<YAxis
											type="category"
											dataKey="nombre"
											tick={{ fill: "#888", fontSize: 11, fontFamily: "Barlow, sans-serif" }}
											axisLine={false}
											tickLine={false}
											width={55}
										/>
										<Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
										<Bar dataKey="consultasAsignadas" name="Consultas" fill="#686868" radius={[0, 4, 4, 0]} />
										<Bar dataKey="ventasCerradas" name="Cerradas" fill="#22c55e" radius={[0, 4, 4, 0]} />
									</BarChart>
								</ResponsiveContainer>
								<div className="rep-asesor-tabla">
									<div className="rep-asesor-tabla__head">
										<span>Asesor</span>
										<span>Consultas</span>
										<span>Cerradas</span>
										<span>Conversión</span>
									</div>
									{ventasPorAsesor.map((a, i) => (
										<div key={i} className="rep-asesor-tabla__row">
											<span>{a.nombre.split(" ")[0]}</span>
											<span>{a.consultasAsignadas}</span>
											<span style={{ color: "#22c55e" }}>{a.ventasCerradas}</span>
											<span style={{ color: "#cc0000" }}>{pct(a.consultasAsignadas, a.ventasCerradas)}%</span>
										</div>
									))}
								</div>
							</>
						)}
					</Panel>
				)}

				{/* ══ 4. ORIGEN (no aplica para el socio) ══ */}
				{origenSerie && (
				<Panel title="Origen de consultas" subtitle="Volumen y conversión por canal" full>
					{origenTotales.length === 0 ? (
						<Vacio texto="Todavía no hay consultas registradas." />
					) : (
						<>
							<div className="rep-dos-cols">
								<div>
									<p className="rep-sub-label">Volumen acumulado</p>
									<ResponsiveContainer width="100%" height={160}>
										<PieChart>
											<Pie
												data={origenTotales}
												dataKey="cantidad"
												nameKey="canal"
												cx="50%"
												cy="50%"
												innerRadius={40}
												outerRadius={65}
												paddingAngle={2}
											>
												{origenTotales.map((entry) => (
													<Cell key={entry.canal} fill={CANAL_COLORS[entry.canal] || "#888"} />
												))}
											</Pie>
											<Tooltip
												content={({ active, payload }) => {
													if (!active || !payload?.length) return null;
													const { name, value, payload: p } = payload[0];
													return (
														<div className="rep-tooltip">
															<span className="rep-tooltip__label">{name}</span>
															<span className="rep-tooltip__val" style={{ color: p.fill }}>
																{value} consultas
															</span>
														</div>
													);
												}}
											/>
										</PieChart>
									</ResponsiveContainer>
									<div className="rep-leyenda">
										{origenTotales.map((o) => (
											<div key={o.canal} className="rep-leyenda__item">
												<span className="rep-leyenda__dot" style={{ background: CANAL_COLORS[o.canal] || "#888" }} />
												<span>{o.canal}</span>
												<span className="rep-leyenda__val">{o.cantidad}</span>
											</div>
										))}
									</div>
								</div>
								<div>
									<p className="rep-sub-label">Tasa de conversión por canal</p>
									{conversionPorCanal.length === 0 ? (
										<Vacio texto="Sin datos de conversión aún." />
									) : (
										<div className="rep-conversion-lista">
											{conversionPorCanal.map((c) => (
												<div key={c.canal} className="rep-conversion__item">
													<span className="rep-conversion__canal">{c.canal}</span>
													<div className="rep-conversion__bar-track">
														<div className="rep-conversion__bar-fill" style={{ width: `${c.tasa}%`, background: c.color }} />
													</div>
													<span className="rep-conversion__tasa">{c.tasa}%</span>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
							<p className="rep-sub-label" style={{ marginTop: 16 }}>
								{T.evolucionCanal}
							</p>
							<ResponsiveContainer width="100%" height={120}>
<AreaChart data={origenSerie} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
								<XAxis dataKey="label" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
									<YAxis tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
									<Tooltip content={<CustomTooltip />} />
									{Object.entries(CANAL_COLORS).map(([canal, color]) => (
										<Area
											key={canal}
											type="monotone"
											dataKey={canal}
											name={canal}
											stroke={color}
											fill={color + "22"}
											strokeWidth={1.5}
											dot={false}
										/>
									))}
								</AreaChart>
							</ResponsiveContainer>
						</>
					)}
				</Panel>
				)}

				{/* ══ 5. TOMA DE USADOS ══ */}
				<Panel title="Toma de usados" subtitle="Vehículos recibidos como parte de pago">
					<div className="rep-stats-row">
						<Stat label="Con usado" value={ventasConUsadoCount} color="#f59e0b" />
						<Stat label="% del total" value={`${pct(totalVentasValidas, ventasConUsadoCount)}%`} color="#f59e0b" />
						<Stat label="Total registrados" value={totalVentasValidas} />
					</div>
					{ventasConUsadoCount === 0 ? (
						<Vacio texto="Todavía no hay ventas con usados registradas." />
					) : (
						<>
							<p className="rep-sub-label">{T.usadosSerie}</p>
							<ResponsiveContainer width="100%" height={160}>
								<BarChart data={usadosSerie} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
									<XAxis dataKey="label" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
									<YAxis tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
									<Tooltip content={<CustomTooltip suffix=" usados" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
									<Bar dataKey="cantidad" name="Recibidos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</>
					)}
				</Panel>

				{/* ══ 6. STOCK ══ */}
				<Panel title="Stock e inventario" subtitle="Estado y permanencia de unidades">
					<div className="rep-stats-row">
						<Stat label="Disponibles" value={stockResumen.disp} color="#4caf50" />
						<Stat label="Señados" value={stockResumen.sen} color="#ffc107" />
						<Stat label="Prom. días stock" value={stockResumen.promDias} />
						<Stat label="+180 días" value={stockResumen.criticos} color="#cc0000" />
					</div>
					{stockItems.length === 0 ? (
						<Vacio texto="Todavía no hay vehículos en stock." />
					) : (
						<div className="rep-stock-lista">
							<div className="rep-stock-lista__head">
								<span>Vehículo</span>
								<span>Estado</span>
								<span>Días en stock</span>
							</div>
							{stockItems.map((s, i) => (
								<div key={i} className={`rep-stock-lista__row${s.critico ? " rep-stock-lista__row--critico" : ""}`}>
									<span>
										{s.marca} {s.modelo}
										{s.anio ? ` ${s.anio}` : ""}
									</span>
									<span
										className={`rep-stock-lista__estado rep-stock-lista__estado--${(s.estado || "").replace("ñ", "n").replace(" ", "-")}`}
									>
										{s.estado || "disponible"}
									</span>
									<span className="rep-stock-lista__dias">
										{formatDiasStock(s.dias)}
										{s.critico && <span className="rep-stock-lista__alerta"> ⚠ +180d</span>}
									</span>
								</div>
							))}
						</div>
					)}
				</Panel>

				{/* ══ 7b. GANANCIA ══ */}
				<Panel title="Ganancia" subtitle="Precio de venta − gastos − precio de compra">
					<div className="rep-stats-row">
						<Stat label={T.gananciaTotal} value={`$${(gananciaTotal ?? 0).toLocaleString("es-AR")}`} color="#22c55e" />
					</div>
					{gananciaSerie.every((g) => g.total === 0) ? (
						<Vacio texto="Todavía no hay ventas con ganancia calculada (falta cargar precio de compra)." />
					) : (
						<ResponsiveContainer width="100%" height={140}>
<BarChart data={gananciaSerie} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
							<XAxis dataKey="label" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
								<YAxis tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
								<Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
								<Bar dataKey="total" name="Ganancia" fill="#22c55e" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					)}
				</Panel>

				{/* ══ 9. BOT (no aplica para el socio) ══ */}
				{botSerie && (
					<Panel title="Actividad del bot" subtitle="Conversaciones y derivaciones">
						<div className="rep-stats-row">
							<Stat label="Iniciadas" value={botActual?.iniciadas ?? 0} />
							<Stat label="Derivadas" value={botActual?.derivadas ?? 0} color="#3b82f6" />
							<Stat label="Sin derivar" value={botActual?.abandonadas ?? 0} color="#cc0000" />
							<Stat label="Tasa derivación" value={`${tasaDerivacion}%`} color="#3b82f6" />
							<Stat label="Sin derivar %" value={`${tasaAbandono}%`} color="#cc0000" />
						</div>
						{botSerie.every((b) => b.iniciadas === 0) ? (
							<Vacio texto="Todavía no hay conversaciones del bot registradas." />
						) : (
							<>
								<p className="rep-sub-label" style={{ marginTop: 12 }}>
									{T.evolucion}
								</p>
								<ResponsiveContainer width="100%" height={140}>
<LineChart data={botSerie} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
									<XAxis dataKey="label" tick={{ fill: "#444", fontSize: 10 }} axisLine={false} tickLine={false} />
										<YAxis tick={{ fill: "#333", fontSize: 10 }} axisLine={false} tickLine={false} />
										<CartesianGrid stroke="#1a1a1a" vertical={false} />
										<Tooltip content={<CustomTooltip />} />
										<Line type="monotone" dataKey="iniciadas" name="Iniciadas" stroke="#555" strokeWidth={1.5} dot={{ r: 3, fill: "#555" }} />
										<Line
											type="monotone"
											dataKey="derivadas"
											name="Derivadas"
											stroke="#3b82f6"
											strokeWidth={2}
											dot={{ r: 3, fill: "#3b82f6" }}
										/>
										<Line
											type="monotone"
											dataKey="abandonadas"
											name="Sin derivar"
											stroke="#cc0000"
											strokeWidth={1.5}
											dot={{ r: 3, fill: "#cc0000" }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</>
						)}
					</Panel>
				)}
			</div>
		</div>
	);
}
