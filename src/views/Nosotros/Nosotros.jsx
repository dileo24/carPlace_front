import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { socialLinks } from "../../data/info";
import Sucursales from "../../components/Sucursales/Sucursales";
import HeroNosotros from "../../components/HeroNosotros/HeroNosotros";
import img2Nosotros from "../../assets/img2_nosotros.webp";
import "./Nosotros.css";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

const IconTel = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<rect x="7" y="2.5" width="10" height="19" rx="2.5" />
		<path d="M10 5h4" />
		<circle cx="12" cy="18.5" r="0.8" />
	</svg>
);

const IconClock = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);

const IconShare = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<line x1="22" y1="2" x2="11" y2="13" />
		<polygon points="22 2 15 22 11 13 2 9 22 2" />
	</svg>
);

const IconClose = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

const IconDrag = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
		<circle cx="9" cy="6" r="1.5" />
		<circle cx="15" cy="6" r="1.5" />
		<circle cx="9" cy="12" r="1.5" />
		<circle cx="15" cy="12" r="1.5" />
		<circle cx="9" cy="18" r="1.5" />
		<circle cx="15" cy="18" r="1.5" />
	</svg>
);

const IconUpload = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		width="18"
		height="18"
	>
		<polyline points="16 16 12 12 8 16" />
		<line x1="12" y1="12" x2="12" y2="21" />
		<path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
	</svg>
);

