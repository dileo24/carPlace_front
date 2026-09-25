import React from "react";
import { Box } from "@mui/material";
import { COLOR_A_PEDIDO } from "../../data/filters";

// "A pedido" no es un color real (0km sin color definido, el cliente lo
// pide a fábrica) — se muestra con un círculo punteado en vez de un swatch
// de color, en todos los selects/specs que muestran color (crear/editar
// auto, filtros, ficha del auto).
export default function ColorSwatch({ color, size = 24 }) {
	if (color === COLOR_A_PEDIDO) {
		return (
			<Box
				sx={{
					width: size,
					height: size,
					borderRadius: "50%",
					border: "1.5px dashed #999",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: size * 0.55,
					fontWeight: 700,
					color: "#999",
					flexShrink: 0,
				}}
			>
				?
			</Box>
		);
	}

	return (
		<Box
			sx={{
				width: size,
				height: size,
				borderRadius: "50%",
				backgroundColor: color,
				border: "1px solid #ccc",
				flexShrink: 0,
			}}
		/>
	);
}
