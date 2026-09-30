import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import { saldarDeuda } from "../../../../services/cuentas.service";
// Reutiliza los estilos base de los drawers de Cuentas (deuda-drawer__*).
import "../NuevaDeudaDrawer/NuevaDeudaDrawer.css";
import "./SaldarDeudaDrawer.css";

const METODOS = ["Efectivo", "Transferencia", "Cheque", "Otro"];

const formatMonto = (digitos) => String(digitos).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * Props:
 *  - open: boolean
 *  - deuda: objeto deuda (o null)
 *  - onClose: () => void
 *  - onSaldada: () => void
 */
const SaldarDeudaDrawer = ({ open, deuda, onClose, onSaldada }) => {
	const [montoDigitos, setMontoDigitos] = useState("");
	const [metodo, setMetodo] = useState("");
	const [comentario, setComentario] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const esInterna = deuda?.tipo === "interna";
	const pendiente = Number(deuda?.pendiente ?? 0);

	useEffect(() => {
		if (open && deuda) {
			setMontoDigitos(String(Math.floor(Number(deuda.pendiente ?? 0))));
			setMetodo("");
			setComentario("");
			setError("");
		}
	}, [open, deuda]);

	const handleSubmit = async () => {
		setError("");
		if (!metodo && !comentario.trim()) {
			return setError("Indicá cómo se pagó o dejá un comentario.");
		}

		const body = {};
		if (metodo) body.metodo = metodo;
		if (comentario.trim()) body.comentario = comentario.trim();

		if (esInterna) {
			const monto = Number(montoDigitos);
			if (!montoDigitos || monto <= 0) return setError("El monto debe ser mayor a 0.");
			if (monto > pendiente) return setError(`El monto no puede superar lo pendiente (${pendiente.toLocaleString("es-AR")}).`);
			body.monto = monto;
		}

		setLoading(true);
		try {
			await saldarDeuda(deuda.id, body);
			onSaldada();
		} catch (err) {
			setError(err?.response?.data?.error || "Error al saldar la deuda.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "deuda-drawer__paper saldar-drawer__paper" }}>
			<div className="deuda-drawer">
				<div className="deuda-drawer__header">
					<span className="deuda-drawer__title">Saldar deuda</span>
					<button className="deuda-drawer__close" onClick={onClose} aria-label="Cerrar">
						<svg viewBox="0 0 16 16" fill="none">
							<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				{deuda && (
					<div className="deuda-drawer__body">
						<div className="saldar-drawer__resumen">
							<span className="saldar-drawer__resumen-motivo">{deuda.motivo}</span>
							<span className="saldar-drawer__resumen-quien">
								<span className="saldar-drawer__debe">{deuda.deudorNombre}</span> → <span className="saldar-drawer__recibe">{deuda.acreedorNombre}</span>
							</span>
							<span className="saldar-drawer__resumen-pend">
								Pendiente: {deuda.moneda} {pendiente.toLocaleString("es-AR")}
							</span>
						</div>

						<div className="deuda-drawer__field">
							<label className="deuda-drawer__label">Monto{esInterna ? "" : " (se salda el total)"}</label>
							{esInterna ? (
								<div className="deuda-drawer__row">
									<input
										className="deuda-drawer__input"
										type="text"
										inputMode="numeric"
										value={formatMonto(montoDigitos)}
										onChange={(e) => setMontoDigitos(e.target.value.replace(/\D/g, ""))}
										placeholder="0"
									/>
									<span className="saldar-drawer__moneda">{deuda.moneda}</span>
								</div>
							) : (
								<div className="deuda-drawer__input saldar-drawer__monto-fijo">
									{deuda.moneda} {pendiente.toLocaleString("es-AR")}
								</div>
							)}
							{esInterna && <span className="saldar-drawer__hint">Podés pagar una parte; el tope es lo pendiente.</span>}
						</div>

						<div className="deuda-drawer__field">
							<label className="deuda-drawer__label">Cómo se pagó</label>
							<select className="deuda-drawer__input" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
								<option value="">Elegir…</option>
								{METODOS.map((m) => (
									<option key={m} value={m}>
										{m}
									</option>
								))}
							</select>
						</div>

						<div className="deuda-drawer__field">
							<label className="deuda-drawer__label">Comentario</label>
							<textarea
								className="deuda-drawer__input deuda-drawer__textarea"
								value={comentario}
								onChange={(e) => setComentario(e.target.value)}
								placeholder="ej: Me lo devolvió en mano"
								rows={3}
							/>
							<span className="saldar-drawer__hint">Hace falta indicar cómo se pagó o dejar un comentario (al menos uno).</span>
						</div>

						{error && <p className="deuda-drawer__error">{error}</p>}
					</div>
				)}

				<div className="deuda-drawer__footer">
					<button className="deuda-drawer__btn saldar-drawer__btn-confirm" onClick={handleSubmit} disabled={loading}>
						{loading ? <span className="deuda-drawer__spinner" /> : null}
						{loading ? "Guardando…" : "Confirmar pago"}
					</button>
					<button className="deuda-drawer__btn deuda-drawer__btn--secondary" onClick={onClose} disabled={loading}>
						Cancelar
					</button>
				</div>
			</div>
		</Drawer>
	);
};

export default SaldarDeudaDrawer;
