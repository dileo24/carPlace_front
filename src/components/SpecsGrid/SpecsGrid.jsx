import React from "react";
import { Grid, Paper, Box } from "@mui/material";
import SpecItem from "../SpecItem/SpectItem";
import { tiposColor, formatearLista } from "../../data/filters";
import ColorSwatch from "../ColorSwatch/ColorSwatch";

const hasValidKm = (kmValue) => kmValue !== null && kmValue !== "";

// SVG icons — línea fina, estilo profesional
const Icons = {
	modelo: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#cc2222"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
		</svg>
	),
	km: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#cc2222"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	),
	motor: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#cc2222"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="8" width="13" height="8" rx="1.5" />
			<path d="M16 10h2l2-2v8l-2-2h-2" />
			<path d="M6 8V6M10 8V6" />
			<path d="M6 16v2M10 16v2" />
			<line x1="3" y1="12" x2="0" y2="12" />
		</svg>
	),
	transmision: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#cc2222"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="5" cy="6" r="2" />
			<circle cx="12" cy="6" r="2" />
			<circle cx="19" cy="6" r="2" />
			<circle cx="12" cy="18" r="2" />
			<line x1="12" y1="8" x2="12" y2="16" />
			<line x1="5" y1="8" x2="12" y2="16" />
			<line x1="19" y1="8" x2="12" y2="16" />
		</svg>
	),
	combustible: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#cc2222"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 2 C9 6 7 9.5 7 12.5 a5 5 0 0 0 10 0 C17 9.5 15 6 12 2Z" />
		</svg>
	),
	traccion: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#cc2222"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="5" cy="17" r="2" />
			<circle cx="19" cy="17" r="2" />
			<circle cx="5" cy="7" r="2" />
			<circle cx="19" cy="7" r="2" />
			<line x1="5" y1="9" x2="5" y2="15" />
			<line x1="19" y1="9" x2="19" y2="15" />
			<line x1="7" y1="7" x2="17" y2="7" />
			<line x1="7" y1="17" x2="17" y2="17" />
		</svg>
	),
	color: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#cc2222"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 3 C8 7 6 10 6 12.5 a6 6 0 0 0 12 0 C18 10 16 7 12 3Z" />
		</svg>
	),
	categoria: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#cc2222"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M3 3h7v7H3z" />
			<path d="M14 3h7v7h-7z" />
			<path d="M3 14h7v7H3z" />
			<path d="M17.5 14l-3.5 7 3.5-3.5 3.5 3.5L17.5 14z" />
		</svg>
	),
};

export default function SpecsGrid({ auto }) {
	const { anio, km, motor, transmision, combustible, traccion, color, categorias } = auto;
	const validKm = hasValidKm(km);

	return (
		<Grid container spacing={2} sx={{ mt: 2 }}>
			<Grid item xs={validKm ? 4 : 6}>
				<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e5e5" }}>
					<SpecItem icon={Icons.modelo} label="Modelo" value={anio} />
				</Paper>
			</Grid>

			{validKm && (
				<Grid item xs={4}>
					<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e5e5" }}>
						<SpecItem icon={Icons.km} label="Km" value={km} />
					</Paper>
				</Grid>
			)}

			<Grid item xs={validKm ? 4 : 6}>
				<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e5e5" }}>
					<SpecItem icon={Icons.motor} label="Motor" value={motor} />
				</Paper>
			</Grid>

			<Grid item xs={6}>
				<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e5e5" }}>
					<SpecItem icon={Icons.transmision} label="Transmisión" value={formatearLista(transmision)} />
				</Paper>
			</Grid>

			<Grid item xs={6}>
				<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e5e5" }}>
					<SpecItem icon={Icons.combustible} label="Combustible" value={formatearLista(combustible)} />
				</Paper>
			</Grid>

			{traccion && (
				<Grid item xs={6}>
					<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e5e5" }}>
						<SpecItem icon={Icons.traccion} label="Tracción" value={formatearLista(traccion)} />
					</Paper>
				</Grid>
			)}

			{color && (
				<Grid item xs={6}>
					<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e5e5" }}>
						<SpecItem
							icon={Icons.color}
							label="Color"
							value={
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<ColorSwatch color={color} size={16} />
									<span>{tiposColor.find((c) => c.value === color)?.label || color}</span>
								</Box>
							}
						/>
					</Paper>
				</Grid>
			)}

			<Grid item xs={traccion ? 12 : 6}>
				<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e5e5e5" }}>
					<SpecItem icon={Icons.categoria} label="Categoría/s" value={categorias?.map((cat) => cat.categ).join(", ") || "Sin categoría"} />
				</Paper>
			</Grid>
		</Grid>
	);
}
