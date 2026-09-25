import React, { useState } from "react";
import "./NuevoChatModal.css";
import { iniciarConversacion } from "../../../../services/conversaciones.service";

const IconClose = () => (
	<svg viewBox="0 0 20 20" fill="none" width="18" height="18">
		<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
	</svg>
);

const IconCheck = () => (
	<svg viewBox="0 0 20 20" fill="none" width="18" height="18">
		<path d="M4 10l5 5 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export default function NuevoChatModal({ open, onClose, onCreado, userRol, userId }) {
	const [telefono, setTelefono] = useState("");
	const [nombre, setNombre] = useState("");
	const [apellido, setApellido] = useState("");
	const [vehiculo, setVehiculo] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState(null);
	const [exito, setExito] = useState(false);
	const [yaExistia, setYaExistia] = useState(false); // ← nuevo

	if (!open) return null;

	function resetForm() {
		setTelefono("");
		setNombre("");
		setApellido("");
		setVehiculo("");
		setError(null);
		setExito(false);
		setYaExistia(false);
	}

	function handleClose() {
		if (enviando) return;
		resetForm();
		onClose();
	}
	
	function telefonoParecevalido(tel) {
		const limpio = tel.replace(/\D/g, "");
		const sinPrefijo = limpio.replace(/^549?/, "").replace(/^0/, "");
		return sinPrefijo.length === 10;
	}

	async function handleEnviar() {
		const tel = telefono.trim();
		if (!tel) {
			setError("El teléfono es obligatorio.");
			return;
		}
		if (!telefonoParecevalido(tel)) {
			setError("El teléfono no parece válido. Verificá que tenga el código de área sin el 0 adelante (ej: 3516863857).");
			return;
		}
		setError(null);
		setEnviando(true);
		try {
			const data = await iniciarConversacion(
				{
					telefono: tel,
					nombre: nombre.trim() || null,
					apellido: apellido.trim() || null,
					vehiculo: vehiculo.trim() || null,
				},
				{ rol: userRol, userId },
			);
			if (data?.resp?.id) {
				const existente = data.status === 200;
				setYaExistia(existente);
				setExito(!existente);
				setTimeout(
					() => {
						onCreado?.(data.resp);
						resetForm();
						onClose();
					},
					existente ? 1500 : 700,
				);
			}
		} catch (err) {
			console.error(err);
			setError(err?.error || "No se pudo iniciar la conversación.");
		} finally {
			setEnviando(false);
		}
	}

	function handleOverlayClick(e) {
		if (e.target === e.currentTarget) handleClose();
	}

	return (
		<div className="nchat__overlay" onClick={handleOverlayClick}>
			<div className="nchat">
				{/* Header */}
				<div className="nchat__header">
					<div>
						<h2 className="nchat__titulo">Empezar chat nuevo</h2>
						<p className="nchat__subtitulo">Se le va a enviar un mensaje de WhatsApp con la plantilla aprobada.</p>
					</div>
					<button className="nchat__close" onClick={handleClose} aria-label="Cerrar" disabled={enviando}>
						<IconClose />
					</button>
				</div>

				{/* Body */}
				<div className="nchat__body">
					<label className="nchat__field">
						<span className="nchat__label">Teléfono *</span>
						<input
							className="nchat__input"
							type="text"
							placeholder="Ej: 3511234567"
							value={telefono}
							onChange={(e) => setTelefono(e.target.value)}
							disabled={enviando}
							autoFocus
						/>
					</label>

					<div className="nchat__row">
						<label className="nchat__field">
							<span className="nchat__label">Nombre</span>
							<input
								className="nchat__input"
								type="text"
								placeholder="Opcional"
								value={nombre}
								onChange={(e) => setNombre(e.target.value)}
								disabled={enviando}
							/>
						</label>
						<label className="nchat__field">
							<span className="nchat__label">Apellido</span>
							<input
								className="nchat__input"
								type="text"
								placeholder="Opcional"
								value={apellido}
								onChange={(e) => setApellido(e.target.value)}
								disabled={enviando}
							/>
						</label>
					</div>

					<label className="nchat__field">
						<span className="nchat__label">Vehículo de interés</span>
						<input
							className="nchat__input"
							type="text"
							placeholder="Opcional — se menciona en el mensaje"
							value={vehiculo}
							onChange={(e) => setVehiculo(e.target.value)}
							disabled={enviando}
						/>
					</label>

					{error && <p className="nchat__error">{error}</p>}
				</div>

				{/* Footer */}
				<div className="nchat__footer">
					<button className="nchat__btn nchat__btn--ghost" onClick={handleClose} disabled={enviando}>
						Cancelar
					</button>
					<button
						className={`nchat__btn nchat__btn--primary ${exito ? "nchat__btn--exito" : ""} ${yaExistia ? "nchat__btn--info" : ""}`}
						onClick={handleEnviar}
						disabled={enviando || !telefono.trim()}
					>
						{exito ? (
							<>
								<IconCheck /> Enviado
							</>
						) : yaExistia ? (
							"Ya existe una conversación, abriéndola..."
						) : enviando ? (
							"Enviando..."
						) : (
							"Empezar chat"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
