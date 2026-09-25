import React from "react";
import { ROL_LABELS, ROLES } from "../../../../constants/roles";
import "./UsuariosTable.css";

const UsuariosTable = ({
	currentUserRol,
	usuarios,
	loading,
	error,
	confirmDeleteId,
	onEdit,
	onDeleteRequest,
	onDeleteConfirm,
	onDeleteCancel,
}) => {
	const isAdmin = currentUserRol === ROLES.ADMIN;
	if (loading) {
		return (
			<div className="usuarios-table__state">
				<span className="usuarios-table__spinner" />
				<span className="usuarios-table__state-text">Cargando usuarios…</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="usuarios-table__state usuarios-table__state--error">
				<svg viewBox="0 0 20 20" fill="none" className="usuarios-table__state-icon">
					<circle cx="10" cy="10" r="8.5" stroke="#cc0000" strokeWidth="1.5" />
					<path d="M10 6v5M10 13.5v.5" stroke="#cc0000" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<span className="usuarios-table__state-text">{error}</span>
			</div>
		);
	}

	if (usuarios.length === 0) {
		return (
			<div className="usuarios-table__state">
				<span className="usuarios-table__state-text">No se encontraron usuarios.</span>
			</div>
		);
	}

	return (
		<div className="usuarios-table__scroll">
			<table className="usuarios-table">
				<thead>
					<tr className="usuarios-table__head-row">
						<th className="usuarios-table__th">Nombre</th>
						<th className="usuarios-table__th">Correo electrónico</th>
						<th className="usuarios-table__th">Rol</th>
						<th className="usuarios-table__th usuarios-table__th--actions">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{usuarios.map((u, i) => (
						<tr key={u.id} className="usuarios-table__row" style={{ animationDelay: `${i * 35}ms` }}>
							<td className="usuarios-table__td usuarios-table__td--name">{u.name}</td>
							<td className="usuarios-table__td usuarios-table__td--email">{u.email}</td>
							<td className="usuarios-table__td">
								<span className={`usuarios-table__rol usuarios-table__rol--${u.rol}`}>{ROL_LABELS[u.rol] ?? u.rol}</span>
							</td>
							<td className="usuarios-table__td usuarios-table__td--actions">
								{confirmDeleteId === u.id ? (
									<div className="usuarios-table__confirm">
										<span className="usuarios-table__confirm-label">¿Eliminar?</span>
										<button className="usuarios-table__btn usuarios-table__btn--confirm" onClick={() => onDeleteConfirm(u.id)}>
											Confirmar
										</button>
										<button className="usuarios-table__btn usuarios-table__btn--cancel" onClick={onDeleteCancel}>
											No
										</button>
									</div>
								) : (
									isAdmin && (
										<div className="usuarios-table__actions">
											<button className="usuarios-table__btn usuarios-table__btn--edit" onClick={() => onEdit(u)}>
												Editar
											</button>
											<button className="usuarios-table__btn usuarios-table__btn--delete" onClick={() => onDeleteRequest(u.id)}>
												Eliminar
											</button>
										</div>
									)
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default UsuariosTable;
