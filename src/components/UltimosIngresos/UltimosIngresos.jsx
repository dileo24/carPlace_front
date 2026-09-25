import React, { useState, useEffect } from "react";
import { getAutos } from "../../services/autos.service";
import Card from "../../components/Card/Card";
import { Box, CircularProgress } from "@mui/material";

export default function UltimosIngresos({ autos, loading }) {
  const [page, setPage] = useState(0);
  const PER_PAGE = 3;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 260 }}>
        <CircularProgress size={42} sx={{ color: "#cc0000" }} />
      </Box>
    );
  }

  const destacados = autos.filter((auto) => auto.destacar);
  const totalPages = Math.ceil(destacados.length / PER_PAGE);

  const visibles = destacados.slice(
    page * PER_PAGE,
    page * PER_PAGE + PER_PAGE
  );

	

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "repeat(1, 1fr)",
						sm: "repeat(2, 1fr)",
						md: "repeat(3, 1fr)",
					},
					gap: 2,
				}}
			>
				{visibles.map((auto) => (
					<Card key={auto.id} auto={auto} />
				))}
			</Box>

			{totalPages > 1 && (
				<Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
					<button
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={page === 0}
						style={{
							width: 42,
							height: 42,
							borderRadius: "50%",
							border: "2px solid #ddd",
							background: "#fff",
							fontSize: "1.3rem",
							cursor: "pointer",
							color: "#333",
						}}
					>
						‹
					</button>
					<button
						onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
						disabled={page === totalPages - 1}
						style={{
							width: 42,
							height: 42,
							borderRadius: "50%",
							border: "2px solid #ddd",
							background: "#fff",
							fontSize: "1.3rem",
							cursor: "pointer",
							color: "#333",
						}}
					>
						›
					</button>
				</Box>
			)}
		</Box>
	);
}
