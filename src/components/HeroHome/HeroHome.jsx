import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFiltros } from "../../context/FiltrosContext";
import { categoria } from "../../data/filters";
import { FormControl, MenuItem, Select } from "@mui/material";
import "./HeroHome.css";

const FEATURES = [
	{
		title: "Vehículos\nSeleccionados",
		desc: "Unidades revisadas y garantizadas.",
		icon: (
			<svg
				className="feature-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
				<polyline points="9 12 11 14 15 10" />
			</svg>
		),
	},
	{
		title: "Tomamos tu usado\nen parte de pago",
		desc: "Cotización inmediata y sin compromiso.",
		icon: (
			<svg
				className="feature-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points="17 1 21 5 17 9" />
				<path d="M3 11V9a4 4 0 0 1 4-4h14" />
				<polyline points="7 23 3 19 7 15" />
				<path d="M21 13v2a4 4 0 0 1-4 4H3" />
			</svg>
		),
	},
	{
		title: "Financiación\na medida",
		desc: "Planes adaptados a tus necesidades.",
		icon: (
			<svg
				className="feature-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<line x1="19" y1="5" x2="5" y2="19" />
				<circle cx="6.5" cy="6.5" r="2.5" />
				<circle cx="17.5" cy="17.5" r="2.5" />
			</svg>
		),
	},
	{
		title: "Gestión\nIntegral",
		desc: "Nos encargamos de todo el trámite.",
		icon: (
			<svg
				className="feature-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
				<line x1="16" y1="13" x2="8" y2="13" />
				<line x1="16" y1="17" x2="8" y2="17" />
				<polyline points="10 9 9 9 8 9" />
			</svg>
		),
	},
];

export default function HeroHome({ autos = [], loading }) {
	const navigate = useNavigate();
	const { setFiltros } = useFiltros();

	const [searchText, setSearchText] = useState("");  // era "marca"
	const [anio, setAnio] = useState("");
	const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 80);
		return () => clearTimeout(t);
	}, []);

	const aniosDisponibles = React.useMemo(() => {
		if (!autos.length) return [];
		const years = autos.map((a) => a.anio).filter(Boolean);

		return [...new Set(years)].sort((a, b) => b - a).map((y) => ({ value: y, label: y }));
	}, [autos]);


const handleBuscar = () => {
    localStorage.removeItem("catalogoFilters");
    setFiltros((prev) => ({
        ...prev,
        searchText: searchText,
        anioDesde: anio || "",
        anioHasta: anio || "",
        categoria: categoriaSeleccionada,
    }));
    navigate("/catalogo");
};

	const renderSelect = (value, setValue, placeholder, options) => (
		<FormControl variant="standard" fullWidth>
			<Select
				value={value}
				onChange={(e) => setValue(e.target.value)}
				displayEmpty
				disableUnderline
				sx={{
					fontFamily: "Barlow, sans-serif",
					fontSize: "0.95rem",
					fontWeight: 500,
					color: "rgba(255,255,255,0.82)",
					"& .MuiSelect-icon": { color: "rgba(255,255,255,0.35)" },
					transition: "color 0.2s",
				}}
				renderValue={(selected) => {
					if (!selected) return <span style={{ color: "rgba(255,255,255,0.32)" }}>{placeholder}</span>;
					const opt = options.find((o) => o.value === selected);
					return opt?.label || selected;
				}}
			>
				<MenuItem value="">
					<em>{placeholder}</em>
				</MenuItem>
				{options.map((o) => (
					<MenuItem key={o.value} value={o.value}>
						{o.label}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);

	return (
		<>
			<div className={`hero-root ${mounted ? "hero-mounted" : ""}`}>
				{/* Fondo */}
				<div className="hero-bg" />
				<div className="hero-overlay" />

				{/* Layout */}
				<div className="hero-inner">
					{/* ── COLUMNA IZQUIERDA: texto + métricas ── */}
					<div className="hero-left">
						<div className="hero-badge">
							<span className="hero-badge-dot" />
							CONCESIONARIA MULTIMARCA
						</div>

						<h1 className="hero-title">
							<span className="hero-title-line l1">Excelencia</span>
							<span className="hero-title-line l2">en cada</span>
							<span className="hero-title-line l3 red">elección.</span>
						</h1>

						<div className="hero-underline" />

						<p className="hero-sub">
							Vehículos seleccionados, atención personalizada
							<br />y las mejores oportunidades para vos.
						</p>

						<div className="hero-stats">
							{[
								{ num: "+70", label: "Vehículos" },
								{ num: "100%", label: "Financiación con DNI" },
								{ num: "+10", label: "Marcas disponibles" },
							].map((s, i) => (
								<div key={i} className="hero-stat" style={{ animationDelay: `${0.9 + i * 0.15}s` }}>
									<span className="hero-stat-num">{s.num}</span>
									<span className="hero-stat-label">{s.label}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* ── BUSCADOR ABAJO ── */}
				<div className="hero-search-bottom">
					<div className="buscador-card">
						<p className="buscador-title">
							Encontrá tu <span className="buscador-title-accent">próximo auto</span>
						</p>

						<div className="buscador-grid">
							<div className="buscador-field">
								<label className="buscador-field-label">Marca o modelo</label>
								<input className="buscador-input" placeholder="Ej: Toyota Hilux" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
							</div>

							<div className="buscador-field">
								<label className="buscador-field-label">Año</label>
								{renderSelect(anio, setAnio, loading ? "Cargando..." : "Seleccionar", aniosDisponibles)}
							</div>

							<div className="buscador-field">
								<label className="buscador-field-label">Categoría</label>
								{renderSelect(categoriaSeleccionada, setCategoriaSeleccionada, "Seleccionar", categoria)}
							</div>

							<button className="buscador-btn" onClick={handleBuscar}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="11" cy="11" r="8" />
									<line x1="21" y1="21" x2="16.65" y2="16.65" />
								</svg>
								BUSCAR
							</button>
						</div>
					</div>
				</div>

				{/* Scroll hint */}
				<div className="hero-scroll">
					<div className="hero-scroll-line" />
					<span>SCROLL</span>
				</div>
			</div>

			{/* ── FEATURES SECTION ── */}
			<div className="features-section">
				{FEATURES.map((f, i) => (
					<div className="feature-card" key={i} style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
						{f.icon}
						<p className="feature-title">{f.title}</p>
						<p className="feature-desc">{f.desc}</p>
					</div>
				))}
			</div>
		</>
	);
}
