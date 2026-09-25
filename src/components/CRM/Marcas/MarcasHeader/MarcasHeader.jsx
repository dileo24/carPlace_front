import React from "react";
import "./MarcasHeader.css";

const MarcasHeader = ({ total, search, onSearchChange, onNuevo }) => {
	return (
		<div className="marcas-header">
			<div className="marcas-header__left">
				<h1 className="marcas-header__title">Marcas</h1>
				<span className="marcas-header__meta">
					(<span className="marcas-header__metric">{total}</span>)
				</span>
			</div>

			<div className="marcas-header__right">
				<div className="marcas-header__search-wrap">
					<svg className="marcas-header__search-icon" viewBox="0 0 20 20" fill="none">
						<circle cx="8.5" cy="8.5" r="5.5" stroke="#444" strokeWidth="1.5" />
						<path d="M13 13l3.5 3.5" stroke="#444" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					<input
						className="marcas-header__search"
						type="text"
						placeholder="Buscar por nombre…"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
				<button className="marcas-header__btn-nuevo" onClick={onNuevo}>
					<svg viewBox="0 0 16 16" fill="none" className="marcas-header__btn-icon">
						<path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
					</svg>
					Nueva marca
				</button>
			</div>
		</div>
	);
};

export default MarcasHeader;
