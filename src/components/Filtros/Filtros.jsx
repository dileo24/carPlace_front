import React, { useState } from "react";
import {
	Box,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Typography,
	Paper,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	useMediaQuery,
	Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ClearIcon from "@mui/icons-material/Clear";
import { tiposCombustible, tiposTransmision, tiposTraccion, tiposColor, categoria, oferta } from "../../data/filters";
import { useFiltros, getFiltrosVacios } from "../../context/FiltrosContext";
import "./Filtros.css";
import RangeSlider from "../RangeSlider/RangeSlider";
import ColorSwatch from "../ColorSwatch/ColorSwatch";

const PRECIO_STEP = 500_000;
const KM_STEP = 5_000;

const Filtros = ({ opciones, marcasCatalogo = [] }) => {
	const isMobile = useMediaQuery("(max-width:600px)");
	const [expanded, setExpanded] = useState(!isMobile);

	const { filtros, setFiltros } = useFiltros();

	// ── Opciones dinámicas con fallback al catálogo completo de marcas ───────
	// (marcasCatalogo llega como prop desde Catalogo.jsx, que ya lo pide para
	// useOpcionesDisponibles — evita pedirlo dos veces con un useMarcas() propio)
	const marcas =
		opciones?.marcasDisponibles ??
		[{ value: "", label: "Todas las marcas" }, ...marcasCatalogo.map((m) => ({ value: m.nombre, label: m.nombre }))];
	const coloresDisponibles = opciones?.coloresDisponibles ?? tiposColor;
	const combustibles = opciones?.combustiblesDisponibles ?? tiposCombustible;
	const transmisiones = opciones?.transmisionesDisponibles ?? tiposTransmision;
	const categorias = opciones?.categoriasDisponibles ?? categoria;

	const precioMin = opciones?.precioMin ?? 0;
	const precioMax = opciones?.precioMax ?? 100_000_000;
	const kmMin = opciones?.kmMin ?? 0;
	const kmMax = opciones?.kmMax ?? 300_000;

	const anioMin = opciones?.anioMin ?? 2005;
	const anioMax = opciones?.anioMax ?? new Date().getFullYear();
	const years = Array.from({ length: anioMax - anioMin + 1 }, (_, i) => anioMin + i);

	const activeCount = Object.entries(filtros).filter(([k, v]) => k !== "ordenamiento" && v !== "" && v !== null && v !== undefined).length;
	const hasActiveFilters = activeCount > 0;

	const handleClearFilters = () => setFiltros(getFiltrosVacios());

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFiltros((prev) => ({ ...prev, [name]: value }));
	};

	const renderSelect = (name, label, options) => (
		<FormControl fullWidth>
			<InputLabel
				id={`${name}-label`}
				shrink
				sx={{
					position: "absolute",
					transform: "translate(14px, -9px) scale(0.75)",
					backgroundColor: "background.paper",
					px: 1,
					zIndex: 1,
					pointerEvents: "none",
				}}
			>
				{label}
			</InputLabel>
			<Select
				labelId={`${name}-label`}
				name={name}
				value={filtros[name] ?? ""}
				onChange={handleChange}
				label={label}
				MenuProps={{ disableScrollLock: true }}
				displayEmpty
				renderValue={(selected) => {
					if (selected === "") return <span style={{ color: "#757575" }}>Todas</span>;
					return options.find((o) => o.value === selected)?.label || selected;
				}}
			>
				{options.map((option) => (
					<MenuItem key={String(option.value)} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);

	const renderSection = (title, content, defaultExpanded = true) => (
		<Accordion defaultExpanded={defaultExpanded} sx={{ boxShadow: "none", "&:before": { display: "none" } }}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography
					sx={{ fontWeight: 700, fontSize: "13px", textTransform: "uppercase", fontFamily: "'Barlow', sans-serif", letterSpacing: "0.5px" }}
				>
					{title}
				</Typography>
			</AccordionSummary>
			<AccordionDetails sx={{ pt: 0 }}>{content}</AccordionDetails>
		</Accordion>
	);

	const renderFilters = () => (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			{renderSection("Marca", renderSelect("marca", "Marca", marcas))}

			{renderSection(
				"Año",
				<Box sx={{ display: "flex", gap: 1 }}>
					{renderSelect(
						"anioDesde",
						"Desde",
						years.map((y) => ({ value: y, label: y })),
					)}
					{renderSelect(
						"anioHasta",
						"Hasta",
						years.map((y) => ({ value: y, label: y })),
					)}
				</Box>,
			)}

			{renderSection(
				"Precio",
				<RangeSlider
					min={precioMin}
					max={precioMax}
					step={PRECIO_STEP}
					valueMin={filtros.precioDesde || precioMin}
					valueMax={filtros.precioHasta || precioMax}
					prefix="$"
					onChange={({ min, max }) =>
						setFiltros((prev) => ({
							...prev,
							precioDesde: min === precioMin ? "" : String(min),
							precioHasta: max === precioMax ? "" : String(max),
						}))
					}
				/>,
			)}

			{renderSection(
				"Kilómetros",
				<RangeSlider
					min={kmMin}
					max={kmMax}
					step={KM_STEP}
					valueMin={filtros.kmDesde || kmMin}
					valueMax={filtros.kmHasta || kmMax}
					prefix="km"
					onChange={({ min, max }) =>
						setFiltros((prev) => ({
							...prev,
							kmDesde: min === kmMin ? "" : String(min),
							kmHasta: max === kmMax ? "" : String(max),
						}))
					}
				/>,
			)}

			{renderSection(
				"Categoría",
				<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
					<Box
						onClick={() => setFiltros((prev) => ({ ...prev, categoria: "" }))}
						sx={{
							px: 1.5,
							py: 0.6,
							borderRadius: "6px",
							cursor: "pointer",
							fontSize: "12px",
							fontWeight: 600,
							border: "1px solid",
							borderColor: filtros.categoria === "" ? "#cc0000" : "#ddd",
							backgroundColor: filtros.categoria === "" ? "#cc0000" : "#fff",
							color: filtros.categoria === "" ? "#fff" : "#555",
							transition: "all 0.15s",
						}}
					>
						Todas
					</Box>
					{categorias
						.filter((cat) => cat.value !== "")
						.map((cat) => (
							<Box
								key={cat.value}
								onClick={() =>
									setFiltros((prev) => ({
										...prev,
										categoria: prev.categoria === cat.value ? "" : cat.value,
									}))
								}
								sx={{
									px: 1.5,
									py: 0.6,
									borderRadius: "6px",
									cursor: "pointer",
									fontSize: "12px",
									fontWeight: 600,
									border: "1px solid",
									borderColor: filtros.categoria === cat.value ? "#cc0000" : "#ddd",
									backgroundColor: filtros.categoria === cat.value ? "#cc0000" : "#fff",
									color: filtros.categoria === cat.value ? "#fff" : "#555",
									transition: "all 0.15s",
								}}
							>
								{cat.label}
							</Box>
						))}
				</Box>,
			)}

			{renderSection(
				"Características",
				<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
					{renderSelect("transmision", "Transmisión", transmisiones)}
					{renderSelect("combustible", "Combustible", combustibles)}
					{renderSelect("traccion", "Tracción", tiposTraccion)}
					{renderSelect("oferta", "En oferta", oferta)}
				</Box>,
			)}

			{renderSection(
				"Color",
				<FormControl fullWidth>
					<Select name="color" value={filtros.color || ""} onChange={handleChange} displayEmpty>
						<MenuItem value="">Todos</MenuItem>
						{coloresDisponibles.map((c) => (
							<MenuItem key={c.value} value={c.value}>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<ColorSwatch color={c.value} size={16} />
									{c.label}
								</Box>
							</MenuItem>
						))}
					</Select>
				</FormControl>,
			)}

			{hasActiveFilters && (
				<Button variant="outlined" color="error" startIcon={<ClearIcon />} onClick={handleClearFilters} fullWidth sx={{ mt: 1 }}>
					Limpiar filtros
				</Button>
			)}
		</Box>
	);

	if (isMobile) {
		return (
			<Accordion
				expanded={expanded}
				onChange={() => setExpanded((p) => !p)}
				sx={{
					mb: 2,
					borderRadius: "12px !important",
					overflow: "hidden",
					boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
					backgroundColor: "#ffffff !important",
					"&:before": { display: "none" },
				}}
			>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon sx={{ color: "#111 !important" }} />}
					sx={{ backgroundColor: "#ffffff !important", color: "#111 !important" }}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 800,
								fontFamily: "'Barlow Condensed', sans-serif",
								letterSpacing: "1.5px",
								textTransform: "uppercase",
								fontSize: "16px",
								color: "#111 !important",
							}}
						>
							Filtros
						</Typography>
						{activeCount > 0 && (
							<Box
								sx={{
									backgroundColor: "#cc0000",
									color: "#fff",
									borderRadius: "50%",
									width: 20,
									height: 20,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "11px",
									fontWeight: 700,
								}}
							>
								{activeCount}
							</Box>
						)}
					</Box>
				</AccordionSummary>
				<AccordionDetails sx={{ p: 2 }}>{renderFilters()}</AccordionDetails>
			</Accordion>
		);
	}

	return (
		<Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#fff", border: "1px solid #e8e8e8" }}>
			<Box
				sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, pb: 2, borderBottom: "2px solid #f0f0f0" }}
			>
				<Typography
					variant="h6"
					sx={{
						fontWeight: 800,
						fontFamily: "'Barlow Condensed', sans-serif",
						letterSpacing: "1.5px",
						textTransform: "uppercase",
						fontSize: "18px",
					}}
				>
					Filtros
				</Typography>
				{hasActiveFilters && (
					<Button
						variant="text"
						startIcon={<ClearIcon fontSize="small" />}
						onClick={handleClearFilters}
						size="small"
						sx={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "12px", color: "#cc0000" }}
					>
						Limpiar
					</Button>
				)}
			</Box>
			{renderFilters()}
		</Paper>
	);
};

export default Filtros;
