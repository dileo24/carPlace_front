import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
	AppBar,
	Toolbar,
	IconButton,
	Button,
	Menu,
	MenuItem,
	Box,
	useMediaQuery,
	useTheme,
	Divider,
	ListItemIcon,
	ListItemText,
	Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import imgLogo from "../../assets/carPlace.png";
import { ROLES } from "../../constants/roles";

export default function Navbar() {
	const { isAuthenticated, logout, userRol, user } = useAuth();
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const esCRM = location.pathname.startsWith("/crm");

	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleMenu = (event) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const handleLogout = () => {
		handleClose();
		logout();
		navigate("/loginCyJUsers");
	};

	const isRestrictedUser = user?.email === "clodersona@gmail.com" || user?.name === "Cloder Sona";
	const navItems = [
		{
			label: "Inicio",
			path: "/",
			onClick: () => sessionStorage.setItem("visitedHome", "1"),
		},
		{ label: "Vehículos", path: "/catalogo" },
		{ label: "Liquidación", path: "/liquidacion" },
		{ label: "Vendé tu auto", path: "/vende_tu_auto" },
		{ label: "Nosotros", path: "/nosotros" },
		{ label: "Contacto", path: "/nosotros#contacto" },
		...(isAuthenticated && (userRol === ROLES.ADMIN || userRol === ROLES.PUBLICADOR_VENDEDOR)
			? [{ label: "Nuevo auto", path: "/nuevo_auto" }]
			: []),
		...(isAuthenticated ? [{ label: "Gestión", path: isRestrictedUser ? "/crm/consultas" : "/crm/stock" }] : []),
	];

	const isActive = (path) => location.pathname === path;

	return (
		<>
			<AppBar
				position="fixed"
				sx={{
					bgcolor: "rgba(20, 20, 20, 0.9)",
					backdropFilter: "blur(10px)",
				}}
			>
				<Toolbar sx={{ justifyContent: "space-between", minHeight: 70, px: 3 }}>
					<Box
						component="img"
						src={imgLogo}
						alt="logo"
						sx={{
							height: 70,
							cursor: "pointer",
							transition: "transform 0.3s ease",
							"&:hover": {
								transform: "scale(1.05)",
							},
						}}
						onClick={() => {
							sessionStorage.setItem("visitedHome", "1");
							navigate("/");
						}}
					/>

					{isMobile ? (
						<>
							<IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
								<MenuIcon />
							</IconButton>

							<Drawer
								anchor="right"
								open={drawerOpen}
								onClose={() => setDrawerOpen(false)}
								PaperProps={{
									sx: {
										width: 260,
										bgcolor: "#111",
										color: "#fff",
										pt: 2,
									},
								}}
							>
								<Box sx={{ px: 2, mb: 2 }}>
									<Box component="img" src={imgLogo} alt="logo" sx={{ height: 40 }} />
								</Box>

								{navItems.map((item) => (
									<MenuItem
										key={item.path}
										onClick={() => {
											if (item.path.includes("#")) {
												const [pathname, hash] = item.path.split("#");
												navigate(pathname);
												setTimeout(() => {
													document.getElementById(hash)?.scrollIntoView({
														behavior: "smooth",
														block: "start",
													});
												}, 150);
											} else {
												item.onClick?.();
												navigate(item.path);
											}

											setDrawerOpen(false);
										}}
										sx={{
											py: 1.5,
											px: 3,
											fontSize: "0.95rem",
											color: isActive(item.path) ? "#ff2a2a" : "#fff",

											"&:hover": {
												background: "rgba(255,0,0,0.1)",
											},
										}}
									>
										{item.label}
									</MenuItem>
								))}

								{isAuthenticated && (
									<>
										<Divider sx={{ my: 2, borderColor: "#333" }} />
										<MenuItem
											onClick={handleLogout}
											sx={{
												px: 3,
												color: "#ff4d4d",
											}}
										>
											<ListItemIcon>
												<AccountCircle sx={{ color: "#ff4d4d" }} />
											</ListItemIcon>
											<ListItemText>Cerrar sesión</ListItemText>
										</MenuItem>
									</>
								)}
							</Drawer>
						</>
					) : (
						<Box sx={{ display: "flex", gap: 2 }}>
							{navItems.map((item) => (
								<Button
									key={item.path}
									color="inherit"
									onClick={() => {
										if (item.path.includes("#")) {
											const [pathname, hash] = item.path.split("#");

											navigate(pathname);

											setTimeout(() => {
												document.getElementById(hash)?.scrollIntoView({
													behavior: "smooth",
													block: "start",
												});
											}, 150);
										} else {
											item.onClick?.();
											navigate(item.path);
										}
									}}
									sx={{
										position: "relative",
										textTransform: "none",
										fontWeight: 500,
										fontSize: "1rem",
										px: 1.5,
										py: 1,

										color: isActive(item.path) ? "#ff2a2a" : "#fff",

										transition: "all 0.25s ease",

										"&:hover": {
											color: "#ff2a2a",
											transform: "translateY(-2px)",
										},

										/* 🔥 underline animado */
										"&::after": {
											content: '""',
											position: "absolute",
											left: 0,
											bottom: 0,
											width: isActive(item.path) ? "100%" : "0%",
											height: "2px",
											background: "#ff2a2a",
											transition: "width 0.3s ease",
										},

										"&:hover::after": {
											width: "100%",
										},
									}}
								>
									{item.label}
								</Button>
							))}

							{isAuthenticated && (
								<Button color="error" onClick={handleLogout} startIcon={<AccountCircle />}>
									Cerrar sesión
								</Button>
							)}
						</Box>
					)}
				</Toolbar>
			</AppBar>

			{/* Spacer para que no tape contenido */}
			{!esCRM && <Toolbar sx={{ display: { xs: "flex", md: "none" }, minHeight: { xs: 56, sm: 80 } }} />}
		</>
	);
}
