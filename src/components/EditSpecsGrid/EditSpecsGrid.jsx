import React from "react";
import { Grid, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, Box } from "@mui/material";
import {
	tiposCombustible,
	tiposTransmision,
	tiposTraccion,
	categoriaToCreate,
	tiposColor,
	MAX_COMBUSTIBLES,
	MAX_TRANSMISIONES,
	MAX_TRACCIONES,
} from "../../data/filters";
import ColorSwatch from "../ColorSwatch/ColorSwatch";
import MultiSelectChecklist from "../MultiSelectChecklist/MultiSelectChecklist";

const filteredCombustible = tiposCombustible.filter((opt) => opt.value !== "");
const filteredColor = tiposColor.filter((opt) => opt.value !== "");
const filteredTransmision = tiposTransmision.filter((opt) => opt.value !== "");
const filteredTraccion = tiposTraccion.filter((opt) => opt.value !== "");

export default function EditSpecsGrid({ editedAuto, refs, years, onChange, onCategoryChange, patenteError = "" }) {
	const { yearRef, motorRef, kmRef, transmisionRef, combustibleRef, colorRef } = refs;

	return (
		<Grid container spacing={2} sx={{ mt: 2 }}>
			{/* Año */}
			<Grid item xs={6}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<FormControl fullWidth>
						<InputLabel>Año</InputLabel>
						<Select inputRef={yearRef} name="anio" value={editedAuto.anio} onChange={(e) => onChange(e, "anio")} label="Año">
							{years.map((year) => (
								<MenuItem key={year} value={year}>
									{year}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Paper>
			</Grid>

			{/* Km */}
			<Grid item xs={6}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<TextField inputRef={kmRef} label="Km" name="km" value={editedAuto.km} onChange={(e) => onChange(e, "km")} fullWidth />
				</Paper>
			</Grid>

			{/* Patente (solo uso interno, no se muestra en el sitio público) */}
			<Grid item xs={12}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<TextField
						label="Patente (opcional)"
						name="patente"
						value={editedAuto.patente || ""}
						onChange={(e) => onChange(e, "patente")}
						error={!!patenteError}
						helperText={patenteError || "Solo uso interno, no se muestra en el sitio"}
						inputProps={{ maxLength: 10 }}
						fullWidth
					/>
				</Paper>
			</Grid>

			{/* Motor */}
			<Grid item xs={12}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<TextField
						inputRef={motorRef}
						label="Motor"
						name="motor"
						value={editedAuto.motor}
						onChange={(e) => onChange(e, "motor")}
						fullWidth
					/>
				</Paper>
			</Grid>

			{/* Transmisión — puede combinar más de una (ej. viene en Manual y Automática) */}
			<Grid item xs={12}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<MultiSelectChecklist
						inputRef={transmisionRef}
						label="Transmisión"
						name="transmision"
						value={editedAuto.transmision}
						options={filteredTransmision}
						max={MAX_TRANSMISIONES}
						onChange={onChange}
					/>
				</Paper>
			</Grid>

			{/* Combustible — hasta 3 (ej. un híbrido que también anda a nafta) */}
			<Grid item xs={12}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<MultiSelectChecklist
						inputRef={combustibleRef}
						label="Combustible"
						name="combustible"
						value={editedAuto.combustible}
						options={filteredCombustible}
						max={MAX_COMBUSTIBLES}
						onChange={onChange}
					/>
				</Paper>
			</Grid>

			{/* Tracción — puede combinar 4x4 y 4x2 si el modelo viene en ambas */}
			<Grid item xs={12}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<MultiSelectChecklist
						label="Tracción"
						name="traccion"
						value={editedAuto.traccion}
						options={filteredTraccion}
						max={MAX_TRACCIONES}
						onChange={onChange}
					/>
				</Paper>
			</Grid>

			{/* Color */}
			<Grid item xs={12}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<FormControl fullWidth>
						<InputLabel>Color</InputLabel>
						<Select
							inputRef={colorRef}
							name="color"
							value={editedAuto.color}
							onChange={(e) => onChange(e, "color")}
							label="Color"
							MenuProps={{ disableScrollLock: true }}
						>
							{tiposColor.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<ColorSwatch color={option.value} size={24} />
										<span>{option.label}</span>
									</Box>
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Paper>
			</Grid>

			{/* Categorías */}
			<Grid item xs={12}>
				<Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
					<FormControl fullWidth>
						<InputLabel>Categoría/s</InputLabel>
						<Select
							multiple
							name="categorias"
							value={editedAuto.categorias?.map((cat) => cat.id.toString()) || []}
							onChange={onCategoryChange}
							label="Categoría/s"
							renderValue={(selected) => selected.map((id) => categoriaToCreate.find((c) => c.value === id)?.label || id).join(", ")}
						>
							{categoriaToCreate.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									<Checkbox checked={editedAuto.categorias?.some((c) => c.id.toString() === option.value)} />
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Paper>
			</Grid>
		</Grid>
	);
}
