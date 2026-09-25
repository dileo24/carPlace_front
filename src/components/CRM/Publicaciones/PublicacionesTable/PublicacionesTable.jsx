import React from "react";
import { useNavigate } from "react-router-dom";
import "./PublicacionesTable.css";

const API_URL = import.meta.env.VITE_API_URL;

const fotoAuto = (auto) => {
	const primera = auto?.img?.[0];
	if (!primera) return null;
	return primera.startsWith("http") ? primera : `${API_URL}/files/${primera}`;
};

const ESTADO_LABEL = {
	publicada: "Publicada",
	pausada: "Pausada",
	cerrada: "Finalizada",
	eliminada: "Eliminada",
	error: "Error",
};

const formatearFecha = (iso) => {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const diasRestantes = (iso) => {
	if (!iso) return null;
	const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
	return dias;
};

const TH = ({ campo, label, sort, onSort }) => (
	<th className="publicaciones-table__th publicaciones-table__th--sortable" onClick={() => onSort(campo)}>
		{label}
		<span className="publicaciones-table__sort-arrow">{sort?.campo === campo ? (sort.dir === "asc" ? "▲" : "▼") : ""}</span>
	</th>
);

const PublicacionesTable = ({
	publicaciones,
	loading,
	error,
	actionLoadingId,
	sort,
	onSort,
	onPausar,
	onReactivar,
	onCerrar,
	onEliminar,
	onRepublicar,
	onBorrarRegistro,
}) => {
	const navigate = useNavigate();

	if (loading) {
		return (
			<div className="publicaciones-table__state">
				<span className="publicaciones-table__spinner" />
				<span className="publicaciones-table__state-text">Cargando publicaciones…</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="publicaciones-table__state publicaciones-table__state--error">
				<svg viewBox="0 0 20 20" fill="none" className="publicaciones-table__state-icon">
					<circle cx="10" cy="10" r="8.5" stroke="#cc0000" strokeWidth="1.5" />
					<path d="M10 6v5M10 13.5v.5" stroke="#cc0000" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<span className="publicaciones-table__state-text">{error}</span>
			</div>
		);
	}

	if (publicaciones.length === 0) {
		return (
			<div className="publicaciones-table__state">
				<span className="publicaciones-table__state-text">Todavía no publicaste ningún auto.</span>
			</div>
		);
	}

	return (
		<div className="publicaciones-table__scroll">
			<table className="publicaciones-table">
				<thead>
					<tr className="publicaciones-table__head-row">
						<TH campo="nombre" label="Auto" sort={sort} onSort={onSort} />
						<th className="publicaciones-table__th">Plataforma</th>
						<TH campo="estado" label="Estado" sort={sort} onSort={onSort} />
						<TH campo="publicadoEn" label="Publicada" sort={sort} onSort={onSort} />
						<TH campo="expiraEn" label="Vence" sort={sort} onSort={onSort} />
						<th className="publicaciones-table__th publicaciones-table__th--actions">Acciones</th>
					</tr>
				</thead>
				<tbody>
					{publicaciones.map((pub, i) => {
						const dias = diasRestantes(pub.expiraEn);
						const cargando = actionLoadingId === pub.id;
						return (
							<tr className="publicaciones-table__row" key={pub.id} style={{ animationDelay: `${i * 35}ms` }}>
								<td className="publicaciones-table__td publicaciones-table__td--auto">
									<div className="publicaciones-table__auto-cell">
										{fotoAuto(pub.Auto) ? (
											<img className="publicaciones-table__thumb" src={fotoAuto(pub.Auto)} alt="" loading="lazy" />
										) : (
											<span className="publicaciones-table__thumb publicaciones-table__thumb--placeholder" />
										)}
										<div className="publicaciones-table__auto-info">
											{pub.Auto ? (
												<button
													type="button"
													className="publicaciones-table__auto-link"
													onClick={() => navigate(`/crm/stock?autoId=${pub.autoId}`)}
												>
													{`${pub.Auto.marca} ${pub.Auto.modelo} (${pub.Auto.anio})`}
												</button>
											) : (
												<span title="Este auto ya no está en el Stock (se borró o se vendió)">
													{pub.tituloUsado || `Auto #${pub.autoId}`} ⚠️
												</span>
											)}
											{pub.permalink && (
												<a href={pub.permalink} target="_blank" rel="noopener noreferrer" className="publicaciones-table__ver-link">
													Ver publicación ↗
												</a>
											)}
										</div>
									</div>
								</td>
								<td className="publicaciones-table__td">MercadoLibre</td>
								<td className="publicaciones-table__td">
									<span className={`publicaciones-table__badge publicaciones-table__badge--${pub.estado}`}>
										{ESTADO_LABEL[pub.estado] || pub.estado}
									</span>
									{pub.ultimoErrorMensaje && (
										<span
											className="publicaciones-table__error-flag"
											title={`Falló la última sincronización con MercadoLibre: ${pub.ultimoErrorMensaje}`}
										>
											⚠
										</span>
									)}
								</td>
								<td className="publicaciones-table__td">{formatearFecha(pub.publicadoEn)}</td>
								<td className="publicaciones-table__td">
									{pub.estado === "publicada" && dias !== null
										? dias >= 0
											? `en ${dias} días`
											: "vencida"
										: formatearFecha(pub.expiraEn)}
								</td>
								<td className="publicaciones-table__td publicaciones-table__td--actions">
									<div className="publicaciones-table__actions">
										{pub.estado === "publicada" && (
											<button className="publicaciones-table__btn" onClick={() => onPausar(pub)} disabled={cargando}>
												Pausar
											</button>
										)}
										{pub.estado === "pausada" && (
											<button className="publicaciones-table__btn publicaciones-table__btn--edit" onClick={() => onReactivar(pub)} disabled={cargando}>
												Reactivar
											</button>
										)}
										{(pub.estado === "publicada" || pub.estado === "pausada") && (
											<>
												<button className="publicaciones-table__btn" onClick={() => onCerrar(pub)} disabled={cargando}>
													Finalizar
												</button>
												<button className="publicaciones-table__btn publicaciones-table__btn--delete" onClick={() => onEliminar(pub)} disabled={cargando}>
													Eliminar
												</button>
											</>
										)}
										{(pub.estado === "cerrada" || pub.estado === "eliminada" || pub.estado === "error") && (
											<button className="publicaciones-table__btn publicaciones-table__btn--edit" onClick={() => onRepublicar(pub)} disabled={cargando}>
												Republicar
											</button>
										)}
										{(pub.estado === "cerrada" || pub.estado === "error") && (
											<button className="publicaciones-table__btn publicaciones-table__btn--delete" onClick={() => onEliminar(pub)} disabled={cargando}>
												Eliminar
											</button>
										)}
										{pub.estado === "eliminada" && (
											<button className="publicaciones-table__btn publicaciones-table__btn--delete" onClick={() => onBorrarRegistro(pub)} disabled={cargando}>
												Borrar registro
											</button>
										)}
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default PublicacionesTable;
