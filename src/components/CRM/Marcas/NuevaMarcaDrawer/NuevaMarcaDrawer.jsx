import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import { postImagen } from "../../../../services/autos.service";
import { createMarca } from "../../../../services/marcas.service";
import "./NuevaMarcaDrawer.css";

/**
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onCreated: () => void
 */
const NuevaMarcaDrawer = ({ open, onClose, onCreated }) => {
	const [nombre, setNombre] = useState("");
	const [foto, setFoto] = useState(null); // File
	const [previewUrl, setPreviewUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (open) {
			setNombre("");
			setFoto(null);
			setPreviewUrl(null);
			setError("");
		}
	}, [open]);

	const handleFotoChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setFoto(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	const handleSubmit = async () => {
		setError("");
		if (!nombre.trim()) return setError("El nombre es requerido.");

		setLoading(true);
		try {
			let fotoUrl = null;
			let fotoPublicId = null;
			if (foto) {
				const formDataImg = new FormData();
				formDataImg.append("file", foto);
				const uploadResponse = await postImagen(formDataImg);
				fotoUrl = uploadResponse.data.url;
				fotoPublicId = uploadResponse.data.fileName;
			}

			await createMarca({ nombre: nombre.trim(), fotoUrl, fotoPublicId });
			onCreated();
		} catch (err) {
			const msg = err?.response?.data?.error || err?.error || "Error al crear la marca.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "marca-drawer__paper" }}>
			<div className="marca-drawer">
				<div className="marca-drawer__header">
					<span className="marca-drawer__title">Nueva marca</span>
					<button className="marca-drawer__close" onClick={onClose} aria-label="Cerrar">
						<svg viewBox="0 0 16 16" fill="none">
							<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				<div className="marca-drawer__body">
					<div className="marca-drawer__field">
						<label className="marca-drawer__label">Nombre</label>
						<input
							className="marca-drawer__input"
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
							placeholder="ej: Volkswagen"
							autoComplete="off"
							autoFocus
						/>
					</div>

					<div className="marca-drawer__field">
						<label className="marca-drawer__label">Foto</label>
						<div className="marca-drawer__foto-row">
							{previewUrl ? (
								<img src={previewUrl} alt="Vista previa" className="marca-drawer__foto-preview" />
							) : (
								<span className="marca-drawer__foto-placeholder">Sin foto</span>
							)}
							<label className="marca-drawer__foto-btn">
								{foto ? "Cambiar" : "Subir foto"}
								<input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" hidden onChange={handleFotoChange} />
							</label>
						</div>
					</div>

					{error && <p className="marca-drawer__error">{error}</p>}
				</div>

				<div className="marca-drawer__footer">
					<button className="marca-drawer__btn marca-drawer__btn--primary" onClick={handleSubmit} disabled={loading}>
						{loading ? <span className="marca-drawer__spinner" /> : null}
						{loading ? "Creando…" : "Crear marca"}
					</button>
					<button className="marca-drawer__btn marca-drawer__btn--secondary" onClick={onClose} disabled={loading}>
						Cancelar
					</button>
				</div>
			</div>
		</Drawer>
	);
};

export default NuevaMarcaDrawer;
