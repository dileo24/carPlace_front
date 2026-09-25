import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Container,
	Card,
	Typography,
	Grid,
	TextField,
	Button,
	Checkbox,
	FormControlLabel,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	Box,
	Alert,
	CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import {
	tiposCombustible,
	tiposTransmision,
	tiposTraccion,
	categoriaToCreate,
	tiposColor,
	MAX_COMBUSTIBLES,
	MAX_TRANSMISIONES,
	MAX_TRACCIONES,
} from "../../data/filters";
import ColorSwatch from "../../components/ColorSwatch/ColorSwatch";
import MultiSelectChecklist from "../../components/MultiSelectChecklist/MultiSelectChecklist";
import NuevaPublicacionDrawer from "../../components/CRM/Publicaciones/NuevaPublicacionDrawer/NuevaPublicacionDrawer";
import { useAuth } from "../../context/AuthContext";
import { postAuto, postImagen, updateImgInAuto } from "../../services/autos.service";
import { syncTareasAlistaje } from "../../services/autos.service";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useDragSensors } from "../../hooks/useDragSensors";
import DraggableImage from "../../components/DraggableImage/DraggableImage";
import { useMarcas } from "../../hooks/useMarcas";
import { TAREAS_ALISTAJE_TEMPLATES, generateTareaId } from "../../constants/crmStock";

const MotionCard = motion(Card);
const MAX_IMAGES = 20;

const TIPOS_VEHICULO = [
	{ value: "patrimonio", label: "Patrimonio propio" },
	{ value: "consignacion", label: "Consignación" },
	{ value: "consignacion_online", label: "Consignación online" },
];

const ESTADOS_VEHICULO = [
	{ value: "disponible", label: "Disponible" },
	{ value: "senado", label: "Señado" },
	{ value: "vendido", label: "Vendido" },
];

