import React, { useState } from "react";
import { getAutosPorMarca } from "../../../../services/marcas.service";
import "./MarcasTable.css";

// Una fila por marca, con un desplegable (cerrado por defecto) que al abrirse
// carga los autos cargados con esa marca — solo modelo y año, para
// identificarlos sin ensuciar la vista.
function MarcaRow({ marca, index, onEdit, onDeleteRequest }) {
	const [expandido, setExpandido] = useState(false);
	const [autos, setAutos] = useState(null); // null = todavía no se pidió
	const [cargandoAutos, setCargandoAutos] = useState(false);
	const tieneAutos = (marca.totalAutos ?? 0) > 0;

	const toggleExpandido = async () => {
		if (!tieneAutos) return;
		const abrir = !expandido;
		setExpandido(abrir);
		if (abrir && autos === null) {
			setCargandoAutos(true);
			try {
				const data = await getAutosPorMarca(marca.id);
				const lista = Array.isArray(data?.resp) ? data.resp : [];
				lista.sort((a, b) => a.modelo.localeCompare(b.modelo, "es", { sensitivity: "base" }));
				setAutos(lista);
			} catch {
				setAutos([]);
			} finally {
				setCargandoAutos(false);
			}
		}
	};

	const handleExpandBtnClick = (e) => {
		e.stopPropagation();
		toggleExpandido();
	};

	const handleEditClick = (e) => {
		e.stopPropagation();
		onEdit(marca);
	};

	const handleDeleteClick = (e) => {
		e.stopPropagation();
		onDeleteRequest(marca);
	};

	return (
		<>
			<tr
				className={`marcas-table__row ${tieneAutos ? "marcas-table__row--clickable" : ""}`}
				style={{ animationDelay: `${index * 35}ms` }}
				onClick={tieneAutos ? toggleExpandido : undefined}
			>
				<td className="marcas-table__td marcas-table__td--expand">
					{tieneAutos && (
						<button
							className={`marcas-table__expand-btn ${expandido ? "marcas-table__expand-btn--open" : ""}`}
							onClick={handleExpandBtnClick}
							aria-label="Ver autos de esta marca"
						>
							<svg viewBox="0 0 10 6" fill="none">
								<path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					)}
				</td>
				<td className="marcas-table__td marcas-table__td--foto">
					{marca.fotoUrl ? (
						<img src={marca.fotoUrl} alt={marca.nombre} className="marcas-table__foto" />
					) : (
						<span className="marcas-table__foto-placeholder">{marca.nombre?.charAt(0)?.toUpperCase()}</span>
					)}
				</td>
				<td className="marcas-table__td marcas-table__td--nombre">{marca.nombre}</td>
				<td className="marcas-table__td marcas-table__td--total">{marca.totalAutos ?? 0}</td>
				<td className="marcas-table__td marcas-table__td--actions">
					<div className="marcas-table__actions">
						<button className="marcas-table__btn marcas-table__btn--edit" onClick={handleEditClick}>
							Editar
						</button>
						<button className="marcas-table__btn marcas-table__btn--delete" onClick={handleDeleteClick}>
							Eliminar
						</button>
					</div>
				</td>
			</tr>
			{expandido && (
				<tr className="marcas-table__row-expand">
					<td className="marcas-table__td-expand" colSpan={5}>
						{cargandoAutos ? (
							<span className="marcas-table__expand-state">Cargando autos…</span>
						) : autos?.length ? (
							<div className="marcas-table__autos-list">
								{autos.map((a) => (
									<a
										key={a.id}
										href={`/catalogo/${a.id}`}
										target="_blank"
										rel="noopener noreferrer"
										className="marcas-table__auto-chip"
										onClick={(e) => e.stopPropagation()}
									>
										{a.modelo} ({a.anio})
									</a>
								))}
							</div>
						) : (
							<span className="marcas-table__expand-state">Sin autos cargados con esta marca.</span>
						)}
					</td>
				</tr>
			)}
		</>
	);
}

const MarcasTable = ({ marcas, loading, error, onEdit, onDeleteRequest }) => {
	if (loading) {
		return (
			<div className="marcas-table__state">
				<span className="marcas-table__spinner" />
				<span className="marcas-table__state-text">Cargando marcas…</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="marcas-table__state marcas-table__state--error">
				<svg viewBox="0 0 20 20" fill="none" className="marcas-table__state-icon">
					<circle cx="10" cy="10" r="8.5" stroke="#cc0000" strokeWidth="1.5" />
					<path d="M10 6v5M10 13.5v.5" stroke="#cc0000" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<span className="marcas-table__state-text">{error}</span>
			</div>
		);
	}

	if (marcas.length === 0) {
		return (
			<div className="marcas-table__state">
				<span className="marcas-table__state-text">No se encontraron marcas.</span>
			</div>
		);
	}

	return (
		<div className="marcas-table__scroll">
			<table className="marcas-table">
				<thead>
					<tr className="marcas-table__head-row">
						<th className="marcas-table__th" />
						<th className="marcas-table__th">Foto</th>
						<th className="marcas-table__th">Nombre</th>
						<th className="marcas-table__th marcas-table__th--total">Autos</th>
						<th className="marcas-table__th marcas-table__th--actions">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{marcas.map((marca, i) => (
						<MarcaRow key={marca.id} marca={marca} index={i} onEdit={onEdit} onDeleteRequest={onDeleteRequest} />
					))}
				</tbody>
			</table>
		</div>
	);
};

export default MarcasTable;
