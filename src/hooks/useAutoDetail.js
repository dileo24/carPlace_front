import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { categoriaToCreate } from "../data/filters";
import { deleteAuto, getAutoById, postImagen, updateAuto, updateImgInAuto } from "../services/autos.service";
import { getMarcasCatalogo } from "../services/marcas.service";

const MAX_IMAGES = 20;

export function useAutoDetail(id) {
	const navigate = useNavigate();
	const [auto, setAuto] = useState(null);
	const [images, setImages] = useState([]);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [imageError, setImageError] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [categorias, setCategorias] = useState([]);
	const [editedAuto, setEditedAuto] = useState({});
	const [moneda, setMoneda] = useState("AR$");
	const [years, setYears] = useState([]);
	const [submitError, setSubmitError] = useState(null);

	const yearRef = useRef(null);
	const motorRef = useRef(null);
	const kmRef = useRef(null);
	const transmisionRef = useRef(null);
	const combustibleRef = useRef(null);
	const colorRef = useRef(null);
	const modeloRef = useRef(null);
	const marcaRef = useRef(null);
	const precioRef = useRef(null);
	const precioContadoRef = useRef(null);

	const refs = { yearRef, motorRef, kmRef, transmisionRef, combustibleRef, colorRef, modeloRef, marcaRef, precioRef, precioContadoRef };

	useEffect(() => {
		window.scrollTo(0, 0);
		(async () => {
			let catalogo = [];
			try {
				const data = await getMarcasCatalogo();
				catalogo = data?.resp ?? [];
			} catch (_) {}
			fetchAuto(catalogo);
		})();

		const currentYear = new Date().getFullYear();
		const yearsArray = [];
		for (let i = currentYear; i >= 1990; i--) yearsArray.push(i);
		setYears(yearsArray);
	}, [id]);

	// El Select de marca necesita que el value calce exactamente con el
	// "nombre" de alguna marca del catálogo — si el auto tiene guardada una
	// marca vieja con otra mayúscula/minúscula, la normalizamos acá.
	const normalizeMarca = (marcaDB, catalogo) => {
		const match = catalogo.find((m) => m.nombre.toLowerCase() === marcaDB?.toLowerCase());
		return match ? match.nombre : marcaDB;
	};
	const fetchAuto = async (catalogo = []) => {
		try {
			const response = await getAutoById(id);
			if (response.data.status === 200) {
				const autoData = response.data.resp;
				setAuto(autoData);
				setMoneda(autoData.moneda);
				setEditedAuto({
					...autoData,
					marca: normalizeMarca(autoData.marca, catalogo),
				});
				setCategorias(autoData.categorias.map((cat) => cat.id));

				const loadedImages =
					autoData.img && autoData.img.length > 0
						? autoData.img.map((img) => (img.startsWith("http") ? img : `${import.meta.env.VITE_API_URL}/files/${img}`))
						: ["/placeholder.jpg"];

				setImages(loadedImages);
				setSelectedImageIndex(0);
			}
		} catch (error) {
			console.error("Error al obtener los datos del auto:", error);
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const input = e.target;

		if (name === "oferta_reventa" && !checked) {
			setEditedAuto((prev) => ({ ...prev, oferta_reventa: false, notas_reventa: "" }));
			return;
		}

		if (["precio", "precio_oferta", "precio_contado", "km"].includes(name)) {
			const isNumeric = /^[\d.]+$/.test(value.trim());
			if (isNumeric) {
				const cursorPos = input.selectionStart;
				const oldValue = input.value;
				const numericValue = value.replace(/[^0-9.]/g, "").replace(/\./g, "");
				const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

				const puntosAntes = (oldValue.slice(0, cursorPos).match(/\./g) || []).length;
				const puntosDespues = (formattedValue.slice(0, cursorPos).match(/\./g) || []).length;
				const diff = puntosDespues - puntosAntes;
				const newPos = cursorPos + diff;

				setEditedAuto((prev) => ({ ...prev, [name]: formattedValue }));

				requestAnimationFrame(() => {
					input.setSelectionRange(newPos, newPos);
				});
			} else {
				setEditedAuto((prev) => ({ ...prev, [name]: value }));
			}
		} else {
			setEditedAuto((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : value,
			}));
		}
	};

	const handleCategoryChange = (event) => {
		const { value } = event.target;
		const selectedCategories = typeof value === "string" ? value.split(",") : value;
		setEditedAuto((prev) => ({
			...prev,
			categorias: selectedCategories.map((id) => ({
				id: Number(id),
				categ: categoriaToCreate.find((cat) => cat.value === id)?.label || "",
			})),
		}));
	};

	const handleSave = async () => {
		try {
			const newImageOrder = images.map((img) => (img.startsWith("http") ? img : img.replace(`${import.meta.env.VITE_API_URL}/files/`, "")));

			if (JSON.stringify(newImageOrder) !== JSON.stringify(auto.img)) {
				await updateImgInAuto(id, newImageOrder);
			}

			const payload = { ...editedAuto, moneda, img: newImageOrder };
			const response = await updateAuto(id, payload);

			if (response.data.status === 200) {
				setAuto(payload);
				return true;
			}
		} catch (error) {
			console.error("Error al guardar los cambios:", error);
			setSubmitError("Error al guardar los cambios. Intente nuevamente.");
		}
		return false;
	};

	const handleImageUpload = async (e) => {
		const files = Array.from(e.target.files);
		setImageError("");

		if (images.length + files.length > MAX_IMAGES) {
			setImageError(
				`Solo se pueden subir ${MAX_IMAGES} imágenes. Ya hay ${images.length} cargada y estás intentando agregar ${files.length} más.`,
			);
			return;
		}

		try {
			setIsUploading(true);
			let currentImages = [...auto.img];
			let newImageUrls = [...images];
			let fallaron = 0;

			// Subida por archivo, cada una con su propio try/catch (no
			// Promise.all) — si una falla, las demás que sí subieron bien no se
			// pierden ni hay que volver a subirlas de nuevo.
			for (const file of files) {
				try {
					const formData = new FormData();
					formData.append("file", file);
					const response = await postImagen(formData);
					if (response.data.url) {
						currentImages.push(response.data.url);
						newImageUrls.push(response.data.url);
					}
				} catch (uploadError) {
					console.error("Error subiendo imagen:", uploadError);
					fallaron++;
				}
			}

			if (currentImages.length !== auto.img.length) {
				await updateImgInAuto(id, currentImages);
				setAuto((prev) => ({ ...prev, img: currentImages }));
				setImages(newImageUrls);
			}

			if (fallaron > 0) {
				setImageError(`No se pudieron subir ${fallaron} imagen(es). Las demás se guardaron bien.`);
				setTimeout(() => setImageError(""), 4000);
			}
		} catch (error) {
			console.error("Error al subir imágenes:", error);
			setImageError("Error al subir las imágenes. Intente nuevamente.");
			setTimeout(() => setImageError(""), 3000);
		} finally {
			setIsUploading(false);
			e.target.value = "";
		}
	};

	const handleRemoveImage = async (index) => {
		const imageToRemove = auto.img[index];
		const imageId = imageToRemove.startsWith("http") ? imageToRemove.split("/").pop().replace(/\.[a-zA-Z0-9]+$/, "") : imageToRemove;
		const newImageArray = auto.img.filter((_, i) => i !== index);

		try {
			// Primero se saca la foto del auto (la fuente de verdad de qué se
			// ve en el sitio) y RECIÉN DESPUÉS se borra de Cloudinary — en ese
			// orden. Si se hacía al revés (borrar de Cloudinary y después
			// actualizar el array) y el segundo paso fallaba por cualquier
			// corte de red, la foto quedaba borrada para siempre en Cloudinary
			// pero su URL seguía en Auto.img — ahí es donde salía la foto rota
			// en la galería. Con este orden, en el peor caso queda un archivo
			// huérfano en Cloudinary (inofensivo), nunca una referencia rota.
			await updateImgInAuto(id, newImageArray);
			setAuto((prev) => ({ ...prev, img: newImageArray }));
			setImages((prev) => prev.filter((_, i) => i !== index));
			if (selectedImageIndex === index) setSelectedImageIndex(0);

			axios.delete(`${import.meta.env.VITE_API_URL}/files/${imageId}`).catch((err) => {
				console.warn("No se pudo borrar la imagen de Cloudinary (queda huérfana, sin efecto visible):", err);
			});
		} catch (error) {
			console.error("Error al eliminar la imagen:", error);
			setImageError("Error al eliminar la imagen. Intente nuevamente.");
			setTimeout(() => setImageError(""), 3000);
		}
	};

	const handleDeleteAuto = async () => {
		try {
			const response = await deleteAuto(id);
			if (response.data.status === "200") {
				if (response.data.advertencia) {
					window.alert(`⚠️ ${response.data.advertencia}`);
				}
				navigate("/catalogo");
			}
		} catch (error) {
			console.error("Error al eliminar el auto:", error);
			setImageError("Error al eliminar el auto. Intente nuevamente.");
			setTimeout(() => setImageError(""), 3000);
		}
	};

	const moveImage = (fromIndex, toIndex) => {
		const updatedImages = [...images];
		const [movedImage] = updatedImages.splice(fromIndex, 1);
		updatedImages.splice(toIndex, 0, movedImage);
		setImages(updatedImages);

		if (selectedImageIndex === fromIndex) {
			setSelectedImageIndex(toIndex);
		} else if (
			(fromIndex < selectedImageIndex && toIndex >= selectedImageIndex) ||
			(fromIndex > selectedImageIndex && toIndex <= selectedImageIndex)
		) {
			setSelectedImageIndex((prev) => prev + (fromIndex < toIndex ? -1 : 1));
		}
	};

	return {
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
	};
}