const PROPIETARIO_VEHICULO = [
	{ value: "agencia", label: "Agencia" },
	{ value: "socio", label: "Socio" },
	{ value: "compartido", label: "Compartido 50/50" },
];

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function NuevoAuto() {
	const hoy = new Date();
	const mesActual = MESES[hoy.getMonth()];
	const mesAnterior = MESES[hoy.getMonth() === 0 ? 11 : hoy.getMonth() - 1];
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { marcas: marcasCatalogo } = useMarcas();

	const [formData, setFormData] = useState({
		marca: "",
		modelo: "",
		motor: "",
		anio: "",
		km: "",
		transmision: "",
		combustible: "",
		traccion: "",
		color: "",
		moneda: "AR$",
		precio: "",
		destacar: false,
		oferta: false,
		precio_oferta: "",
		precio_contado: "",
		img: [],
		id_categ: [],
		tipo: "",
		estado: "disponible",
		fecha_recepcion: "",
		propietario: "agencia",
		precio_compra: "",
		fecha_compra: "",
		precio_info_mes_anterior: "",
		precio_info_mes_actual: "",
		precio_cliente: "",
		notas: "",
		visible: true,
		oferta_reventa: false,
		notas_reventa: "",
	});

	// ── Alistaje ──
	const [tareas, setTareas] = useState([]);
	const [nuevaTarea, setNuevaTarea] = useState("");

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [images, setImages] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [years, setYears] = useState([]);
	const [imageError, setImageError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const dragSensors = useDragSensors();

	// Auto recién creado, esperando que el admin decida si lo publica en
	// MercadoLibre antes de navegar a su ficha (ver handleSubmit).
	const [autoParaPublicar, setAutoParaPublicar] = useState(null);
	const [destinoNavegacion, setDestinoNavegacion] = useState(null);

	useEffect(() => {
		const currentYear = new Date().getFullYear();
		const yearsArray = [];
		for (let i = currentYear; i >= 1990; i--) yearsArray.push(i);
		setYears(yearsArray);
	}, []);

	useEffect(() => {
		sessionStorage.removeItem("catalogoRestore");
		localStorage.removeItem("catalogoFilters");
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	// ── Tareas ──
	function handleAgregarTarea(texto) {
		const t = texto.trim();
		if (!t) return;
		setTareas((prev) => [...prev, { id: generateTareaId(), texto: t, hecha: false }]);
		setNuevaTarea("");
	}

	function eliminarTarea(id) {
		setTareas((prev) => prev.filter((t) => t.id !== id));
	}

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name === "oferta_reventa" && !checked) {
			setFormData((prev) => ({ ...prev, oferta_reventa: false, notas_reventa: "" }));
			return;
		}
		if (name === "tipo" && value !== "consignacion" && value !== "consignacion_online") {
			setFormData((prev) => ({ ...prev, tipo: value, precio_cliente: "" }));
			return;
		}
		const camposNumericos = [
			"precio",
			"precio_contado",
			"precio_oferta",
			"km",
			"precio_info_mes_anterior",
			"precio_info_mes_actual",
			"precio_cliente",
			"precio_compra",
		];
		if (camposNumericos.includes(name)) {
			const isNumeric = /^[\d.]+$/.test(value.trim());
			if (isNumeric) {
				const numericValue = value.replace(/[^0-9.]/g, "").replace(/\./g, "");
				const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
				setFormData((prev) => ({ ...prev, [name]: formattedValue }));
			} else {
				setFormData((prev) => ({ ...prev, [name]: value }));
			}
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : value,
			}));
		}
		if (submitError) setSubmitError(null);
	};

	const handleCategoryChange = (event) => {
		const { value } = event.target;
		setFormData((prev) => ({
			...prev,
			id_categ: typeof value === "string" ? value.split(",") : value,
		}));
	};

	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		setImageError("");
		if (images.length + files.length > MAX_IMAGES) {
			setImageError(`Solo podés subir un máximo de ${MAX_IMAGES} imágenes.`);
			return;
		}
		setImages((prev) => [...prev, ...files]);
		setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
	};

	const handleRemoveImage = (index) => {
		const newImages = [...images];
		newImages.splice(index, 1);
		setImages(newImages);
		const newPreviews = [...imagePreviews];
		URL.revokeObjectURL(newPreviews[index]);
		newPreviews.splice(index, 1);
		setImagePreviews(newPreviews);
		setImageError("");
		if (selectedImageIndex === index) setSelectedImageIndex(0);
	};

	const moveImage = (fromIndex, toIndex) => {
		const updatedImages = [...images];
		const [movedImage] = updatedImages.splice(fromIndex, 1);
		updatedImages.splice(toIndex, 0, movedImage);
		setImages(updatedImages);

		const updatedPreviews = [...imagePreviews];
		const [movedPreview] = updatedPreviews.splice(fromIndex, 1);
		updatedPreviews.splice(toIndex, 0, movedPreview);
		setImagePreviews(updatedPreviews);

		if (selectedImageIndex === fromIndex) {
			setSelectedImageIndex(toIndex);
		} else if (
			(fromIndex < selectedImageIndex && toIndex >= selectedImageIndex) ||
			(fromIndex > selectedImageIndex && toIndex <= selectedImageIndex)
		) {
			setSelectedImageIndex((prev) => prev + (fromIndex < toIndex ? -1 : 1));
		}
	};

	const handleImageDragEnd = (event) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const fromIndex = imagePreviews.indexOf(active.id);
		const toIndex = imagePreviews.indexOf(over.id);
		if (fromIndex !== -1 && toIndex !== -1) moveImage(fromIndex, toIndex);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitError(null);

		if (images.length === 0) {
			setImageError("Debés subir al menos una imagen");
			setIsSubmitting(false);
			return;
		}

		try {
			// Calcular en_alistaje según tareas pendientes
			const en_alistaje = tareas.length > 0 && tareas.some((t) => !t.hecha);
			const autoResponse = await postAuto({ ...formData, en_alistaje });
			const autoId = autoResponse.data.id;
			const autoModelo = `${formData.marca}-${formData.modelo}`;

			// Subir imágenes
			const fileNamesArray = [];
			for (const [index, image] of images.entries()) {
				try {
					const formDataImg = new FormData();
					formDataImg.append("file", image);
					const uploadResponse = await postImagen(formDataImg);
					if (uploadResponse.data.fileName) fileNamesArray.push(uploadResponse.data.url);
				} catch (uploadError) {
					console.error(`Error subiendo imagen ${index + 1}:`, uploadError);
				}
			}

			if (fileNamesArray.length === 0) throw new Error("No se pudo subir ninguna imagen");
			await updateImgInAuto(autoId, fileNamesArray);

			// Sincronizar tareas si hay alguna
			if (tareas.length > 0) {
				const tareasParaSync = tareas.map((t) => ({
					texto: t.texto,
					hecha: t.hecha,
				}));
				await syncTareasAlistaje(autoId, tareasParaSync);
			}

			// El auto ya quedó creado y guardado — de acá en más, publicar en
			// MercadoLibre es opcional y no debe poder "perder" el auto recién
			// cargado si algo falla (sin cupo, ML caído, etc.): por eso primero
			// se ofrece publicar en un diálogo aparte, y recién al cerrarlo
			// (se publique o no) se navega a la ficha del auto ya creado.
			setAutoParaPublicar({ id: autoId, marca: formData.marca, modelo: formData.modelo, anio: formData.anio });
			setDestinoNavegacion(`/catalogo/${autoId}/${autoModelo}`);
		} catch (error) {
			console.error("Error en el proceso:", error);
			setSubmitError(error.response?.data?.message || "Ocurrió un error al crear el auto.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const filteredCombustible = tiposCombustible.filter((opt) => opt.value !== "");
	const filteredTransmision = tiposTransmision.filter((opt) => opt.value !== "");
	const filteredTraccion = tiposTraccion.filter((opt) => opt.value !== "");

	// 0km por categoría elegida o porque todavía no se cargó kilometraje —
	// solo en estos casos tiene sentido ofrecer "Consultar precio" (el precio
	// de los 0km cambia seguido y a veces el admin prefiere no mostrarlo).
	const es0km = formData.id_categ.includes("7") || !formData.km || formData.km === "0";

	return (
		<>
			{isAuthenticated && (
				<>
					<Container maxWidth="lg" sx={{ mt: 10, mb: 10 }}>
						<MotionCard
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							sx={{
								borderRadius: 4,
								background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
								boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
								p: 4,
							}}
						>
							<form
								onSubmit={handleSubmit}
								style={{
									maxWidth: "100%",
									boxShadow: "none",
									padding: "0px",
									background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
								}}
							>
								<Grid container spacing={3}>
									{/* ── Título sección ── */}
									<Grid item xs={12}>
										<Typography variant="h5" component="h1" gutterBottom>
											Crear Nuevo Auto
										</Typography>
									</Grid>

									{/* ── Datos básicos ── */}
									<Grid item xs={12} md={3}>
										<FormControl fullWidth required>
											<InputLabel>Marca</InputLabel>
											<Select
												name="marca"
												value={formData.marca}
												onChange={handleChange}
												label="Marca"
												MenuProps={{ disableScrollLock: true }}
											>
												{marcasCatalogo.map((m) => (
													<MenuItem key={m.id} value={m.nombre}>
														{m.nombre}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} md={9}>
										<TextField
											autoComplete="off"
											label="Modelo"
											name="modelo"
											value={formData.modelo}
											onChange={handleChange}
											fullWidth
											required
										/>
									</Grid>

									<Grid item xs={12} md={2}>
										<TextField
											autoComplete="off"
											label="Motor"
											name="motor"
											value={formData.motor}
											onChange={handleChange}
											fullWidth
											required
										/>
									</Grid>

									<Grid item xs={12} md={2}>
										<FormControl fullWidth required>
											<InputLabel>Año</InputLabel>
											<Select name="anio" value={formData.anio} onChange={handleChange} label="Año" MenuProps={{ disableScrollLock: true }}>
												{years.map((y) => (
													<MenuItem key={y} value={y}>
														{y}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} md={2}>
										<TextField autoComplete="off" label="Kilometraje" name="km" value={formData.km} onChange={handleChange} fullWidth />
									</Grid>

									<Grid item xs={12} md={3}>
										<FormControl fullWidth required>
											<InputLabel>Categoría</InputLabel>
											<Select
												multiple
												name="id_categ"
												value={formData.id_categ}
												onChange={handleCategoryChange}
												label="Categoría"
												MenuProps={{ disableScrollLock: true }}
											>
												{categoriaToCreate.map((o) => (
													<MenuItem key={o.value} value={o.value}>
														{o.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} md={3}>
										<MultiSelectChecklist
											label="Transmisión"
											name="transmision"
											value={formData.transmision}
											options={filteredTransmision}
											max={MAX_TRANSMISIONES}
											onChange={handleChange}
										/>
									</Grid>

									<Grid item xs={12} md={3}>
										<MultiSelectChecklist
											label="Combustible"
											name="combustible"
											value={formData.combustible}
											options={filteredCombustible}
											max={MAX_COMBUSTIBLES}
											onChange={handleChange}
										/>
									</Grid>

									<Grid item xs={12} md={3}>
										<MultiSelectChecklist
											label="Tracción"
											name="traccion"
											value={formData.traccion}
											options={filteredTraccion}
											max={MAX_TRACCIONES}
											onChange={handleChange}
										/>
									</Grid>

									<Grid item xs={12} md={3}>
										<FormControl fullWidth required>
											<InputLabel>Color</InputLabel>
											<Select
												name="color"
												value={formData.color}
												onChange={handleChange}
												label="Color"
												MenuProps={{ disableScrollLock: true }}
											>
												{tiposColor.map((o) => (
													<MenuItem key={o.value} value={o.value}>
														<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
															<ColorSwatch color={o.value} size={24} />
															<span>{o.label}</span>
														</Box>
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									{/* ── Precios ── */}
									<Grid item xs={12} md={3}>
										<Box display="flex" alignItems="center">
											<TextField
												autoComplete="off"
												label="Precio"
												name="precio"
												value={formData.precio}
												onChange={handleChange}
												fullWidth
												helperText={es0km ? "Vacío = se muestra \"Consultar precio\" en el sitio" : ""}
											/>
											<FormControl sx={{ ml: 2, minWidth: 80 }}>
												<Select name="moneda" value={formData.moneda} onChange={handleChange} MenuProps={{ disableScrollLock: true }}>
													<MenuItem value="AR$">AR$</MenuItem>
													<MenuItem value="U$D">U$D</MenuItem>
												</Select>
											</FormControl>
										</Box>
									</Grid>

									<Grid item xs={12} md={3}>
										<TextField
											autoComplete="off"
											label="Precio contado"
											name="precio_contado"
											value={formData.precio_contado}
											onChange={handleChange}
											fullWidth
										/>
									</Grid>

									<Grid item xs={12} md={6}>
										<Box display="flex" alignItems="center" gap={2}>
											<FormControlLabel
												control={<Checkbox name="oferta" checked={formData.oferta} onChange={handleChange} />}
												label="En oferta"
											/>
											{formData.oferta && (
												<TextField
													autoComplete="off"
													label="Precio de oferta"
													name="precio_oferta"
													value={formData.precio_oferta}
													onChange={handleChange}
													sx={{ width: "65%" }}
													required
												/>
											)}
										</Box>
									</Grid>

									<Grid item xs={12} md={6}>
										<FormControlLabel
											control={<Checkbox name="destacar" checked={formData.destacar} onChange={handleChange} />}
											label="Destacar este vehículo"
										/>
									</Grid>

									{/* ── Separador CRM ── */}
									<Grid item xs={12}>
										<Typography
											variant="subtitle1"
											fontWeight={600}
											sx={{ mt: 1, mb: 0, color: "#555", borderTop: "1px solid #e0e0e0", pt: 2 }}
										>
											Datos internos (CRM)
										</Typography>
										<Typography variant="caption" sx={{ color: "#999" }}>
											Campos opcionales — podés completarlos ahora o desde el CRM después.
										</Typography>
									</Grid>

									<Grid item xs={12} md={4}>
										<FormControl fullWidth>
											<InputLabel>Tipo de vehículo</InputLabel>
											<Select
												name="tipo"
												value={formData.tipo}
												onChange={handleChange}
												label="Tipo de vehículo"
												MenuProps={{ disableScrollLock: true }}
											>
												<MenuItem value="">
													<em>Sin especificar</em>
												</MenuItem>
												{TIPOS_VEHICULO.map((t) => (
													<MenuItem key={t.value} value={t.value}>
														{t.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} md={4}>
										<FormControl fullWidth>
											<InputLabel>Estado</InputLabel>
											<Select
												name="estado"
												value={formData.estado}
												onChange={handleChange}
												label="Estado"
												MenuProps={{ disableScrollLock: true }}
											>
												{ESTADOS_VEHICULO.map((e) => (
													<MenuItem key={e.value} value={e.value}>
														{e.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} md={4}>
										<TextField
											label="Fecha de recepción"
											name="fecha_recepcion"
											type="date"
											value={formData.fecha_recepcion}
											onChange={handleChange}
											fullWidth
											InputLabelProps={{ shrink: true }}
										/>
									</Grid>

									<Grid item xs={12} md={4}>
										<TextField
											autoComplete="off"
											label={`Precio InfoAuto ${mesAnterior}`}
											name="precio_info_mes_anterior"
											value={formData.precio_info_mes_anterior}
											onChange={handleChange}
											fullWidth
											placeholder="ej: 18.500.000"
										/>
									</Grid>

									<Grid item xs={12} md={4}>
										<TextField
											autoComplete="off"
											label={`Precio InfoAuto ${mesActual}`}
											name="precio_info_mes_actual"
											value={formData.precio_info_mes_actual}
											onChange={handleChange}
											fullWidth
											placeholder="ej: 19.200.000"
										/>
									</Grid>

									{(formData.tipo === "consignacion" || formData.tipo === "consignacion_online") && (
										<Grid item xs={12} md={4}>
											<TextField
												autoComplete="off"
												label="Precio de cliente"
												name="precio_cliente"
												value={formData.precio_cliente}
												onChange={handleChange}
												fullWidth
												placeholder="ej: 21.300.000"
											/>
										</Grid>
									)}

									<Grid item xs={12} md={4}>
										<FormControl fullWidth>
											<InputLabel>Propietario</InputLabel>
											<Select
												name="propietario"
												value={formData.propietario}
												onChange={handleChange}
												label="Propietario"
												MenuProps={{ disableScrollLock: true }}
											>
												{PROPIETARIO_VEHICULO.map((p) => (
													<MenuItem key={p.value} value={p.value}>
														{p.label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} md={4}>
										<TextField
											label="Fecha de compra"
											name="fecha_compra"
											type="date"
											value={formData.fecha_compra}
											onChange={handleChange}
											fullWidth
											InputLabelProps={{ shrink: true }}
										/>
									</Grid>

									<Grid item xs={12} md={4}>
										<TextField
											autoComplete="off"
											label="Precio de compra"
											name="precio_compra"
											value={formData.precio_compra}
											onChange={handleChange}
											fullWidth
											placeholder="ej: 15.000.000"
										/>
									</Grid>

									<Grid item xs={12}>
										<TextField
											label="Características Detalladas"
											name="notas"
											value={formData.notas}
											onChange={handleChange}
											fullWidth
											multiline
											rows={3}
											placeholder="Observaciones, historial, señas recibidas…"
										/>
									</Grid>

									<Grid item xs={12} md={4}>
										<FormControlLabel
											control={<Checkbox name="visible" checked={formData.visible} onChange={handleChange} />}
											label="Visible en catálogo"
										/>
									</Grid>

									<Grid item xs={12} md={4}>
										<FormControlLabel
											control={<Checkbox name="oferta_reventa" checked={formData.oferta_reventa} onChange={handleChange} />}
											label="Visible en liquidación"
										/>
									</Grid>

									{formData.oferta_reventa && (
										<Grid item xs={12} md={6}>
											<TextField
												autoComplete="off"
												label={`Precio InfoAuto ${mesActual}`}
												name="precio_info_mes_actual"
												value={formData.precio_info_mes_actual}
												onChange={handleChange}
												fullWidth
												placeholder="ej: 19.200.000"
											/>
										</Grid>
									)}

									{formData.oferta_reventa && (
										<Grid item xs={12}>
											<TextField
												label="Notas de reventa"
												name="notas_reventa"
												value={formData.notas_reventa}
												onChange={handleChange}
												fullWidth
												multiline
												rows={3}
												placeholder="Detalles estéticos, mecánicos o condiciones especiales de la unidad en reventa…"
											/>
										</Grid>
									)}

									{/* ── Alistaje ── */}
									<Grid item xs={12}>
										<Typography
											variant="subtitle1"
											fontWeight={600}
											sx={{ mt: 1, mb: 0, color: "#555", borderTop: "1px solid #e0e0e0", pt: 2 }}
										>
											Alistaje
										</Typography>
										<Typography variant="caption" sx={{ color: "#999" }}>
											Agregá las tareas pendientes antes de publicar el vehículo.
										</Typography>
									</Grid>

									<Grid item xs={12}>
										{/* Lista de tareas agregadas */}
										{tareas.length > 0 && (
											<Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
												{tareas.map((t) => (
													<Box
														key={t.id}
														sx={{
															display: "flex",
															alignItems: "center",
															gap: 1.5,
															p: "10px 14px",
															background: "#f9f9f9",
															border: "1px solid #e0e0e0",
															borderRadius: "8px",
														}}
													>
														<Box
															sx={{
																width: 18,
																height: 18,
																borderRadius: "4px",
																border: "1.5px solid #ccc",
																flexShrink: 0,
															}}
														/>
														<Typography sx={{ flex: 1, fontSize: 14, color: "#333" }}>{t.texto}</Typography>
														<Button
															size="small"
															onClick={() => eliminarTarea(t.id)}
															sx={{ minWidth: 0, p: 0.5, color: "#bbb", "&:hover": { color: "#e53935" } }}
														>
															<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
																<path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
															</svg>
														</Button>
													</Box>
												))}
											</Box>
										)}

										{/* Input nueva tarea */}
										<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
											<TextField
												autoComplete="off"
												size="small"
												placeholder="Agregar tarea…"
												value={nuevaTarea}
												onChange={(e) => setNuevaTarea(e.target.value)}
												onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAgregarTarea(nuevaTarea))}
												fullWidth
											/>
											<Button
												variant="outlined"
												onClick={() => handleAgregarTarea(nuevaTarea)}
												disabled={!nuevaTarea.trim()}
												sx={{ minWidth: 44, px: 1.5, fontSize: 20, lineHeight: 1 }}
											>
												+
											</Button>
										</Box>

										{/* Templates */}
										<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
											{TAREAS_ALISTAJE_TEMPLATES.filter((tmpl) => !tareas.some((t) => t.texto === tmpl)).map((tmpl) => (
												<Box
													key={tmpl}
													onClick={() => handleAgregarTarea(tmpl)}
													sx={{
														px: 1.5,
														py: 0.5,
														borderRadius: "6px",
														border: "1px solid #e0e0e0",
														fontSize: 12,
														color: "#666",
														cursor: "pointer",
														userSelect: "none",
														transition: "all 0.15s",
														"&:hover": {
															borderColor: "#bbb",
															color: "#333",
															background: "#f5f5f5",
														},
													}}
												>
													+ {tmpl}
												</Box>
											))}
										</Box>
									</Grid>

									{/* ── Imágenes ── */}
									<Grid item xs={12}>
										<Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, borderTop: "1px solid #e0e0e0", pt: 2 }}>
											Imágenes del vehículo (Máximo {MAX_IMAGES})
										</Typography>
										<Box sx={{ display: "flex", flexDirection: "column" }}>
											<Button
												variant="outlined"
												component="label"
												sx={{ width: "fit-content" }}
												disabled={images.length >= MAX_IMAGES || isSubmitting}
											>
												Seleccionar imágenes
												<input
													type="file"
													accept="image/*"
													multiple
													onChange={handleImageUpload}
													hidden
													disabled={images.length >= MAX_IMAGES || isSubmitting}
												/>
											</Button>
											{images.length > 0 && (
												<Typography variant="caption" sx={{ mt: 1 }}>
													{images.length} archivo(s) seleccionado(s)
												</Typography>
											)}
											{imageError && (
												<Alert severity="error" sx={{ mt: 1 }}>
													{imageError}
												</Alert>
											)}
										</Box>
										{imagePreviews.length > 0 && (
											<Box sx={{ display: "flex", gap: 2, overflowX: "auto", py: 2 }}>
							<DndContext sensors={dragSensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
								<SortableContext items={imagePreviews} strategy={horizontalListSortingStrategy}>
									{imagePreviews.map((preview, index) => (
										<DraggableImage
											key={preview}
											image={preview}
											index={index}
											onClick={() => setSelectedImageIndex(index)}
											isSelected={index === selectedImageIndex}
											onRemove={() => handleRemoveImage(index)}
											isEditing={true}
											isAuthenticated={isAuthenticated}
										/>
									))}
								</SortableContext>
							</DndContext>
											</Box>
										)}
									</Grid>

									{submitError && (
										<Grid item xs={12}>
											<Alert severity="error" sx={{ mb: 2 }}>
												{submitError}
											</Alert>
										</Grid>
									)}

									<Grid item xs={12}>
										<Box display="flex" justifyContent="flex-end" gap={2}>
											<Button variant="outlined" color="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
												Cancelar
											</Button>
											<Button
												type="submit"
												variant="contained"
												color="primary"
												disabled={isSubmitting}
												startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
											>
												{isSubmitting ? "Creando..." : "Crear Auto"}
											</Button>
										</Box>
									</Grid>
								</Grid>
							</form>
						</MotionCard>
					</Container>
				</>
			)}

			<NuevaPublicacionDrawer
				open={!!autoParaPublicar}
				autoInicial={autoParaPublicar}
				onClose={() => {
					setAutoParaPublicar(null);
					if (destinoNavegacion) navigate(destinoNavegacion);
				}}
				onCreated={() => {
					setAutoParaPublicar(null);
					if (destinoNavegacion) navigate(destinoNavegacion);
				}}
			/>
		</>
	);
}
