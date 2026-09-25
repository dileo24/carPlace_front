import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import heroImg from "../../assets/catalogo/heroCatalogo.webp";
import "./HeroCatalogo.css";

export default function HeroCatalogo() {
	return (
		<Box
			sx={{
				width: "100%",
				overflow: "hidden",
				marginTop: { xs: 0, md: "60px" },
			}}
		>
			<Box
				sx={{
					width: "100%",
					minHeight: { xs: "50vh", md: "420px" },
					backgroundImage: `url(${heroImg})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					px: 2,
					animation: "heroZoom 18s ease-in-out infinite alternate",
				}}
			>
				<Box
					sx={{
						maxWidth: "750px",
						animation: "fadeUp 0.8s ease forwards",
					}}
				>
					<Typography
						sx={{
							fontSize: { xs: "32px", sm: "48px", md: "56px" },
							fontWeight: 900,
							fontFamily: "'Barlow Condensed', sans-serif",
							textTransform: "uppercase",
							lineHeight: 1.1,
							color: "#111",
							animation: "fadeUp 0.8s ease forwards",
							animationDelay: "0.2s",
							opacity: 0,
						}}
					>
						¿No encontrás el auto
					</Typography>

					<Typography
						sx={{
							fontSize: { xs: "32px", sm: "48px", md: "56px" },
							fontWeight: 900,
							fontFamily: "'Barlow Condensed', sans-serif",
							textTransform: "uppercase",
							lineHeight: 1.1,
							color: "#cc0000",
							mb: 2,
							animation: "fadeUp 0.8s ease forwards",
							animationDelay: "0.35s",
							opacity: 0,
						}}
					>
						que estás buscando?
					</Typography>

					<Typography
						sx={{
							fontSize: { xs: "16px", sm: "18px" },
							color: "#333",
							mb: 4,
							fontFamily: "'Barlow', sans-serif",
							animation: "fadeUp 0.8s ease forwards",
							animationDelay: "0.5s",
							opacity: 0,
						}}
					>
						Decinos qué modelo querés y nosotros lo conseguimos por vos.
					</Typography>

					<Button
						component={Link}
						to="/nosotros#contacto"
						variant="contained"
						sx={{
							backgroundColor: "#cc0000",
							borderRadius: "999px",
							px: 6,
							py: 1.8,
							fontSize: "15px",
							fontWeight: 700,
							fontFamily: "'Barlow Condensed', sans-serif",
							letterSpacing: "1px",
							textTransform: "uppercase",
							boxShadow: "0 6px 20px rgba(204,0,0,0.25)",
							transition: "all 0.25s ease",
							"&:hover": {
								backgroundColor: "#a80000",
								transform: "translateY(-2px) scale(1.03)",
								boxShadow: "0 10px 30px rgba(204,0,0,0.35)",
							},
						}}
					>
						HACÉ CLICK ACÁ →
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
