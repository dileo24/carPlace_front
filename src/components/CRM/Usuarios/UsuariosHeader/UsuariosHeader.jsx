import React from "react";
import "./UsuariosHeader.css";
import { ROLES } from "../../../../constants/roles";

const UsuariosHeader = ({ currentUserRol, total, search, onSearchChange, onNuevo }) => {
	const isAdmin = currentUserRol === ROLES.ADMIN;
	return (
		<div className="usuarios-header">
			<div className="usuarios-header__left">
				<h1 className="usuarios-header__title">Usuarios</h1>
				<span className="usuarios-header__meta">
					(<span className="usuarios-header__metric">{total}</span>)
				</span>
			</div>

			<div className="usuarios-header__right">
				<div className="usuarios-header__search-wrap">
					<svg className="usuarios-header__search-icon" viewBox="0 0 20 20" fill="none">
						<circle cx="8.5" cy="8.5" r="5.5" stroke="#444" strokeWidth="1.5" />
						<path d="M13 13l3.5 3.5" stroke="#444" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					<input
						className="usuarios-header__search"
						type="text"
						placeholder="Buscar por nombre o email…"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
				{isAdmin && (
					<button className="usuarios-header__btn-nuevo" onClick={onNuevo}>
						<svg viewBox="0 0 16 16" fill="none" className="usuarios-header__btn-icon">
							<path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
						Nuevo usuario
					</button>
				)}
			</div>
		</div>
	);
};

export default UsuariosHeader;
