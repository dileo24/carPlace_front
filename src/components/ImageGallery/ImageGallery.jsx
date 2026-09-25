import React, { useRef, useEffect } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { AddPhotoAlternate } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useDragSensors } from "../../hooks/useDragSensors";
import DraggableImage from "../DraggableImage/DraggableImage";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const MAX_IMAGES = 20;

export default function ImageGallery({
	images,
	selectedImageIndex,
	onSlideChange,
	onThumbnailClick,
	onMoveImage,
	onRemoveImage,
	onUploadImages,
	isEditing,
	isAuthenticated,
	isUploading,
	imageError,
}) {
	const fileInputRef = useRef(null);
	const swiperRef = useRef(null);
	const sensors = useDragSensors();

	const handleUploadClick = () => fileInputRef.current.click();

	useEffect(() => {
		const swiper = swiperRef.current;
		if (swiper && swiper.realIndex !== selectedImageIndex) {
			swiper.slideToLoop(selectedImageIndex);
		}
	}, [selectedImageIndex]);

	const handleDragEnd = (event) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const fromIndex = images.indexOf(active.id);
		const toIndex = images.indexOf(over.id);
		if (fromIndex !== -1 && toIndex !== -1) onMoveImage(fromIndex, toIndex);
	};

	return (
		<Box
			sx={{
				"& .swiper-button-next, & .swiper-button-prev": {
					color: "#fff",
					backgroundColor: "rgba(20,20,20,0.35)",
					backdropFilter: "blur(3px)",
					borderRadius: "50%",
					width: 40,
					height: 40,
					marginTop: "-20px",
					boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
					transition: "background-color 0.2s ease, transform 0.2s ease",
					"&:hover": {
						backgroundColor: "#d80606",
						transform: "scale(1.08)",
					},
					"&:after": {
						fontSize: "16px",
						fontWeight: 700,
					},
				},
				"& .swiper-button-next": { right: 12 },
				"& .swiper-button-prev": { left: 12 },
				"& .swiper-button-disabled": {
					opacity: 0,
					pointerEvents: "none",
				},
			}}
		>
			<PhotoProvider maskOpacity={0.92} speed={() => 300}>
				<Swiper
					modules={[Navigation, Autoplay]}
					navigation
					autoplay={{ delay: 7000, disableOnInteraction: false }}
					onSlideChange={(swiper) => onSlideChange(swiper.realIndex)}
					onSwiper={(swiper) => (swiperRef.current = swiper)}
					initialSlide={selectedImageIndex}
					style={{ borderRadius: "8px 8px 0 0" }}
					className="custom-swiper"
					loop={true}
				>
					{images.map((image, index) => (
						<SwiperSlide key={index}>
							<Box
								sx={{
									height: { xs: 350, sm: 525 },
									position: "relative",
									overflow: "hidden",
									borderRadius: "8px 8px 0 0",
								}}
							>
								<PhotoView src={image}>
									<Box
										component="img"
										src={image}
										alt={`Auto ${index + 1}`}
										sx={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
											objectPosition: "center",
											cursor: "zoom-in",
										}}
									/>
								</PhotoView>
							</Box>
						</SwiperSlide>
					))}
				</Swiper>
			</PhotoProvider>

			{/* Thumbnails */}
			<Box
				sx={{
					p: 2,
					display: "flex",
					gap: 1,
					overflowX: "auto",
					alignItems: "center",
					"&::-webkit-scrollbar": { height: 6 },
					"&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1" },
					"&::-webkit-scrollbar-thumb": {
						backgroundColor: "#888",
						borderRadius: 3,
						"&:hover": { backgroundColor: "#555" },
					},
				}}
			>
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={images} strategy={horizontalListSortingStrategy}>
						{images.map((image, index) => (
							<DraggableImage
								key={image}
								image={image}
								index={index}
								onClick={onThumbnailClick}
								isSelected={index === selectedImageIndex}
								onRemove={onRemoveImage}
								isEditing={isEditing}
								isAuthenticated={isAuthenticated}
							/>
						))}
					</SortableContext>
				</DndContext>

				{isAuthenticated && isEditing && images.length < MAX_IMAGES && (
					<Box
						sx={{
							width: 80,
							height: 60,
							flexShrink: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "2px dashed #ddd",
							borderRadius: 1,
							cursor: "pointer",
							"&:hover": { borderColor: "#1976d2" },
						}}
						onClick={handleUploadClick}
					>
						<input
							type="file"
							ref={fileInputRef}
							onChange={onUploadImages}
							accept="image/*"
							multiple
							style={{ display: "none" }}
							disabled={isUploading}
						/>
						{isUploading ? <CircularProgress size={24} /> : <AddPhotoAlternate color="action" />}
					</Box>
				)}
			</Box>

			{imageError && (
				<Box sx={{ px: 2, pb: 2 }}>
					<Alert severity="error">{imageError}</Alert>
				</Box>
			)}
		</Box>
	);
}
