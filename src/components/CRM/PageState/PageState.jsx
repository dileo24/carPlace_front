// components/shared/PageState/PageState.jsx
// Componente compartido para estados de carga y error en todas las vistas del CRM

import React, { useEffect, useState } from "react";
import "./PageState.css";

// ─── Spinner de carga ─────────────────────────────────────────────────────────
export function LoadingState({ mensaje = "Cargando…" }) {
	return (
		<div className="page-state page-state--loading">
			<div className="page-state__spinner-wrap">
				<span className="page-state__spinner" />
				<span className="page-state__spinner page-state__spinner--outer" />
			</div>
			<p className="page-state__msg">{mensaje}</p>
		</div>
	);
}

// ─── Error con pop-up / toast ─────────────────────────────────────────────────
export function ErrorState({ mensaje = "Ocurrió un error.", onRetry }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		// pequeño delay para que la animación de entrada se note
		const t = setTimeout(() => setVisible(true), 50);
		return () => clearTimeout(t);
	}, []);

	return (
		<div className="page-state page-state--error">
			{/* fondo oscuro con el ícono */}
			<div className={`page-state__error-card ${visible ? "page-state__error-card--visible" : ""}`}>
				<div className="page-state__error-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
				</div>
				<p className="page-state__error-titulo">Algo salió mal</p>
				<p className="page-state__error-msg">{mensaje}</p>
				{onRetry && (
					<button className="page-state__retry-btn" onClick={onRetry}>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M1 4v6h6" />
							<path d="M3.51 15a9 9 0 1 0 .49-3.78" />
						</svg>
						Reintentar
					</button>
				)}
			</div>
		</div>
	);
}

// ─── Toast de error transitorio (para errores no fatales) ─────────────────────
export function ErrorToast({ mensaje, onClose }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!mensaje) return;
		const show = setTimeout(() => setVisible(true), 30);
		const hide = setTimeout(() => {
			setVisible(false);
			setTimeout(onClose, 300);
		}, 4000);
		return () => {
			clearTimeout(show);
			clearTimeout(hide);
		};
	}, [mensaje]);

	if (!mensaje) return null;

	return (
		<div className={`page-state__toast ${visible ? "page-state__toast--visible" : ""}`}>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
			<span>{mensaje}</span>
			<button
				className="page-state__toast-close"
				onClick={() => {
					setVisible(false);
					setTimeout(onClose, 300);
				}}
			>
				✕
			</button>
		</div>
	);
}
