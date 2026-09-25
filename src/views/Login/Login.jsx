import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/user.service";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Paper, Container, CircularProgress, Alert } from "@mui/material";
import { Email } from "@mui/icons-material";

const Login = () => {
	const [form, setForm] = useState({ email: "", pass: "" });
	const [state, setState] = useState({ errors: {}, loading: false });

	const { login } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const sesionExpirada = searchParams.get("sesionExpirada") === "1";

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		setState((prev) => ({ ...prev, errors: { ...prev.errors, [name]: "" } }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setState((prev) => ({ ...prev, loading: true, errors: {} }));

		try {
			const data = await loginUser(form);

			if (data.status === 200) {
				login(data.user.rol, data.user, data.token);
				navigate("/crm/stock");
			}
		} catch (error) {
			if (error.errors) {
				const apiErrors = {};
				error.errors.forEach((err) => (apiErrors[err.input] = err.resp));
				setState((prev) => ({ ...prev, errors: apiErrors }));
			}
		} finally {
			setState((prev) => ({ ...prev, loading: false }));
		}
	};

	const buttonStyles = {
		primary: {
			backgroundColor: "#dc3545",
			color: "#fff",
			"&:hover": { backgroundColor: "#bb2d3b" },
			"&:disabled": { backgroundColor: "#dc354580" },
		},
	};

	return (
		<Container maxWidth="sm" sx={{ mt: 8 }}>
			<Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
				<Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
					<Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: sesionExpirada ? 2 : 4, fontWeight: "bold" }}>
						Iniciar sesión
					</Typography>

					{sesionExpirada && (
						<Alert severity="info" sx={{ mb: 3 }}>
							Su sesión expiró. Inicie sesión de nuevo para continuar.
						</Alert>
					)}

					<TextField
						fullWidth
						label="Email"
						name="email"
						value={form.email}
						onChange={handleChange}
						error={!!state.errors.email}
						helperText={state.errors.email}
						margin="normal"
						InputProps={{
							startAdornment: <Email color="action" sx={{ mr: 1 }} />,
						}}
					/>

					<TextField
						fullWidth
						label="Contraseña"
						name="pass"
						type="password"
						value={form.pass}
						onChange={handleChange}
						error={!!state.errors.pass}
						helperText={state.errors.pass}
						margin="normal"
					/>

					<Button
						fullWidth
						type="submit"
						variant="contained"
						size="large"
						sx={{ ...buttonStyles.primary, mt: 3, mb: 2, py: 1.5 }}
						disabled={state.loading}
					>
						{state.loading ? <CircularProgress size={24} color="inherit" /> : "Iniciar sesión"}
					</Button>
				</Box>
			</Paper>
		</Container>
	);
};

export default Login;
