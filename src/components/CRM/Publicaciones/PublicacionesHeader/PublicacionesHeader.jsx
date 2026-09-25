import React from "react";
import "./PublicacionesHeader.css";

const PublicacionesHeader = ({ total, search, onSearchChange, onNuevo }) => {
	return (
		<div className="publicaciones-header">
			<div className="publicaciones-header__left">
				<h1 className="publicaciones-header__title">Publicaciones</h1>
				<span className="publicaciones-header__meta">
					(<span className="publicaciones-header__metric">{total}</span>)
				</span>
			</div>

			<div className="publicaciones-header__right">
				<div className="publicaciones-header__search-wrap">
					<svg className="publicaciones-header__search-icon" viewBox="0 0 20 20" fill="none">
						<circle cx="8.5" cy="8.5" r="5.5" stroke="#444" strokeWidth="1.5" />
						<path d="M13 13l3.5 3.5" stroke="#444" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					<input
						className="publicaciones-header__search"
						type="text"
						placeholder="Buscar por auto…"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
				<button className="publicaciones-header__btn-nuevo" onClick={onNuevo}>
					<svg viewBox="0 0 16 16" fill="none" className="publicaciones-header__btn-icon">
						<path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
					</svg>
					Publicar auto
				</button>
			</div>
		</div>
	);
};

export default PublicacionesHeader;
