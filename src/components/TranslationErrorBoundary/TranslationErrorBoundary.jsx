import React from "react";
import { Box, Typography, Button } from "@mui/material";

// Algunas extensiones de traducción del navegador (Google Translate, etc.)
// manipulan el DOM por fuera de React y provocan errores de insertBefore/
// removeChild al desmontar nodos que la extensión ya movió. Son inofensivos:
// se ignoran y se deja que React vuelva a renderizar el árbol tal cual estaba.
const isTranslationGlitch = (error) =>
  error?.message?.includes("insertBefore") ||
  error?.message?.includes("removeChild") ||
  error?.message?.includes("NotFoundError");

// Tras cada deploy, Vite genera chunks con hash nuevo y borra los viejos.
// Si el usuario deja la pestaña abierta y navega a una ruta lazy que no
// había cargado en esa sesión, el import() dinámico falla porque el chunk
// ya no existe en el servidor. Recargar trae un index.html con las
// referencias correctas.
const isChunkLoadError = (error) =>
  error?.name === "ChunkLoadError" ||
  /dynamically imported module|Loading chunk .* failed|Failed to fetch dynamically imported module/.test(
    error?.message || ""
  );

const CHUNK_RELOAD_FLAG = "sq_chunk_reload_attempted";

export class TranslationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isRecoverable: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isRecoverable: isTranslationGlitch(error) };
  }

  componentDidCatch(error, info) {
    if (isTranslationGlitch(error)) {
      setTimeout(() => this.setState({ hasError: false, isRecoverable: false }), 100);
      return;
    }

    if (isChunkLoadError(error)) {
      if (!sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
        sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
        window.location.reload();
        return;
      }
    }

    console.error("Error no controlado:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isRecoverable) {
        return this.props.children;
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          minHeight="100vh"
          textAlign="center"
          px={2}
        >
          <Typography variant="h6">Ocurrió un error inesperado</Typography>
          <Typography variant="body2" color="text.secondary">
            Probá recargar la página. Si el problema persiste, avisá a soporte.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Recargar
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
