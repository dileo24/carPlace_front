import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import { postImagen } from "../../../../services/autos.service";
import { updateMarca } from "../../../../services/marcas.service";
import "./MarcaDrawer.css";

/**
 * Props:
 *  - open: boolean
 *  - marca: { id, nombre, fotoUrl, fotoPublicId } | null
 *  - onClose: () => void
 *  - onSaved: () => void
 */
const MarcaDrawer = ({ open, marca, onClose, onSaved }) => {
	const [nombre, setNombre] = useState("");
	const [foto, setFoto] = useState(null); // File nuevo, si se reemplaza
	const [previewUrl, setPreviewUrl] = useState(null); // fotoUrl actual o preview del archivo nuevo
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (open && marca) {
			setNombre(marca.nombre || "");
			setFoto(null);
			setPreviewUrl(marca.fotoUrl || null);
			setError("");
		}
	}, [open, marca]);

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
			const payload = { nombre: nombre.trim() };
			if (foto) {
				const formDataImg = new FormData();
				formDataImg.append("file", foto);
				const uploadResponse = await postImagen(formDataImg);
				payload.fotoUrl = uploadResponse.data.url;
				payload.fotoPublicId = uploadResponse.data.fileName;
			}

			await updateMarca(marca.id, payload);
			onSaved();
		} catch (err) {
			const msg = err?.response?.data?.error || err?.error || "Error al guardar la marca.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	if (!marca) return null;

	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "editar-marca-drawer__paper" }}>
			<div className="editar-marca-drawer">
				<div className="editar-marca-drawer__header">
					<span className="editar-marca-drawer__title">Editar marca</span>
					<button className="editar-marca-drawer__close" onClick={onClose} aria-label="Cerrar">
						<svg viewBox="0 0 16 16" fill="none">
							<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				<div className="editar-marca-drawer__body">
					<div className="editar-marca-drawer__field">
						<label className="editar-marca-drawer__label">Nombre</label>
						<input
							className="editar-marca-drawer__input"
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
							placeholder="ej: Volkswagen"
							autoComplete="off"
						/>
						<p className="editar-marca-drawer__hint">
							Si cambiás el nombre, todos los autos que ya tenían esta marca se actualizan automáticamente al nuevo nombre.
						</p>
					</div>

					<div className="editar-marca-drawer__field">
						<label className="editar-marca-drawer__label">Foto</label>
						<div className="editar-marca-drawer__foto-row">
							{previewUrl ? (
								<img src={previewUrl} alt="Vista previa" className="editar-marca-drawer__foto-preview" />
							) : (
								<span className="editar-marca-drawer__foto-placeholder">Sin foto</span>
							)}
							<label className="editar-marca-drawer__foto-btn">
								Cambiar foto
								<input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" hidden onChange={handleFotoChange} />
							</label>
						</div>
					</div>

					{error && <p className="editar-marca-drawer__error">{error}</p>}
				</div>

				<div className="editar-marca-drawer__footer">
					<button className="editar-marca-drawer__btn editar-marca-drawer__btn--primary" onClick={handleSubmit} disabled={loading}>
						{loading ? <span className="editar-marca-drawer__spinner" /> : null}
						{loading ? "Guardando…" : "Guardar cambios"}
					</button>
					<button className="editar-marca-drawer__btn editar-marca-drawer__btn--secondary" onClick={onClose} disabled={loading}>
						Cancelar
					</button>
				</div>
			</div>
		</Drawer>
	);
};

export default MarcaDrawer;
