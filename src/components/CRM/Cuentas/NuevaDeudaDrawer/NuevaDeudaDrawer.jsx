import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import { createDeuda } from "../../../../services/cuentas.service";
import "./NuevaDeudaDrawer.css";

const OTRO = "otro";
const EMPRESA = "empresa";

const formatMonto = (digitos) => digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * Props:
 *  - open: boolean
 *  - admins: [{ id, name, email }]
 *  - currentAdminId: number
 *  - onClose: () => void
 *  - onCreated: () => void
 */
const NuevaDeudaDrawer = ({ open, admins, currentAdminId, onClose, onCreated }) => {
	const [montoDigitos, setMontoDigitos] = useState("");
	const [moneda, setMoneda] = useState("ARS");
	const [motivo, setMotivo] = useState("");

	const [deudorId, setDeudorId] = useState("");
	const [deudorNombreOtro, setDeudorNombreOtro] = useState("");
	const [deudorTelefonoOtro, setDeudorTelefonoOtro] = useState("");

	const [acreedorId, setAcreedorId] = useState("");
	const [acreedorNombreOtro, setAcreedorNombreOtro] = useState("");
	const [acreedorTelefonoOtro, setAcreedorTelefonoOtro] = useState("");

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (open) {
			setMontoDigitos("");
			setMoneda("ARS");
			setMotivo("");
			const otro = admins.find((a) => a.id !== currentAdminId);
			setDeudorId(currentAdminId ? String(currentAdminId) : "");
			setDeudorNombreOtro("");
			setDeudorTelefonoOtro("");
			setAcreedorId(otro ? String(otro.id) : "");
			setAcreedorNombreOtro("");
			setAcreedorTelefonoOtro("");
			setError("");
		}
	}, [open, admins, currentAdminId]);

	const handleMontoChange = (e) => {
		const digitos = e.target.value.replace(/\D/g, "");
		setMontoDigitos(digitos);
	};

	const handleSubmit = async () => {
		setError("");

		const monto = Number(montoDigitos);
		if (!montoDigitos || monto <= 0) return setError("El monto debe ser mayor a 0.");
		if (!motivo.trim()) return setError("El motivo es requerido.");
		if (!deudorId) return setError("Elegí quién debe.");
		if (!acreedorId) return setError("Elegí a quién le debe.");

		const esOtroDeudor = deudorId === OTRO;
		const esOtroAcreedor = acreedorId === OTRO;
		const esEmpresaDeudor = deudorId === EMPRESA;
		const esEmpresaAcreedor = acreedorId === EMPRESA;

		if (esOtroDeudor && (!deudorNombreOtro.trim() || !deudorTelefonoOtro.trim())) {
			return setError("Completá el nombre y teléfono de quién debe.");
		}
		if (esOtroAcreedor && (!acreedorNombreOtro.trim() || !acreedorTelefonoOtro.trim())) {
			return setError("Completá el nombre y teléfono de a quién le debe.");
		}
		if (deudorId === EMPRESA && acreedorId === EMPRESA) {
			return setError("La empresa no puede ser deudora y acreedora a la vez.");
		}
		if (!esOtroDeudor && !esOtroAcreedor && deudorId === acreedorId) {
			return setError("El deudor y el acreedor no pueden ser el mismo.");
		}

		setLoading(true);
		try {
			await createDeuda({
				monto,
				moneda,
				motivo: motivo.trim(),
				deudorId: esOtroDeudor || esEmpresaDeudor ? null : Number(deudorId),
				deudorEmpresa: esEmpresaDeudor ? true : undefined,
				deudorNombre: esOtroDeudor ? deudorNombreOtro.trim() : undefined,
				deudorTelefono: esOtroDeudor ? deudorTelefonoOtro.trim() : undefined,
				acreedorId: esOtroAcreedor || esEmpresaAcreedor ? null : Number(acreedorId),
				acreedorEmpresa: esEmpresaAcreedor ? true : undefined,
				acreedorNombre: esOtroAcreedor ? acreedorNombreOtro.trim() : undefined,
				acreedorTelefono: esOtroAcreedor ? acreedorTelefonoOtro.trim() : undefined,
			});
			onCreated();
		} catch (err) {
			const msg = err?.response?.data?.error || "Error al crear la deuda.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ className: "deuda-drawer__paper" }}>
			<div className="deuda-drawer">
				<div className="deuda-drawer__header">
					<span className="deuda-drawer__title">Nueva deuda</span>
					<button className="deuda-drawer__close" onClick={onClose} aria-label="Cerrar">
						<svg viewBox="0 0 16 16" fill="none">
							<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				<div className="deuda-drawer__body">
					<div className="deuda-drawer__field">
						<label className="deuda-drawer__label">Quién debe</label>
						<select className="deuda-drawer__input" value={deudorId} onChange={(e) => setDeudorId(e.target.value)}>
							<option value="">Elegir…</option>
							{admins.map((a) => (
								<option key={a.id} value={a.id}>
									{a.name || a.email}
								</option>
							))}
							<option value={EMPRESA}>Empresa (Car Place)</option>
							<option value={OTRO}>Otro…</option>
						</select>
					</div>

					{deudorId === OTRO && (
						<div className="deuda-drawer__row">
							<div className="deuda-drawer__field deuda-drawer__field--grow">
								<label className="deuda-drawer__label">Nombre completo</label>
								<input
									className="deuda-drawer__input"
									value={deudorNombreOtro}
									onChange={(e) => setDeudorNombreOtro(e.target.value)}
									placeholder="ej: Juan Pérez"
								/>
							</div>
							<div className="deuda-drawer__field">
								<label className="deuda-drawer__label">Teléfono</label>
								<input
									className="deuda-drawer__input"
									value={deudorTelefonoOtro}
									onChange={(e) => setDeudorTelefonoOtro(e.target.value)}
									placeholder="ej: 3511234567"
								/>
							</div>
						</div>
					)}

					<div className="deuda-drawer__field">
						<label className="deuda-drawer__label">A quién le debe</label>
						<select className="deuda-drawer__input" value={acreedorId} onChange={(e) => setAcreedorId(e.target.value)}>
							<option value="">Elegir…</option>
							{admins.map((a) => (
								<option key={a.id} value={a.id}>
									{a.name || a.email}
								</option>
							))}
							<option value={EMPRESA}>Empresa (Car Place)</option>
							<option value={OTRO}>Otro…</option>
						</select>
					</div>

					{acreedorId === OTRO && (
						<div className="deuda-drawer__row">
							<div className="deuda-drawer__field deuda-drawer__field--grow">
								<label className="deuda-drawer__label">Nombre completo</label>
								<input
									className="deuda-drawer__input"
									value={acreedorNombreOtro}
									onChange={(e) => setAcreedorNombreOtro(e.target.value)}
									placeholder="ej: Juan Pérez"
								/>
							</div>
							<div className="deuda-drawer__field">
								<label className="deuda-drawer__label">Teléfono</label>
								<input
									className="deuda-drawer__input"
									value={acreedorTelefonoOtro}
									onChange={(e) => setAcreedorTelefonoOtro(e.target.value)}
									placeholder="ej: 3511234567"
								/>
							</div>
						</div>
					)}

					<div className="deuda-drawer__row">
						<div className="deuda-drawer__field deuda-drawer__field--grow">
							<label className="deuda-drawer__label">Monto</label>
							<input
								className="deuda-drawer__input"
								type="text"
								inputMode="numeric"
								value={formatMonto(montoDigitos)}
								onChange={handleMontoChange}
								placeholder="0"
								autoFocus
							/>
						</div>
						<div className="deuda-drawer__field">
							<label className="deuda-drawer__label">Moneda</label>
							<select className="deuda-drawer__input" value={moneda} onChange={(e) => setMoneda(e.target.value)}>
								<option value="ARS">ARS</option>
								<option value="USD">USD</option>
							</select>
						</div>
					</div>

					<div className="deuda-drawer__field">
						<label className="deuda-drawer__label">Motivo</label>
						<textarea
							className="deuda-drawer__input deuda-drawer__textarea"
							value={motivo}
							onChange={(e) => setMotivo(e.target.value)}
							placeholder="ej: Adelanto para arreglo del Corsa"
							rows={3}
						/>
					</div>

					{error && <p className="deuda-drawer__error">{error}</p>}
				</div>

				<div className="deuda-drawer__footer">
					<button className="deuda-drawer__btn deuda-drawer__btn--primary" onClick={handleSubmit} disabled={loading}>
						{loading ? <span className="deuda-drawer__spinner" /> : null}
						{loading ? "Creando…" : "Crear deuda"}
					</button>
					<button className="deuda-drawer__btn deuda-drawer__btn--secondary" onClick={onClose} disabled={loading}>
						Cancelar
					</button>
				</div>
			</div>
		</Drawer>
	);
};

export default NuevaDeudaDrawer;
