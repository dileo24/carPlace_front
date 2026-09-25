import React, { useEffect, useState, useRef } from "react";
import Card from "../../components/Card/Card";
import { getAutos } from "../../services/autos.service";
import { Typography, Box, CircularProgress, TextField, FormControl, Select, MenuItem } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { ordenamientos } from "../../data/filters";
import "../Catalogo/Catalogo.css";
import SearchIcon from "@mui/icons-material/Search";
import HeroReventas from "../../components/HeroReventas/HeroReventas";

export default function Reventas() {
	const [autos, setAutos] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [dolarBlue, setDolarBlue] = useState(null);
	const [search, setSearch] = useState("");
	const [ordenamiento, setOrdenamiento] = useState("");

	const isFirstMount = useRef(true);
	const fetchDebounce = useRef(null);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	// ── 1. Dólar blue ──────────────────────────────────────────
	useEffect(() => {
		fetch("https://api.bluelytics.com.ar/v2/latest")
			.then((r) => r.json())
			.then((d) => setDolarBlue(d.blue.value_sell))
			.catch(() => setDolarBlue(1));
	}, []);

	// ── 2. Fetch con debounce cada vez que cambian filtros ─────
	useEffect(() => {
		if (dolarBlue === null) return;

		if (isFirstMount.current) {
			isFirstMount.current = false;
			fetchDebounce.current = setTimeout(() => fetchAutos(search, ordenamiento), 50);
			return;
		}

		clearTimeout(fetchDebounce.current);
		fetchDebounce.current = setTimeout(() => fetchAutos(search, ordenamiento), 300);

		return () => clearTimeout(fetchDebounce.current);
	}, [search, ordenamiento, dolarBlue]);

	const fetchAutos = async (searchActual, ordenamientoActual) => {
		try {
			setIsLoading(true);

			const params = { oferta_reventa: true, searchText: searchActual };

			if (ordenamientoActual && ordenamientoActual !== "precio-asc" && ordenamientoActual !== "precio-desc") {
				const [col, dir] = ordenamientoActual.split("-");
				params.orderBy = col;
				params.orderDir = dir;
			} else if (!ordenamientoActual) {
				params.orderBy = "marca";
				params.orderDir = "ASC";
			}

			const data = await getAutos(params);

			if (data?.resp) {
				let resultado = data.resp;

				if (ordenamientoActual === "precio-asc" || ordenamientoActual === "precio-desc") {
					const getPrecio = (auto) => {
						const raw = String(auto.oferta ? auto.precio_oferta : auto.precio).replace(/\./g, "");
						const base = parseInt(raw, 10) || 0;
						return auto.moneda === "U$D" ? base * dolarBlue : base;
					};
					resultado = [...resultado].sort((a, b) => {
						const diff = getPrecio(a) - getPrecio(b);
						return ordenamientoActual === "precio-asc" ? diff : -diff;
					});
				}

				setAutos(resultado);
			}
		} catch (err) {
			console.error("Error al obtener autos:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<HeroReventas />
			<Box sx={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: "#f5f5f5", pt: 3, px: { xs: 2, md: 3 }, pb: 4 }}>
				<Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
					<Box className="search-wrapper" sx={{ flex: 1 }}>
						<SearchIcon className="search-icon" />
						<input
							className="search-input"
							placeholder="Buscar marca o modelo..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</Box>

					<FormControl size="small">
						<Select
							value={ordenamiento}
							onChange={(e) => setOrdenamiento(e.target.value)}
							displayEmpty
							renderValue={(selected) => {
								if (!selected) return <span translate="no">Sin orden</span>;
								return <span translate="no">{ordenamientos.find((o) => o.value === selected)?.label || selected}</span>;
							}}
							sx={{
								width: { xs: "100%", sm: "200px", md: "180px", lg: "220px" },
								fontFamily: "Barlow, sans-serif",
								fontSize: "14px",
								color: "#111",
								background: "#fff",
								borderRadius: "8px",
								"& .MuiSelect-select": { padding: "10px 40px 10px 16px", display: "flex", alignItems: "center" },
								"& .MuiOutlinedInput-notchedOutline": { border: "2px solid #e0e0e0" },
								"&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#cc0000", boxShadow: "0 0 0 3px rgba(204, 0, 0, 0.1)" },
								"& .MuiSelect-icon": { color: "#aaa", right: 12 },
							}}
						>
							<MenuItem value="">
								<span translate="no">Sin orden</span>
							</MenuItem>
							{ordenamientos.map((o) => (
								<MenuItem key={o.value} value={o.value}>
									<span translate="no">{o.label}</span>
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
				{isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
						<CircularProgress size={48} sx={{ color: "#cc0000" }} />
					</Box>
				) : autos.length === 0 ? (
					<Box sx={{ textAlign: "center", mt: 8 }}>
						<DirectionsCarIcon sx={{ fontSize: 56, color: "#ccc" }} />
						<Typography sx={{ mt: 2, color: "#888", fontFamily: "'Barlow', sans-serif" }}>
							No hay vehículos en reventa disponibles.
						</Typography>
					</Box>
				) : (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
							gap: 2.5,
						}}
					>
						{autos.map((auto) => (
							<Card key={auto.id} auto={auto} />
						))}
					</Box>
				)}
			</Box>
		</>
	);
}