export default function Nosotros() {
	const [carouselImages, setCarouselImages] = useState([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [fade, setFade] = useState(true);
	const [dragOverIndex, setDragOverIndex] = useState(null);
	const dragItemIndex = useRef(null);
	const intervalRef = useRef(null);
	const { isAuthenticated, userRol } = useAuth();
	const [deletingImage, setDeletingImage] = useState(null);

	useEffect(() => {
		const hash = window.location.hash;
		if (hash) {
			// Espera a que el DOM renderice antes de hacer scroll
			setTimeout(() => {
				const el = document.querySelector(hash);
				if (el) el.scrollIntoView({ behavior: "smooth" });
			}, 100);
		} else {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, []);
	useEffect(() => {
		fetchCarouselImages();
	}, []);

	const startInterval = useCallback(() => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		intervalRef.current = setInterval(() => {
			setFade(false);
			setTimeout(() => {
				setActiveIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
				setFade(true);
			}, 300);
		}, 3000);
	}, [carouselImages.length]);

	useEffect(() => {
		if (carouselImages.length <= 1) {
			if (intervalRef.current) clearInterval(intervalRef.current);
			return;
		}
		startInterval();
		return () => clearInterval(intervalRef.current);
	}, [carouselImages.length, startInterval]);

	const fetchCarouselImages = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/files/carousel`);
			const data = await response.json();
			if (data.resp) {
				setCarouselImages(data.files);
			}
		} catch (error) {
			console.error("Error fetching carousel images:", error);
		}
	};

	const handleImageUpload = async (e) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		setIsUploading(true);
		const formData = new FormData();
		for (let i = 0; i < files.length; i++) {
			formData.append("files", files[i]);
		}

		try {
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/files/carousel`, formData);
			const data = response.data;
			if (data.resp) {
				await fetchCarouselImages();
				if (carouselImages.length === 0) setActiveIndex(0);
			} else {
				alert(data.message || "Error al cargar imágenes");
			}
		} catch (error) {
			console.error("Error uploading images:", error);
			alert("Error al cargar imágenes");
		} finally {
			setIsUploading(false);
			e.target.value = "";
		}
	};

	const handleRemoveImage = async (e, fileName) => {
		e.stopPropagation();

		setDeletingImage(fileName);

		try {
			await new Promise((resolve) => setTimeout(resolve, 450));

			const response = await axios.delete(`${import.meta.env.VITE_API_URL}/files/carousel/${encodeURIComponent(fileName)}`);

			const data = response.data;

			if (data.resp) {
				await fetchCarouselImages();

				setActiveIndex((prev) => (prev >= carouselImages.length - 1 ? Math.max(0, carouselImages.length - 2) : prev));
			} else {
				alert(data.message || "Error al eliminar imagen");
			}
		} catch (error) {
			console.error("Error deleting image:", error);
			alert("Error al eliminar imagen");
		} finally {
			setDeletingImage(null);
		}
	};

	/* ── Drag & drop reordering ── */
	const handleDragStart = (e, index) => {
		dragItemIndex.current = index;
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e, index) => {
		e.preventDefault();
		setDragOverIndex(index);
	};

	const handleDrop = async (e, index) => {
		e.preventDefault();
		const from = dragItemIndex.current;
		if (from === null || from === index) {
			setDragOverIndex(null);
			return;
		}

		const updated = [...carouselImages];
		const [moved] = updated.splice(from, 1);
		updated.splice(index, 0, moved);

		setCarouselImages(updated);
		setActiveIndex(index);
		dragItemIndex.current = null;
		setDragOverIndex(null);

		try {
			const order = updated.map((img) => img.fileName);
			await axios.patch(`${import.meta.env.VITE_API_URL}/files/carousel/reorder`, { order });
		} catch (err) {
			console.error("Error al guardar el orden:", err);
		}
	};

	const handleDragEnd = () => {
		dragItemIndex.current = null;
		setDragOverIndex(null);
	};

	const currentImage = carouselImages[activeIndex];

	return (
		<div className="pagina-nosotros">
			<HeroNosotros />

			{/* ── NUESTRA FILOSOFÍA ── */}
			<section className="filosofia-seccion">
				<motion.div
					className="filosofia-encabezado"
					initial={{ opacity: 0, y: 28 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					<h2 className="filosofia-titulo">NUESTRA FILOSOFÍA</h2>
					<div className="acento-linea" />
				</motion.div>

				<div className="filosofia-contenedor">
					<motion.div
						className="filosofia-panel"
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.35 }}
					>
						{/* ── COLUMNA IZQUIERDA: carrusel o imagen estática ── */}
						<div className="filosofia-imagen-col">
							{carouselImages.length > 0 ? (
								<>
									<img
										key={activeIndex}
										src={currentImage.url}
										alt={`Carrusel ${activeIndex + 1}`}
										className={`filosofia-imagen filosofia-imagen-carousel ${fade ? "carousel-fade-in" : "carousel-fade-out"}`}
									/>
								</>
							) : (
								<img src={img2Nosotros} alt="SportQuatro" className="filosofia-imagen" />
							)}

							<div className="filosofia-badge">
								<span className="filosofia-badge-numero">+25</span>
								<span className="filosofia-badge-texto">
									años de
									<br />
									trayectoria
								</span>
							</div>
						</div>

						{/* ── COLUMNA DERECHA: texto ── */}
						<div className="filosofia-texto-col">
							<h2 className="filosofia-subtitulo">
								Cercanía que
								<br />
								<span className="texto-rojo">marca la diferencia</span>
							</h2>
							<p className="filosofia-parrafo">
								Esta frase nos representa ya que somos una <strong>empresa familiar</strong>, con una estructura ágil que nos permite
								brindar una atención cercana y personalizada. Cada operación se gestiona de forma <strong>directa con sus dueños</strong>,
								logrando un trato más claro, confiable y humano.
							</p>
							<p className="filosofia-parrafo">
								Nos enfocamos en que todo el proceso sea simple, transparente y sin complicaciones. Buscamos no solo concretar una venta,
								sino <strong>construir relaciones a largo plazo</strong>, generando confianza y una experiencia que invite a volver.
							</p>

							{/* ── PANEL DE ADMIN (solo autenticado) ── */}
							{isAuthenticated && userRol === ROLES.ADMIN && (
								<div className="carousel-admin">
									{/* thumbnails arrastrables */}
									{carouselImages.length > 0 && (
										<div className="carousel-admin-thumbs">
											{carouselImages.map((img, i) => (
												<motion.div
													key={i}
													layout
													initial={false}
													animate={
														deletingImage === (img.id || img.fileName)
															? {
																	scale: 0.6,
																	opacity: 0,
																	rotate: -8,
																	filter: "blur(6px)",
																}
															: {
																	scale: 1,
																	opacity: 1,
																	rotate: 0,
																	filter: "blur(0px)",
																}
													}
													transition={{ duration: 0.45 }}
													className={`carousel-thumb ${i === activeIndex ? "carousel-thumb--active" : ""} ${
														dragOverIndex === i ? "carousel-thumb--dragover" : ""
													}`}
													draggable
													onDragStart={(e) => handleDragStart(e, i)}
													onDragOver={(e) => handleDragOver(e, i)}
													onDrop={(e) => handleDrop(e, i)}
													onDragEnd={handleDragEnd}
													onClick={() => setActiveIndex(i)}
												>
													<img src={img.url} alt={`Thumb ${i + 1}`} />
													<div className="carousel-thumb-drag">
														<IconDrag />
													</div>
													<button
														className="carousel-thumb-remove"
														onClick={(e) => handleRemoveImage(e, img.id || img.fileName)}
														title="Eliminar imagen"
														disabled={deletingImage === (img.id || img.fileName)}
													>
														<IconClose />
													</button>
												</motion.div>
											))}
										</div>
									)}

									{/* botón de carga */}
									<div className="carousel-upload-wrap">
										<input
											accept="image/*"
											id="carousel-upload"
											type="file"
											multiple
											onChange={handleImageUpload}
											style={{ display: "none" }}
											disabled={carouselImages.length >= 20 || isUploading}
										/>
										<label
											htmlFor="carousel-upload"
											className={`carousel-upload-btn ${carouselImages.length >= 20 || isUploading ? "carousel-upload-btn--disabled" : ""}`}
										>
											{isUploading ? (
												<>
													<span className="carousel-upload-spinner" />
													Subiendo...
												</>
											) : (
												<>
													<IconUpload />
													{carouselImages.length >= 20 ? "Máximo alcanzado (20/20)" : `Agregar imágenes (${carouselImages.length}/20)`}
												</>
											)}
										</label>
									</div>
								</div>
							)}
						</div>
					</motion.div>
				</div>
			</section>

			{/* ── CONTACTO ── */}
			<section id="contacto" className="contacto-seccion">
				<div className="contacto-pin-decorativo" aria-hidden="true">
					<svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M100 10 C55 10 20 45 20 90 C20 140 100 220 100 220 C100 220 180 140 180 90 C180 45 145 10 100 10Z"
							stroke="#cc0000"
							strokeWidth="2"
							fill="none"
							opacity="0.08"
						/>
						<circle cx="100" cy="90" r="28" stroke="#cc0000" strokeWidth="2" fill="none" opacity="0.08" />
					</svg>
				</div>

				<div className="contacto-contenedor">
					<motion.div
						className="contacto-encabezado"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<span className="contacto-etiqueta">Contactanos</span>
						<h2 className="contacto-titulo">
							<span>
								Estamos para <span className="texto-rojo">ayudarte.</span>
							</span>
						</h2>
						<p className="contacto-subtitulo">
							Elegí el canal que te resulte más cómodo.
							<br />
							Te respondemos rápido.
						</p>
					</motion.div>

					<div className="contacto-tarjetas">
						{[
							{
								icon: <IconTel />,
								label: "Teléfono",
								href: "tel:+543513207804",
								isPhone: true,
								content: <p className="contacto-tarjeta-texto">351 320 7804</p>,
							},
							{
								icon: <IconShare />,
								label: "Redes sociales",
								content: (
									<div className="contacto-redes">
										{socialLinks.map((s, i) => (
											<a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="contacto-red-link">
												<FontAwesomeIcon icon={s.icon} style={{ color: s.color, fontSize: "1.6rem" }} />
											</a>
										))}
									</div>
								),
							},
							{
								icon: <IconClock />,
								label: "Horario de atención",
								content: <p className="contacto-tarjeta-texto">Lun a Vie: 9:30 a 13:00 y de 16:00 a 20:00</p>,
							},
						].map((tarjeta, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.45, delay: i * 0.1 }}
							>
								{tarjeta.isPhone ? (
									<a href={tarjeta.href} className="contacto-tarjeta contacto-tarjeta-link">
										<div className="contacto-tarjeta-icono">{tarjeta.icon}</div>
										<div className="contacto-tarjeta-divisor" />
										<div className="contacto-tarjeta-cuerpo">
											<p className="contacto-tarjeta-etiqueta">{tarjeta.label}</p>
											{tarjeta.content}
										</div>
									</a>
								) : (
									<div className="contacto-tarjeta">
										<div className="contacto-tarjeta-icono">{tarjeta.icon}</div>
										<div className="contacto-tarjeta-divisor" />
										<div className="contacto-tarjeta-cuerpo">
											<p className="contacto-tarjeta-etiqueta">{tarjeta.label}</p>
											{tarjeta.content}
										</div>
									</div>
								)}
							</motion.div>
						))}
					</div>
				</div>

				<Sucursales />
			</section>
		</div>
	);
}
