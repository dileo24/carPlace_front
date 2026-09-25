import React from "react";
import "./ConfirmDeleteMarcaDialog.css";

// autosAfectados: null mientras se están cargando, [] si no hay ninguno, o el
// array de { id, modelo, anio } de autos que quedan con esta marca cargada.
const ConfirmDeleteMarcaDialog = ({ open, nombre, autosAfectados, deleting, onCancel, onConfirm }) => {
	if (!open) return null;

	const cargando = autosAfectados === null;
	const hayAutos = !cargando && autosAfectados.length > 0;

	return (
		<div className="cdm-overlay" onClick={onCancel}>
			<div className="cdm-dialog" onClick={(e) => e.stopPropagation()}>
				<div className="cdm-header">
					<svg viewBox="0 0 24 24" fill="none" className="cdm-header-icon">
						<path
							d="M12 9v4M12 17h.01M10.29 3.86l-8.4 14.5A1.5 1.5 0 0 0 3.19 20.6h17.62a1.5 1.5 0 0 0 1.3-2.24l-8.4-14.5a1.5 1.5 0 0 0-2.62 0z"
							stroke="#cc0000"
							strokeWidth="1.6"
							strokeLinejoin="round"
						/>
					</svg>
					<span className="cdm-title">Eliminar marca "{nombre}"</span>
				</div>

				<div className="cdm-body">
					{cargando ? (
						<p className="cdm-text">Revisando autos asociados…</p>
					) : hayAutos ? (
						<>
							<p className="cdm-warning">
								Esta marca tiene <strong>{autosAfectados.length}</strong> auto{autosAfectados.length > 1 ? "s" : ""} cargado
								{autosAfectados.length > 1 ? "s" : ""}. Si continuás, esos autos NO se borran ni se modifican, pero van a quedar sin
								marca asociada al catálogo (sin foto/logo) hasta que les asignes otra.
							</p>
							<div className="cdm-autos-list">
								{autosAfectados.map((a) => (
									<span key={a.id} className="cdm-auto-chip">
										{a.modelo} ({a.anio})
									</span>
								))}
							</div>
						</>
					) : (
						<p className="cdm-text">No hay ningún auto cargado con esta marca. Se puede eliminar sin afectar nada.</p>
					)}
				</div>

				<div className="cdm-footer">
					<button className="cdm-btn cdm-btn--cancel" onClick={onCancel} disabled={deleting}>
						Cancelar
					</button>
					<button className="cdm-btn cdm-btn--confirm" onClick={onConfirm} disabled={cargando || deleting}>
						{deleting ? "Eliminando…" : "Eliminar de todas formas"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmDeleteMarcaDialog;
