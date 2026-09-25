import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import HeroHome from "../../components/HeroHome/HeroHome";
import MarcasCarrusel from "../../components/MarcasCarrusel/MarcasCarrusel";
import TipologiaGrid from "../../components/TipologiaGrid/TipologiaGrid";
import WhatsAppBanner from "../../components/WhatsAppBanner/WhatsAppBanner";
import UltimosIngresos from "../../components/UltimosIngresos/UltimosIngresos";
import FinanciacionBanner from "../../components/FinanciacionBanner/FinanciacionBanner";
import ClientesCarrusel from "../../components/ClientesCarrusel/ClientesCarrusel";
import Sucursales from "../../components/Sucursales/Sucursales";
import PromoModal from "../../components/PromoModal/PromoModal";
import { getAutos } from "../../services/autos.service";
import "./Home.css";
import { useFiltros, getFiltrosVacios } from "../../context/FiltrosContext";

export default function Home() {
	const { setFiltros } = useFiltros();
	useEffect(() => {
		sessionStorage.removeItem("catalogoRestore");
		localStorage.removeItem("catalogoFilters");
		setFiltros(getFiltrosVacios());
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);
	const [autos, setAutos] = useState([]);
	const [loadingAutos, setLoadingAutos] = useState(true);

	useEffect(() => {
		const fetchAutos = async () => {
			try {
				const data = await getAutos();
				if (data?.resp) {
					setAutos(data.resp);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoadingAutos(false);
			}
		};

		fetchAutos();
	}, []);

	return (
		<>
			{/* Modal de promo — aparece una vez por sesión */}
			<PromoModal />

			{/* Hero con buscador superpuesto */}
			<HeroHome autos={autos} loading={loadingAutos} />

			{/* Carrusel de marcas */}
			<Box sx={{ backgroundColor: "#f5f5f5", py: { xs: 4, md: 6 } }}>
				<Container maxWidth="lg">
					<Typography
						variant="h5"
						align="center"
						sx={{
							color: "rgba(204, 0, 0, 0.7)",
							fontWeight: 700,
							mb: 4,
							fontFamily: "'Barlow Condensed', sans-serif",
							letterSpacing: 2,
							textTransform: "uppercase",
						}}
					>
						Marcas disponibles
					</Typography>
					<MarcasCarrusel />
				</Container>
			</Box>

			{/* Tipología */}
			<Box sx={{ backgroundColor: "#f5f5f5", py: { xs: 4, md: 6 } }}>
				<Container maxWidth="lg">
					<Typography
						variant="h5"
						align="center"
						sx={{
							fontWeight: 700,
							mb: 4,
							fontFamily: "'Barlow Condensed', sans-serif",
							letterSpacing: 2,
							textTransform: "uppercase",
							color: "#111",
						}}
					>
						Buscá por categoría
					</Typography>
					<TipologiaGrid />
				</Container>
			</Box>

			{/* Banner WhatsApp */}
			<WhatsAppBanner />

			{/* Novedades */}
			<Box sx={{ backgroundColor: "#f5f5f5", py: { xs: 4, md: 6 } }}>
				<Container maxWidth="lg">
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 700,
								fontFamily: "'Barlow Condensed', sans-serif",
								letterSpacing: 2,
								textTransform: "uppercase",
								color: "#111",
							}}
						>
							Novedades
						</Typography>
						<NavLink to="/catalogo" className="ver-todos-link">
							VER TODOS
						</NavLink>
					</Box>
					<UltimosIngresos autos={autos} loading={loadingAutos} />
				</Container>
			</Box>

			{/* Financiación banner */}
			<Box sx={{ backgroundColor: "#f5f5f5" }}>
				<FinanciacionBanner />
			</Box>

			{/* Clientes */}
			<Box sx={{ backgroundColor: "#f5f5f5", py: { xs: 4, md: 6 } }}>
				<Container maxWidth="lg">
					<Typography
						variant="h5"
						align="center"
						sx={{
							fontWeight: 700,
							mb: 4,
							fontFamily: "'Barlow Condensed', sans-serif",
							letterSpacing: 2,
							textTransform: "uppercase",
							color: "#111",
						}}
					>
						Experiencias de nuestros clientes
					</Typography>
					<ClientesCarrusel />
				</Container>
			</Box>

			{/* Sucursales */}
			<Sucursales />
		</>
	);
}
