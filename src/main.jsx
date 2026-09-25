import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { FiltrosProvider } from "./context/FiltrosContext.jsx";

const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#1976d2",
		},
		secondary: {
			main: "#dc004e",
		},
	},
});

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<AuthProvider>
					<FiltrosProvider>
						<App />
					</FiltrosProvider>
				</AuthProvider>
			</BrowserRouter>
		</ThemeProvider>
	</StrictMode>
);