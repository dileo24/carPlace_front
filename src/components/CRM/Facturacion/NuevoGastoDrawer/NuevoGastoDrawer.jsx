import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import { createGasto } from "../../../../services/gastos.service";
import "./NuevoGastoDrawer.css";

const CATEGORIAS = ["Alquiler", "Sueldos", "Servicios", "Impuestos", "Mantenimiento", "Otro"];

const formatMonto = (digitos) => digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onCreated: () => void
 */
const NuevoGastoDrawer = ({ open, onClose, onCreated }) => {
	const [montoDigitos, setMontoDigitos] = useState("");
	const [moneda, setMoneda] = useState("ARS");
	const [categoria, setCategoria] = useState(CATEGORIAS[0]);
	const [descripcion, setDescripcion] = useState("");
	const [fecha, setFecha] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (open) {
			setMontoDigitos("");
			setMoneda("ARS");
			setCategoria(CATEGORIAS[0]);
			setDescripcion("");
			setFecha(new Date().toISOString().slice(0, 10));
			setError("");
		}
	}, [open]);

	const handleMontoChange = (e) => {
		setMontoDigitos(e.target.value.replace(/\D/g, ""));
	};

	const handleSubmit = async () => {
		setError("");
		if (!montoDigitos || Number(montoDigitos) <= 0) return setError("El monto debe ser mayor a 0.");
		if (!categoria) return setError("Elegí una categoría.");

		setLoading(true);
		try {
			await createGasto({
				monto: Number(montoDigitos),
				moneda,
				categoria,
				descripcion: descripcion.trim() || undefined,
				fecha: fecha || undefined,
			});
			onCreated();
		} catch (err) {
			const msg = err?.response?.data?.error || "Error al crear el gasto.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "gasto-drawer__paper" }}>
			<div className="gasto-drawer">
				<div className="gasto-drawer__header">
					<span className="gasto-drawer__title">Nuevo gasto</span>
					<button className="gasto-drawer__close" onClick={onClose} aria-label="Cerrar">
						<svg viewBox="0 0 16 16" fill="none">
							<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				<div className="gasto-drawer__body">
					<div className="gasto-drawer__field">
						<label className="gasto-drawer__label">Categoría</label>
						<select className="gasto-drawer__input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
							{CATEGORIAS.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>

					<div className="gasto-drawer__row">
						<div className="gasto-drawer__field gasto-drawer__field--grow">
							<label className="gasto-drawer__label">Monto</label>
							<input
								className="gasto-drawer__input"
								type="text"
								inputMode="numeric"
								value={formatMonto(montoDigitos)}
								onChange={handleMontoChange}
								placeholder="0"
								autoFocus
							/>
						</div>
						<div className="gasto-drawer__field">
							<label className="gasto-drawer__label">Moneda</label>
							<select className="gasto-drawer__input" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
								<option value="ARS">ARS</option>
								<option value="USD">USD</option>
							</select>
						</div>
					</div>

					<div className="gasto-drawer__field">
						<label className="gasto-drawer__label">Fecha</label>
						<input
							className="gasto-drawer__input"
							type="date"
							value={fecha}
							onChange={(e) => setFecha(e.target.value)}
						/>
					</div>

					<div className="gasto-drawer__field">
						<label className="gasto-drawer__label">Descripción (opcional)</label>
						<textarea
							className="gasto-drawer__input gasto-drawer__textarea"
							value={descripcion}
							onChange={(e) => setDescripcion(e.target.value)}
							placeholder="ej: Alquiler del local, septiembre"
							rows={3}
						/>
					</div>

					{error && <p className="gasto-drawer__error">{error}</p>}
				</div>

				<div className="gasto-drawer__footer">
					<button className="gasto-drawer__btn gasto-drawer__btn--primary" onClick={handleSubmit} disabled={loading}>
						{loading ? <span className="gasto-drawer__spinner" /> : null}
						{loading ? "Creando…" : "Crear gasto"}
					</button>
					<button className="gasto-drawer__btn gasto-drawer__btn--secondary" onClick={onClose} disabled={loading}>
						Cancelar
					</button>
				</div>
			</div>
		</Drawer>
	);
};

export default NuevoGastoDrawer;
