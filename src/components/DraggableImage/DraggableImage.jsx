import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

const DraggableImage = ({ image, index, onClick, isSelected, onRemove, isEditing, isAuthenticated }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: image,
		disabled: !isEditing,
	});

	return (
		<Box
			ref={setNodeRef}
			{...attributes}
			{...(isEditing ? listeners : {})}
			onClick={() => onClick(index)}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
			sx={{
				width: 80,
				height: 60,
				flexShrink: 0,
				cursor: isEditing ? "grab" : "default",
				touchAction: isEditing ? "none" : "auto",
				position: "relative",
				borderRadius: 1,
				overflow: "hidden",
				border: isSelected ? "2px solid #d21919" : "2px solid #ddd",
				transition: "border-color 0.2s ease-in-out",
				opacity: isDragging ? 0.5 : 1,
				zIndex: isDragging ? 1 : "auto",
				"&:hover": {
					transform: isEditing ? "scale(1.05)" : "none",
				},
			}}
		>
			{isAuthenticated && isEditing && (
				<IconButton
					size="small"
					sx={{
						position: "absolute",
						top: 2,
						right: 2,
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						color: "white",
						"&:hover": {
							backgroundColor: "rgba(0, 0, 0, 0.7)",
						},
						padding: 0.5,
					}}
					onClick={(e) => {
						e.stopPropagation();
						onRemove(index);
					}}
				>
					<Close fontSize="small" />
				</IconButton>
			)}
			<img
				src={image}
				alt={`Thumbnail ${index + 1}`}
				style={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
				}}
			/>
		</Box>
	);
};

export default DraggableImage;
