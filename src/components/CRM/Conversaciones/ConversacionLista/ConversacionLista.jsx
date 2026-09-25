import React, { useState, useMemo } from "react";
import "./ConversacionLista.css";
import {
	ESTADOS_CONVERSACION,
	FILTROS_ESTADO,
	formatTiempoRelativo,
	getMetricas,
	getVisitaPendiente,
	formatFechaCorta,
} from "../../../../constants/crmConversaciones";
import { SearchIcon, BotIcon, AsesorIcon, CalendarIcon } from "../../../../constants/crmConversacionesIcons";
const ConversacionLista = ({
	conversaciones,
	seleccionadaId,
	onSeleccionar,
	esVendedor,
	esAdmin,
	puedeIniciarChat,
	onAbrirPredefinidos,
	onNuevoChat,
	userId,
	cargando,
	hasMore,
	cargandoMas,
	onCargarMas,
}) => {
	const [busqueda, setBusqueda] = useState("");
	const [filtroEstado, setFiltroEstado] = useState("todos");
	const [filtroCanal, setFiltroCanal] = useState(null);
	const [tooltipVisible, setTooltipVisible] = useState(false);

	const metricas = useMemo(() => getMetricas(conversaciones, userId, esVendedor, esAdmin), [conversaciones, userId, esVendedor, esAdmin]);

	const filtradas = useMemo(() => {
		const busquedaNormalizada = busqueda.trim().toLowerCase();
		const busquedaDigitos = busquedaNormalizada.replace(/\D/g, "");
		const resultado = conversaciones.filter((c) => {
			const nombreCompleto = `${c.contactoNombre || ""} ${c.contactoApellido || ""}`.toLowerCase();
			const telefonoDigitos = (c.telefono || "").replace(/\D/g, "");
			const matchBusqueda =
				!busquedaNormalizada ||
				nombreCompleto.includes(busquedaNormalizada) ||
				(busquedaDigitos.length > 0 && telefonoDigitos.includes(busquedaDigitos));
			const matchEstado = filtroEstado === "todos" || c.estado === filtroEstado;
			const matchCanal = !filtroCanal || c.canal === filtroCanal;
			return matchBusqueda && matchEstado && matchCanal;
		});

		return resultado.sort((a, b) => {
			const aAdminNoLeido = esAdmin && a.adminNoLeido ? 1 : 0;
			const bAdminNoLeido = esAdmin && b.adminNoLeido ? 1 : 0;
			if (bAdminNoLeido !== aAdminNoLeido) return bAdminNoLeido - aAdminNoLeido;

			const aNoLeido = (a.noLeido || 0) > 0 ? 1 : 0;
			const bNoLeido = (b.noLeido || 0) > 0 ? 1 : 0;
			if (bNoLeido !== aNoLeido) return bNoLeido - aNoLeido;

			return new Date(b.ultimaActividad) - new Date(a.ultimaActividad);
		});
	}, [conversaciones, busqueda, filtroEstado, filtroCanal, esAdmin]);

	return (
		<aside className="conv-lista">
			{/* Botón config — position absolute anclado al aside */}
			{(esAdmin || puedeIniciarChat) && (
				<div className="conv-lista__config-wrap">
					{puedeIniciarChat && (
						<button className="conv-lista__btn-config" onClick={onNuevoChat} title="Empezar chat nuevo">
							<svg viewBox="0 0 24 24" fill="none" width="15" height="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
						</button>
					)}
					{esAdmin && (
						<button
							className="conv-lista__btn-config"
							onClick={onAbrirPredefinidos}
							onMouseEnter={() => setTooltipVisible(true)}
							onMouseLeave={() => setTooltipVisible(false)}
							aria-label="Editar mensajes recomendados"
						>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								width="15"
								height="15"
								stroke="currentColor"
								strokeWidth="1.6"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
								<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
							</svg>
						</button>
					)}
					{esAdmin && tooltipVisible && <div className="conv-lista__tooltip">Editar mensajes recomendados</div>}
				</div>
			)}

			{/* Métricas rápidas */}
			<div className="conv-lista__metricas">
				<div className="conv-lista__metrica">
					<span className="conv-lista__metrica-valor">{metricas.activas}</span>
					<span className="conv-lista__metrica-label">Activas</span>
				</div>
				<div className="conv-lista__metrica-sep" />
				<div className="conv-lista__metrica">
					<span className="conv-lista__metrica-valor" style={{ color: metricas.sinAtender > 0 ? "#f97316" : undefined }}>
						{metricas.sinAtender}
					</span>
					<span className="conv-lista__metrica-label">No leídas</span>
				</div>
				{esVendedor && (
					<>
						<div className="conv-lista__metrica-sep" />
						<div className="conv-lista__metrica">
							<span className="conv-lista__metrica-valor">{metricas.misConversaciones}</span>
							<span className="conv-lista__metrica-label">Mis conv.</span>
						</div>
					</>
				)}
			</div>

			{/* Buscador */}
			<div className="conv-lista__buscador">
				<SearchIcon size={14} style={{ color: "#444", flexShrink: 0 }} />
				<input
					type="text"
					placeholder="Buscar por nombre o número..."
					value={busqueda}
					onChange={(e) => setBusqueda(e.target.value)}
					className="conv-lista__search-input"
				/>
			</div>

			{/* Filtro — selector */}
			<div className="conv-lista__filtros">
				<div className="conv-lista__select-wrapper">
					<select className="conv-lista__select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
						{FILTROS_ESTADO.map((f) => (
							<option key={f.value} value={f.value}>
								{f.label}
							</option>
						))}
					</select>
					<span className="conv-lista__select-arrow">▾</span>
				</div>
			</div>

			{/* Lista */}
			<div className="conv-lista__items">
				{filtradas.length === 0 && (
					<div className="conv-lista__empty">
						<p>Sin resultados</p>
					</div>
				)}
				{filtradas.map((conv, index) => {
					const estadoConfig = ESTADOS_CONVERSACION[conv.estado];
					const iniciales = conv.contactoNombre
						? `${conv.contactoNombre[0]}${conv.contactoApellido?.[0] || ""}`.toUpperCase()
						: conv.telefono?.slice(-2) || "??";

					const activa = conv.id === seleccionadaId;
					const nombreDisplay = conv.contactoNombre
						? `${conv.contactoNombre} ${conv.contactoApellido || ""}`.trim()
						: conv.telefono;

					const visitaPendiente = getVisitaPendiente(conv);

					return (
						<button
							key={conv.id}
							className={`conv-item ${activa ? "conv-item--activo" : ""}`}
							onClick={() => onSeleccionar(conv.id)}
							style={{ animationDelay: `${index * 0.05}s` }}
						>
							<div className="conv-item__avatar">
								<span className="conv-item__iniciales">{iniciales}</span>
							</div>
							<div className="conv-item__contenido">
								<div className="conv-item__fila-top">
									<span className="conv-item__nombre">
										<span className="conv-item__nombre-alias">{nombreDisplay}</span>
										{conv.telefono && <span className="conv-item__telefono">{conv.telefono}</span>}
									</span>
									<span className="conv-item__tiempo">{formatTiempoRelativo(conv.ultimaActividad)}</span>
								</div>
								<div className="conv-item__fila-bot">
									<span className="conv-item__preview">
										{(() => {
											const msgs = conv.mensajes || [];
											const ultimo = msgs.length ? msgs[msgs.length - 1] : null;
											if (!ultimo || ultimo.autor === "contacto" || !conv.ultimoMensaje) {
												return conv.ultimoMensaje;
											}
											const esBot = ultimo.autor === "bot";
											const esYo = ultimo.autor === "asesor" && ultimo.userId === userId;

											let etiqueta;
											if (esBot) {
												etiqueta = "Bot";
											} else if (esYo) {
												etiqueta = "Vos";
											} else if (ultimo.autorNombre) {
												const partes = ultimo.autorNombre.trim().split(" ");
												const nombre = partes[0];
												const inicialApellido = partes[1] ? `${partes[1][0].toUpperCase()}.` : "";
												etiqueta = inicialApellido ? `${nombre} ${inicialApellido}` : nombre;
											} else {
												etiqueta = "Asesor";
											}

											return (
												<>
													<span className={`conv-item__preview-autor conv-item__preview-autor--${ultimo.autor}`}>
														{esBot ? <BotIcon size={10} /> : <AsesorIcon size={10} />}
														{etiqueta}:
													</span>{" "}
													{conv.ultimoMensaje}
												</>
											);
										})()}
									</span>
									<div className="conv-item__badges">
										{visitaPendiente && (
											<span
												className="conv-item__visita-icon"
												title={`Visita pendiente: ${formatFechaCorta(visitaPendiente.fecha)}${visitaPendiente.horaInicio ? ` · ${visitaPendiente.horaInicio}` : ""}`}
											>
												<CalendarIcon size={12} />
											</span>
										)}
										{conv.estado === "bot" && conv.noLeido === 0 && !conv.adminNoLeido && (
											<span
												className="conv-item__estado-dot"
												style={{ background: ESTADOS_CONVERSACION[conv.estado].color }}
												title={ESTADOS_CONVERSACION[conv.estado].label}
											/>
										)}
										{(esAdmin ? conv.adminNoLeido : conv.noLeido > 0) && (
											<span className={`conv-item__badge-noLeido ${esAdmin && conv.adminNoLeido ? "conv-item__badge-noLeido--admin" : ""}`}>
												{esAdmin && conv.adminNoLeido ? "!" : conv.noLeido}
											</span>
										)}
									</div>
								</div>
							</div>
						</button>
					);
				})}
				{hasMore && (
					<button className="conv-lista__btn-cargar-mas" onClick={onCargarMas} disabled={cargandoMas}>
						{cargandoMas
							? "Cargando…"
							: busqueda || filtroEstado !== "todos" || filtroCanal
								? "Cargar más (puede haber más resultados sin traer)"
								: "Cargar más conversaciones"}
					</button>
				)}
			</div>
		</aside>
	);
};

export default ConversacionLista;
