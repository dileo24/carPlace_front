import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useAutoDetail } from "../../hooks/useAutoDetail";
import { useRoles } from "../../hooks/useRoles";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import PriceDisplay from "../../components/PriceDisplay/PriceDisplay";
import SpecsGrid from "../../components/SpecsGrid/SpecsGrid";
import BenefitsCard from "../../components/BenefitsCard/BenefitsCard";
import CardsRelacionados from "../../components/Cards_Relacionados/CardsRelacionados";
import "./DetalleAuto.css";

const WA_NUMBER = "5493512147804";

export default function DetalleAuto() {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);
	const { id } = useParams();
	const navigate = useNavigate();
	const { isAuthenticated, esAdmin: isAdmin } = useRoles();

	const {
		auto,
		images,
		selectedImageIndex,
		imageError,
		isUploading,
		categorias,
		setSelectedImageIndex,
		handleImageUpload,
		handleRemoveImage,
		moveImage,
	} = useAutoDetail(id);

	if (!auto)
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
				<CircularProgress size={56} thickness={4} sx={{ color: "#cc0000" }} />
			</Box>
		);

	const waText = encodeURIComponent(`Hola! Vengo de la web y me interesa el ${auto.marca} ${auto.modelo} ${auto.anio}`);

	return (
		<>
			<div className="da-page">
				{/* Breadcrumb */}
				<div className="da-breadcrumb">
					<button onClick={() => navigate("/catalogo")} className="da-breadcrumb-link">
						← Volver al catálogo
					</button>
				</div>

				{/* Grid principal: galería + info */}
				<div className="da-layout">
					{/* ── Galería (sticky) ── */}
					<motion.div
						className="da-gallery-col"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<div className="da-gallery-card">
							<ImageGallery
								images={images}
								selectedImageIndex={selectedImageIndex}
								onSlideChange={setSelectedImageIndex}
								onThumbnailClick={setSelectedImageIndex}
								onMoveImage={moveImage}
								onRemoveImage={handleRemoveImage}
								onUploadImages={handleImageUpload}
								isEditing={false}
								isAuthenticated={isAuthenticated}
								isUploading={isUploading}
								imageError={imageError}
							/>
						</div>
					</motion.div>

					{/* ── Info ── */}
					<motion.div
						className="da-info-col"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.12 }}
					>
						<div className="da-info-card">
							{/* Encabezado */}
							<div className="da-info-header">
								{auto.oferta && <span className="da-badge">OFERTA</span>}
								<h1 className="da-title">{auto.marca}</h1>
								<h2 className="da-subtitle">{auto.modelo}</h2>
							</div>

							{/* Precio */}
							<div className="da-price-wrapper">
								<PriceDisplay
									moneda={auto.moneda}
									precio={auto.precio}
									precioOferta={auto.precio_oferta}
									precioContado={auto.precio_contado}
									oferta={auto.oferta}
								/>
								{auto.oferta_reventa && auto.precio_info_mes_actual && (
									<div className="da-precio-info">
										<span className="da-precio-info__label">Precio info auto</span>
										<span className="da-precio-info__valor">
											AR$ {Number(String(auto.precio_info_mes_actual).replace(/\./g, "")).toLocaleString("es-AR")}
										</span>
									</div>
								)}
							</div>

							<div className="da-divider" />
							{auto.notas_reventa && (
								<div className="da-notas-reventa">
									<span className="da-notas-reventa__titulo">Gastos</span>
									<p className="da-notas-reventa__texto">
										{auto.notas_reventa.split("\n").map((linea, i) => (
											<React.Fragment key={i}>
												{linea}
												<br />
											</React.Fragment>
										))}
									</p>
								</div>
							)}

							{/* Specs */}
							<div className="da-specs-wrapper">
								<SpecsGrid auto={auto} />
							</div>

							{/* WhatsApp CTA */}
							<a href={`https://wa.me/${WA_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="da-wpp-btn">
								<svg viewBox="0 0 24 24" fill="currentColor" className="da-wpp-icon">
									<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
								</svg>
								Consultar por WhatsApp
							</a>

							{/* Editar (solo admins) */}
							{isAuthenticated && isAdmin && (
								<button className="da-edit-btn" onClick={() => navigate(`/catalogo/${id}/editar`)}>
									✏️ Editar publicación
								</button>
							)}
						</div>
					</motion.div>
				</div>

				{/* Benefits */}
				<div className="da-benefits">
					<BenefitsCard />
				</div>

				{/* Relacionados */}
				<div className="da-relacionados">
					<CardsRelacionados categorias={categorias} idAutoActual={auto.id} />
				</div>
			</div>
		</>
	);
}
