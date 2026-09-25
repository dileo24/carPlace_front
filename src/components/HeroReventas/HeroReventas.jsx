import React from "react";
import { Box, Typography } from "@mui/material";
import heroImg from "../../assets/heroReventas.webp";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import "./HeroReventas.css";

const items = [
	{ icon: <LocalOfferOutlinedIcon />, text: <>Precios especiales en vehículos seleccionados.</> },
	{
		icon: <SearchOutlinedIcon />,
		text: (
			<>
				Todas las unidades están alistadas y <strong>listas para la venta.</strong>
			</>
		),
	},
	{ icon: <ListAltOutlinedIcon />, text: <>Toda la información está detallada en cada publicación.</> },
];

export default function HeroReventas() {
	return (
		<Box
			sx={{
				width: "100%",
				minHeight: { xs: "auto", md: "600px" },
				backgroundColor: "#0a0a0a",
				backgroundImage: `url(${heroImg})`,
				backgroundSize: "cover",
				backgroundPosition: "center right",
				position: "relative",
				display: "flex",
				alignItems: "center",
				px: { xs: 3, md: 8 },
				py: { xs: 6, md: 0 },
				overflow: "hidden",
			}}
		>
			{/* Overlay oscuro más fuerte a la izquierda */}
			<Box
				sx={{
					position: "absolute",
					inset: 0,
					background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.3) 100%)",
					zIndex: 0,
				}}
			/>

			<Box sx={{ position: "relative", zIndex: 1, maxWidth: { xs: "100%", md: "520px" } }}>
				<Typography
					sx={{
						fontSize: { xs: "36px", sm: "48px", md: "54px" },
						fontWeight: 900,
						fontFamily: "'Barlow Condensed', sans-serif",
						textTransform: "uppercase",
						lineHeight: 1.05,
						color: "#fff",
					}}
				>
					¿SOS REVENTA O<br />
					BUSCAS UNA <span style={{ color: "#cc0000" }}>OPORTUNIDAD REAL?</span>
				</Typography>

				{/* Ítems */}
				<Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
					{items.map((item, i) => (
						<React.Fragment key={i}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 2,
									animation: "fadeUp 0.8s ease forwards",
									animationDelay: `${0.4 + i * 0.15}s`,
									opacity: 0,
								}}
							>
								<Box sx={{ color: "#cc0000", flexShrink: 0, fontSize: "28px", display: "flex" }}>{item.icon}</Box>
								<Typography sx={{ color: "#ddd", fontFamily: "'Barlow', sans-serif", fontSize: { xs: "14px", md: "16px" } }}>
									{item.text}
								</Typography>
							</Box>
							{i < items.length - 1 && <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }} />}
						</React.Fragment>
					))}
				</Box>
			</Box>
		</Box>
	);
}
