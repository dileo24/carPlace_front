import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useEffect, lazy, Suspense } from "react";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Wpp from "./components/Wpp/Wpp";
import { TranslationErrorBoundary } from "./components/TranslationErrorBoundary/TranslationErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { ROLES } from "./constants/roles";
import { useAuth } from "./context/AuthContext";

// Cada vista se descarga sólo cuando se visita su ruta, en vez de sumarse
// al bundle inicial (antes: ~1.85MB de JS incluso para visitar la home).
const Home = lazy(() => import("./views/Home/Home"));
const Catalogo = lazy(() => import("./views/Catalogo/Catalogo"));
const DetalleAuto = lazy(() => import("./views/DetalleAuto/DetalleAuto"));
const EditarAuto = lazy(() => import("./views/EditarAuto/EditarAuto"));
const Login = lazy(() => import("./views/Login/Login"));
const Nosotros = lazy(() => import("./views/Nosotros/Nosotros"));
const NuevoAuto = lazy(() => import("./views/NuevoAuto/NuevoAuto"));
const VendeTuAuto = lazy(() => import("./views/VendeTuAuto/VendeTuAuto"));
const Reventas = lazy(() => import("./views/Reventas/Reventas"));
const Layout = lazy(() => import("./views/CRM/Layout/Layout"));
const Dashboard = lazy(() => import("./views/CRM/Dashboard/Dashboard"));
const Consultas = lazy(() => import("./views/CRM/Consultas/Consultas"));
const Conversaciones = lazy(() => import("./views/CRM/Conversaciones/Conversaciones"));
const Calendario = lazy(() => import("./views/CRM/Calendario/Calendario"));
const Stock = lazy(() => import("./views/CRM/Stock/Stock"));
const Tareas = lazy(() => import("./views/CRM/Tareas/Tareas"));
const Ventas = lazy(() => import("./views/CRM/Ventas/Ventas"));
const Usuarios = lazy(() => import("./views/CRM/Usuarios/Usuarios"));
const Cuentas = lazy(() => import("./views/CRM/Cuentas/Cuentas"));
const Marcas = lazy(() => import("./views/CRM/Marcas/Marcas"));
const Integraciones = lazy(() => import("./views/CRM/Integraciones/Integraciones"));
const Publicaciones = lazy(() => import("./views/CRM/Publicaciones/Publicaciones"));
const Reportes = lazy(() => import("./views/CRM/Reportes/Reportes"));

function RouteFallback() {
	return (
		<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
			<CircularProgress size={48} thickness={4} />
		</Box>
	);
}

function AppContent() {
	const location = useLocation();
	const esCRM = location.pathname.toLowerCase().startsWith("/crm");
	
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		const originalTitle = "Charly y Joaco Automotores";
		const altTitle = "¡Volvé! No te vayas";

		let interval = null;
		let toggle = false;

		const handleVisibilityChange = () => {
			if (document.hidden) {
				document.title = altTitle;
				interval = setInterval(() => {
					document.title = toggle ? originalTitle : altTitle;
					toggle = !toggle;
				}, 2000);
			} else {
				clearInterval(interval);
				document.title = originalTitle;
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	useEffect(() => {
		if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
			document.body.classList.add("touch-device");

			// WebKit (Safari/iOS) requiere un listener táctil nativo enlazado al
			// documento para tratar el primer toque como click; sin él, cualquier
			// elemento con estilos :hover necesita un segundo toque.
			const noop = () => {};
			document.addEventListener("touchstart", noop, { passive: true });
			return () => document.removeEventListener("touchstart", noop);
		}
	}, []);

	if (isAuthenticated && location.pathname === "/" && !sessionStorage.getItem("visitedHome")) {
		return <Navigate to="/crm/stock" replace />;
	}

	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<Navbar />

			<Box component="main" sx={{ flex: 1 }}>
				<Suspense fallback={<RouteFallback />}>
				<Routes>
					{/* ── Rutas públicas ── */}
					<Route path="/" element={<Home />} />
					<Route path="/catalogo" element={<Catalogo />} />
					<Route path="/liquidacion" element={<Reventas />} />
					<Route path="/catalogo/:id/*" element={<DetalleAuto />} />
					<Route
						path="/catalogo/:id/editar"
						element={
							<ProtectedRoute roles={[ROLES.ADMIN]} redirectTo="/">
								<EditarAuto />
							</ProtectedRoute>
						}
					/>
					<Route path="/loginAdminP" element={<Login />} />
					<Route path="/nosotros" element={<Nosotros />} />
					<Route path="/vende_tu_auto" element={<VendeTuAuto />} />

					{/* Nuevo auto: solo admin */}
					<Route
						path="/nuevo_auto"
						element={
							<ProtectedRoute roles={[ROLES.ADMIN, ROLES.PUBLICADOR_VENDEDOR]} redirectTo="/">
								<NuevoAuto />
							</ProtectedRoute>
						}
					/>

					{/* ── CRM (requiere autenticación) ── */}
					<Route
						path="/crm"
						element={
							<ProtectedRoute>
								<Layout />
							</ProtectedRoute>
						}
					>
						{/* Todos los roles autenticados */}
						<Route index element={<Dashboard />} />
						<Route path="calendario" element={<Calendario />} />
						<Route path="stock" element={<Stock />} />

						{/* El socio no tiene acceso a Consultas/Conversaciones */}
						<Route
							path="consultas"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.VENDEDOR, ROLES.PUBLICADOR_VENDEDOR]}>
									<Consultas />
								</ProtectedRoute>
							}
						/>
						<Route
							path="conversaciones"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.VENDEDOR, ROLES.PUBLICADOR_VENDEDOR]}>
									<Conversaciones />
								</ProtectedRoute>
							}
						/>

						{/* Admin, supervisor y socio (el socio ve solo lo suyo, filtrado en el backend) */}
						<Route
							path="tareas"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIO]}>
									<Tareas />
								</ProtectedRoute>
							}
						/>
						<Route
							path="ventas"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIO]}>
									<Ventas />
								</ProtectedRoute>
							}
						/>
						<Route
							path="reportes"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.SOCIO]}>
									<Reportes />
								</ProtectedRoute>
							}
						/>

						{/* Solo admin */}
						<Route
							path="usuarios"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN]}>
									<Usuarios />
								</ProtectedRoute>
							}
						/>
						<Route
							path="cuentas"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN]}>
									<Cuentas />
								</ProtectedRoute>
							}
						/>
						<Route
							path="marcas"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN]}>
									<Marcas />
								</ProtectedRoute>
							}
						/>
						<Route
							path="integraciones"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN]}>
									<Integraciones />
								</ProtectedRoute>
							}
						/>
						<Route
							path="publicaciones"
							element={
								<ProtectedRoute roles={[ROLES.ADMIN]}>
									<Publicaciones />
								</ProtectedRoute>
							}
						/>
					</Route>
				</Routes>
				</Suspense>
			</Box>

			{!esCRM && <Wpp />}
			{!esCRM && <Footer />}
		</Box>
	);
}

function App() {
	return (
		<TranslationErrorBoundary>
			<AppContent />
		</TranslationErrorBoundary>
	);
}

export default App;
