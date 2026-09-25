import React, { useEffect, useState, useRef } from "react";
import "./Catalogo.css";
import Card from "../../components/Card/Card";
import { getAutos } from "../../services/autos.service";
import { Typography, Box, useMediaQuery, CircularProgress, FormControl, Select, MenuItem, Button } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import Pagination from "../../components/Pagination/Pagination";
import Filtros from "../../components/Filtros/Filtros";
import { useFiltros } from "../../context/FiltrosContext";
import { ordenamientos } from "../../data/filters";
import HeroCatalogo from "../../components/HeroCatalogo/HeroCatalogo";
import { useOpcionesDisponibles } from "../../hooks/useOpcionesDisponibles";
import { useMarcas } from "../../hooks/useMarcas";

export default function Catalogo() {
	// Si venimos de "Volver al catálogo"/back desde el detalle de un auto,
	// Card.jsx dejó guardada la página y el scroll en los que estaba (ver
	// handleClick ahí). Se lee UNA sola vez acá (no en un useEffect, para
	// tener el valor ya listo antes del primer render) y se borra de
	// inmediato — una visita nueva al catálogo nunca debe reusar esto.
	const restoreRef = useRef(undefined);
	if (restoreRef.current === undefined) {
		try {
			const raw = sessionStorage.getItem("catalogoRestore");
			restoreRef.current = raw ? JSON.parse(raw) : null;
			if (raw) sessionStorage.removeItem("catalogoRestore");
		} catch (_) {
			restoreRef.current = null;
		}
	}

	const [filteredAutos, setFilteredAutos] = useState([]);
	const [currentPage, setCurrentPage] = useState(restoreRef.current?.page || 1);
	const [isLoading, setIsLoading] = useState(true);
	const [dolarBlue, setDolarBlue] = useState(null);
	const [showFilters, setShowFilters] = useState(true);
	const [todosLosAutos, setTodosLosAutos] = useState([]);

	const itemsPerPage = 12;
	const isMobile = useMediaQuery("(max-width:600px)");
	const { filtros, setFiltros } = useFiltros();

	const isFirstMount = useRef(true);
	const fetchDebounce = useRef(null);
	// El fetch inicial (más abajo) siempre resetea currentPage a 1 cuando
	// cambian los filtros — pero si estamos restaurando, ese primer fetch NO
	// debe pisar la página restaurada. Se salta solo esa primera vez.
	const saltearResetPaginaRef = useRef(!!restoreRef.current);

	useEffect(() => {
		if (!restoreRef.current) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, []);

	// Una vez que cargaron los autos de la página restaurada, lleva el scroll
	// exactamente a donde estaba (después de que el grid ya se pintó).
	useEffect(() => {
		if (!isLoading && restoreRef.current) {
			const { scrollY } = restoreRef.current;
			restoreRef.current = null; // se restaura una sola vez
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					window.scrollTo({ top: scrollY, behavior: "auto" });
				});
			});
		}
	}, [isLoading]);

	// ── 1. Dólar blue ──────────────────────────────────────────
	useEffect(() => {
		fetch("https://api.bluelytics.com.ar/v2/latest")
			.then((r) => r.json())
			.then((d) => setDolarBlue(d.blue.value_sell))
			.catch(() => setDolarBlue(1));
	}, []);

	// ── 2. Restaurar filtros guardados ─────────────────────────
	useEffect(() => {
		try {
			const saved = localStorage.getItem("catalogoFilters");
			if (saved) {
				const parsed = JSON.parse(saved);
				// Sanitizar valores que podrían ser inválidos
				const sanitized = {
					...parsed,
					anioDesde: parsed.anioDesde && parsed.anioDesde !== "0" ? parsed.anioDesde : "",
					anioHasta: parsed.anioHasta && parsed.anioHasta !== "0" ? parsed.anioHasta : "",
				};
				setFiltros(sanitized);
			}
		} catch (_) {
			localStorage.removeItem("catalogoFilters");
		}
	}, []);

	// ── 3. Fetch con debounce cada vez que cambian filtros ─────
	useEffect(() => {
		if (dolarBlue === null) return;

		if (isFirstMount.current) {
			isFirstMount.current = false;
			fetchDebounce.current = setTimeout(() => fetchAutos(filtros), 50);
			return;
		}

		clearTimeout(fetchDebounce.current);
		fetchDebounce.current = setTimeout(() => fetchAutos(filtros), 300);

		return () => clearTimeout(fetchDebounce.current);
	}, [filtros, dolarBlue]);

	useEffect(() => {
		if (dolarBlue === null) return;
		getAutos({ visible: true, orderBy: "orden_aleatorio", orderDir: "ASC" }).then((data) => {
			if (data?.resp) setTodosLosAutos(data.resp);
		});
	}, [dolarBlue]);
	const { marcas: marcasCatalogo } = useMarcas();
	const opciones = useOpcionesDisponibles(todosLosAutos, dolarBlue, marcasCatalogo);

	const fetchAutos = async (filtrosActuales) => {
		try {
			setIsLoading(true);
			const data = await getAutos({ ...filtrosActuales, visible: true, orderBy: "orden_aleatorio", orderDir: "ASC" });

			if (data?.resp) {
				let autos = data.resp;

				if (filtrosActuales.ordenamiento === "precio-asc" || filtrosActuales.ordenamiento === "precio-desc") {
					const getPrecio = (auto) => {
						const raw = String(auto.oferta ? auto.precio_oferta : auto.precio).replace(/\./g, "");
						const base = parseInt(raw, 10) || 0;
						return auto.moneda === "U$D" ? base * dolarBlue : base;
					};
					autos = [...autos].sort((a, b) => {
						const diff = getPrecio(a) - getPrecio(b);
						return filtrosActuales.ordenamiento === "precio-asc" ? diff : -diff;
					});
				}

				setFilteredAutos(autos);
				if (saltearResetPaginaRef.current) {
					saltearResetPaginaRef.current = false;
				} else {
					setCurrentPage(1);
				}
				localStorage.setItem("catalogoFilters", JSON.stringify(filtrosActuales));
			}
		} catch (err) {
			console.error("Error al obtener autos:", err);
		} finally {
			setIsLoading(false);
		}
	};

	// ── 4. Sincronizar showFilters con isMobile ────────────────
	useEffect(() => {
		setShowFilters(!isMobile);
	}, [isMobile]);

	const totalPages = Math.ceil(filteredAutos.length / itemsPerPage);
	const currentAutos = filteredAutos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	return (
		<>
			<HeroCatalogo />

			<Box
				sx={{
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					backgroundColor: "#f5f5f5",
					pt: 3,
					px: { xs: 2, md: 3 },
					pb: 4,
				}}
			>
				<Box className="catalogo-toolbar">
					{!isMobile && (
						<Button
							variant="contained"
							onClick={() => setShowFilters((prev) => !prev)}
							startIcon={<TuneIcon />}
							className={`btn-toggle-filters ${showFilters ? "active" : ""}`}
						>
							{showFilters ? "Ocultar filtros" : "Filtros"}
						</Button>
					)}

					{/* Search — ahora usa filtros.searchText en lugar de estado local */}
					<Box className="search-wrapper">
						<SearchIcon className="search-icon" />
						<input
							className="search-input"
							placeholder="Buscar marca o modelo..."
							value={filtros.searchText || ""}
							onChange={(e) => setFiltros((prev) => ({ ...prev, searchText: e.target.value }))}
						/>
					</Box>

					<FormControl size="small">
						<Select
							value={filtros.ordenamiento || ""}
							onChange={(e) => setFiltros((prev) => ({ ...prev, ordenamiento: e.target.value }))}
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

				{!isLoading && (
					<Box className="results-count" translate="no">
						<span className="results-number">{filteredAutos.length}</span> vehículos encontrados
					</Box>
				)}

				<Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>
					{(isMobile || showFilters) && (
						<Box className="sidebar-filtros" sx={{ width: { xs: "100%", md: 350 }, flexShrink: 0 }}>
							<Box sx={{ position: { md: "sticky" }, top: 90 }}>
								<Filtros opciones={opciones} marcasCatalogo={marcasCatalogo} />
							</Box>
						</Box>
					)}

					<Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }} className="cards-grid">
						{isLoading ? (
							<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
								<CircularProgress size={48} sx={{ color: "#cc0000" }} />
							</Box>
						) : filteredAutos.length === 0 ? (
							<Box sx={{ textAlign: "center", mt: 8 }}>
								<DirectionsCarIcon sx={{ fontSize: 56, color: "#ccc" }} />
								<Typography sx={{ mt: 2, color: "#888", fontFamily: "'Barlow', sans-serif" }}>
									No hay vehículos disponibles con esos filtros.
								</Typography>
							</Box>
						) : (
							<>
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: {
											xs: "repeat(1, 1fr)",
											sm: "repeat(2, 1fr)",
											md: showFilters ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
											lg: showFilters ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
										},
										gap: 2.5,
									}}
								>
									{currentAutos.map((auto) => (
										<Card key={auto.id} auto={auto} currentPage={currentPage} />
									))}
								</Box>
								<Box sx={{ mt: 4 }}>
									<Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
								</Box>
							</>
						)}
					</Box>
				</Box>
			</Box>
		</>
	);
}
