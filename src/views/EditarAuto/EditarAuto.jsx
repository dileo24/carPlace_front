import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Container,
	Card,
	CardContent,
	Typography,
	Grid,
	CircularProgress,
	Box,
	TextField,
	Button,
	Select,
	MenuItem,
	FormControlLabel,
	Checkbox,
	Alert,
	FormControl,
	InputLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import { useMarcas } from "../../hooks/useMarcas";
import { useAutoDetail } from "../../hooks/useAutoDetail";
import { useAuth } from "../../context/AuthContext";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import EditSpecsGrid from "../../components/EditSpecsGrid/EditSpecsGrid";
import BenefitsCard from "../../components/BenefitsCard/BenefitsCard";
import CardsRelacionados from "../../components/Cards_Relacionados/CardsRelacionados";
import { getPublicaciones } from "../../services/publicaciones.service";

const MotionCard = motion(Card);

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export default function EditarAuto() {
	const hoy = new Date();
	const mesActual = MESES[hoy.getMonth()];
	const { id } = useParams();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
	const {
		auto,
		images,
		selectedImageIndex,
		imageError,
		isUploading,
		categorias,
		editedAuto,
		moneda,
		years,
		submitError,
		refs,
		setSelectedImageIndex,
		setMoneda,
		handleChange,
		handleCategoryChange,
		handleSave,
		handleImageUpload,
		handleRemoveImage,
		handleDeleteAuto,
		moveImage,
	} = useAutoDetail(id);

	const { marcas: marcasCatalogo } = useMarcas();
	const [saveError, setSaveError] = useState(null);
	const [publicaciones, setPublicaciones] = useState([]);

	useEffect(() => {
		getPublicaciones(id)
			.then((data) => setPublicaciones(Array.isArray(data?.resp) ? data.resp : []))
			.catch(() => setPublicaciones([]));
	}, [id]);

	const publicacionActiva = publicaciones.find((p) => p.estado === "publicada");
	const publicacionPausada = publicaciones.find((p) => p.estado === "pausada");

	// 0km por categoría o porque no tiene kilometraje cargado — solo ahí tiene
	// sentido ofrecer "Consultar precio" en vez del precio real.
	const es0km = editedAuto.categorias?.some((c) => c.categ === "0km") || !editedAuto.km || editedAuto.km === "0";

	if (!isAuthenticated) {
		navigate(`/catalogo/${id}`);
		return null;
	}

	if (!auto)
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
				<CircularProgress size={60} thickness={4} />
			</Box>
		);

	const onSave = async () => {
		const success = await handleSave();
		if (success) navigate(`/catalogo/${id}`);
	};

	return (
		<>
			<Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
				<Typography variant="h4" fontWeight="bold" mb={3}>
					Editando: {auto.marca} {auto.modelo}
				</Typography>

				{publicacionActiva && (
					<Alert severity="info" sx={{ mb: 3 }}>
						Publicado en MercadoLibre —{" "}
						<a href={publicacionActiva.permalink} target="_blank" rel="noopener noreferrer">
							ver publicación
						</a>
						. Al guardar, el precio/km/fotos se actualizan también ahí. Si marcás el auto como vendido/no
						disponible o lo ocultás, la publicación se pausa sola en MercadoLibre. Si lo eliminás, la
						publicación se elimina del todo en MercadoLibre.
					</Alert>
				)}
				{!publicacionActiva && publicacionPausada && (
					<Alert severity="warning" sx={{ mb: 3 }}>
						Tiene una publicación <strong>pausada</strong> en MercadoLibre —{" "}
						<a href={publicacionPausada.permalink} target="_blank" rel="noopener noreferrer">
							ver publicación
						</a>
						. Si eliminás este auto, esa publicación se elimina del todo en MercadoLibre.
					</Alert>
				)}

				<Grid container spacing={3}>
					{/* Gallery */}
					<Grid item xs={12} md={8}>
						<MotionCard
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							sx={{ borderRadius: 2, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
						>
							<ImageGallery
								images={images}
								selectedImageIndex={selectedImageIndex}
								onSlideChange={setSelectedImageIndex}
								onThumbnailClick={setSelectedImageIndex}
								onMoveImage={moveImage}
								onRemoveImage={handleRemoveImage}
								onUploadImages={handleImageUpload}
								isEditing={true}
								isAuthenticated={isAuthenticated}
								isUploading={isUploading}
								imageError={imageError}
							/>
						</MotionCard>
					</Grid>

					{/* Edit panel */}
					<Grid item xs={12} md={4}>
						<MotionCard
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							sx={{
								borderRadius: 4,
								background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
								boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
							}}
						>
							<CardContent>
								{/* Marca y modelo */}
								<FormControl fullWidth margin="normal">
									<InputLabel>Marca</InputLabel>
									<Select name="marca" value={editedAuto.marca || ""} onChange={handleChange} label="Marca">
										{marcasCatalogo.map((marca) => (
											<MenuItem key={marca.id} value={marca.nombre}>
												{marca.nombre}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<TextField
									inputRef={refs.modeloRef}
									label="Modelo"
									name="modelo"
									value={editedAuto.modelo || ""}
									onChange={handleChange}
									fullWidth
									margin="normal"
								/>

								{/* Precio */}
								<Box display="flex" alignItems="center">
									<TextField
										inputRef={refs.precioRef}
										label="Precio"
										name="precio"
										value={editedAuto.precio || ""}
										onChange={handleChange}
										fullWidth
										margin="normal"
										onSelect={(e) => {}}
										helperText={es0km ? "Vacío = se muestra \"Consultar precio\" en el sitio" : ""}
									/>
									<Select value={moneda} onChange={(e) => setMoneda(e.target.value)} sx={{ ml: 1, minWidth: 80 }}>
										<MenuItem value="AR$">AR$</MenuItem>
										<MenuItem value="U$D">U$D</MenuItem>
									</Select>
								</Box>

								{/* Flags */}
								<FormControlLabel
									control={<Checkbox checked={editedAuto.destacar || false} onChange={handleChange} name="destacar" />}
									label="Destacar"
								/>
								<FormControlLabel
									control={<Checkbox checked={editedAuto.oferta || false} onChange={handleChange} name="oferta" />}
									label="En oferta"
								/>

								{editedAuto.oferta && (
									<TextField
										label="Precio de oferta"
										name="precio_oferta"
										value={editedAuto.precio_oferta || ""}
										onChange={handleChange}
										fullWidth
										margin="normal"
									/>
								)}
								{/* Visible */}
								<FormControlLabel
									control={
										<Checkbox
											checked={editedAuto.visible !== undefined ? editedAuto.visible : true}
											onChange={handleChange}
											name="visible"
										/>
									}
									label="Visible en catálogo"
								/>

								{/* Reventa */}
								<FormControlLabel
									control={<Checkbox checked={editedAuto.oferta_reventa || false} onChange={handleChange} name="oferta_reventa" />}
									label="Visible en liquidación"
								/>

								{editedAuto.oferta_reventa && (
									<TextField
										label={`Precio InfoAuto ${mesActual}`}
										name="precio_info_mes_actual"
										value={
											editedAuto.precio_info_mes_actual
												? Number(String(editedAuto.precio_info_mes_actual).replace(/\./g, "")).toLocaleString("es-AR")
												: ""
										}
										onChange={(e) => {
											const raw = e.target.value.replace(/\./g, "");
											handleChange({ target: { name: "precio_info_mes_actual", value: raw } });
										}}
										fullWidth
										margin="normal"
										placeholder="ej: 19.200.000"
									/>
								)}

								{editedAuto.oferta_reventa && (
									<TextField
										label="Notas de reventa"
										name="notas_reventa"
										value={editedAuto.notas_reventa || ""}
										onChange={handleChange}
										fullWidth
										margin="normal"
										multiline
										rows={3}
										placeholder="Detalles estéticos, mecánicos o condiciones especiales…"
									/>
								)}

								{/* Precio contado */}
								<TextField
									inputRef={refs.precioContadoRef}
									label="Precio contado"
									name="precio_contado"
									value={editedAuto.precio_contado || ""}
									onChange={handleChange}
									fullWidth
									margin="normal"
								/>

								{/* Specs editables */}
								<EditSpecsGrid
									editedAuto={editedAuto}
									refs={refs}
									years={years}
									onChange={handleChange}
									onCategoryChange={handleCategoryChange}
								/>

								{/* Errores */}
								{(submitError || saveError) && (
									<Alert severity="error" sx={{ mt: 2 }}>
										{submitError || saveError}
									</Alert>
								)}

								{/* Acciones */}
								<Grid container spacing={2} sx={{ mt: 2 }}>
									<Grid item xs={6}>
										<Button variant="contained" color="primary" fullWidth onClick={onSave}>
											Guardar
										</Button>
									</Grid>
									<Grid item xs={6}>
										<Button variant="outlined" color="secondary" fullWidth onClick={() => navigate(`/catalogo/${id}`)}>
											Cancelar
										</Button>
									</Grid>

									{(publicacionActiva || publicacionPausada) && (
										<Grid item xs={12}>
											<Typography variant="caption" color="text.secondary">
												⚠ Este auto está publicado en MercadoLibre — los cambios que guardes acá se reflejan también ahí.
											</Typography>
										</Grid>
									)}

									{!confirmandoEliminar ? (
										<Grid item xs={12}>
											<Button variant="outlined" color="error" fullWidth onClick={() => setConfirmandoEliminar(true)}>
												Eliminar auto
											</Button>
										</Grid>
									) : (
										<Grid item xs={12}>
											<Alert severity="warning" sx={{ mb: 1 }}>
												¿Confirmás? Esta acción es irreversible
												{(publicacionActiva || publicacionPausada) &&
													" y también elimina la publicación de MercadoLibre"}
												.
											</Alert>
											<Grid container spacing={1}>
												<Grid item xs={6}>
													<Button variant="outlined" fullWidth onClick={() => setConfirmandoEliminar(false)}>
														Cancelar
													</Button>
												</Grid>
												<Grid item xs={6}>
													<Button variant="contained" color="error" fullWidth onClick={handleDeleteAuto}>
														Sí, eliminar
													</Button>
												</Grid>
											</Grid>
										</Grid>
									)}
								</Grid>
							</CardContent>
						</MotionCard>
					</Grid>

					{/* Benefits */}
					<Grid item xs={12}>
						<BenefitsCard />
					</Grid>
				</Grid>

				<Grid item xs={12}>
					<CardsRelacionados categorias={categorias} idAutoActual={auto.id} />
				</Grid>
			</Container>
		</>
	);
}
