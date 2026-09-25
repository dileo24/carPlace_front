import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Checkbox } from "@mui/material";
import { MULTI_SEPARADOR } from "../../data/filters";

// Select con checkboxes que guarda hasta `max` opciones combinadas en un solo
// string separado por " + " (ver MULTI_SEPARADOR) — usado para combustible,
// transmisión y tracción, campos que un auto puede tener más de uno a la vez.
export default function MultiSelectChecklist({ label, name, value, options, max, onChange, inputRef }) {
	const seleccionados = value ? value.split(MULTI_SEPARADOR) : [];

	return (
		<FormControl fullWidth>
			<InputLabel>{label}</InputLabel>
			<Select
				inputRef={inputRef}
				multiple
				name={name}
				value={seleccionados}
				onChange={(e) => {
					const nuevos = typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value;
					onChange({ target: { name, value: nuevos.slice(0, max).join(MULTI_SEPARADOR) } });
				}}
				label={label}
				MenuProps={{ disableScrollLock: true }}
				renderValue={(selected) => selected.map((v) => options.find((o) => o.value === v)?.label || v).join(" / ")}
			>
				{options.map((option) => {
					const deshabilitado = !seleccionados.includes(option.value) && seleccionados.length >= max;
					return (
						<MenuItem key={option.value} value={option.value} disabled={deshabilitado}>
							<Checkbox checked={seleccionados.includes(option.value)} />
							{option.label}
						</MenuItem>
					);
				})}
			</Select>
		</FormControl>
	);
}
