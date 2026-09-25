import React from "react";
import "./ConversacionBurbuja.css";
import { formatHora } from "../../../../constants/crmConversaciones";
import { BotIcon, AsesorIcon } from "../../../../constants/crmConversacionesIcons";

const TELEFONO_REGEX = /\b\d{8,12}\b/g;

function ocultarTelefonos(texto, ocultar) {
	if (!ocultar) return texto;
	return texto.replace(TELEFONO_REGEX, "[número privado]");
}
function renderTextoConLinks(texto) {
	if (!texto) return null;
	const partes = texto.split(/(https?:\/\/[^\s]+)/g);
	return partes.map((parte, i) =>
		/^https?:\/\//.test(parte) ? (
			<a
				key={i}
				href={parte}
				target="_blank"
				rel="noreferrer"
				style={{ color: "#6ea8fe", textDecoration: "underline", wordBreak: "break-all" }}
				onClick={(e) => e.stopPropagation()}
			>
				{parte}
			</a>
		) : (
			<span key={i}>{parte}</span>
		),
	);
}

const ConversacionBurbuja = ({ mensaje, esVendedor, esSupervisor, mensajes = [], esAdmin, onToggleOculto }) => {
	const mensajeCitado = mensaje.referenciadoMsgId ? mensajes.find((m) => m.waMsgId === mensaje.referenciadoMsgId) : null;
	const esSaliente = mensaje.tipo === "saliente";
	const esBot = mensaje.autor === "bot";
	const esAsesor = mensaje.autor === "asesor";
	const textoFinal = ocultarTelefonos(mensaje.texto, esVendedor || esSupervisor);
	// Solo admin ve esto — para el vendedor, el backend ya filtra el mensaje
	// entero antes de que llegue acá.
	const estaOculto = mensaje.ocultoManual || mensaje.esSeguimiento7Dias;
	const tipoMedia =
		mensaje.mediaType ||
		(mensaje.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
			? "image"
			: mensaje.mediaUrl?.match(/\.(mp4|mov|avi)(\?|$)/i)
				? "video"
				: mensaje.mediaUrl?.match(/\.(ogg|mp3|wav|m4a)(\?|$)/i)
					? "audio"
					: // Inferir por el texto cuando no hay extensión en la URL
						mensaje.texto === "[video]"
						? "video"
						: mensaje.texto === "[imagen]"
							? "image"
							: mensaje.mediaUrl?.includes("/whatsapp_audio/")
								? "audio"
								: mensaje.mediaUrl?.includes("/whatsapp_media/")
									? "image" // default para media sin tipo
									: mensaje.mediaUrl
										? "documento"
										: null);

	const esMedia = !!tipoMedia || !!mensaje.mediaUrl;
	return (
		<div className={`burbuja-wrapper ${esSaliente ? "saliente" : "entrante"}`}>
			<div className={`burbuja ${esSaliente ? "burbuja--saliente" : "burbuja--entrante"}${estaOculto ? " burbuja--oculto" : ""}`}>
				{esAdmin && estaOculto && (
					<div className="burbuja__oculto-aviso">
						{mensaje.esSeguimiento7Dias ? "Oculto para el vendedor (seguimiento automático)" : "Oculto para el vendedor"}
					</div>
				)}
				{mensajeCitado && (
					<div
						className="burbuja__cita"
						style={{ cursor: "pointer" }}
						onClick={() => {
							const id = mensajeCitado.waMsgId ? `msg-${mensajeCitado.waMsgId}` : `msg-${mensajeCitado.id}`;
							const el = document.getElementById(id);
							if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
						}}
					>
						<span className="burbuja__cita-autor">
							{mensajeCitado.autor === "bot"
								? "Bot"
								: mensajeCitado.autor === "contacto"
									? "Cliente"
									: mensajeCitado.autorNombre || "Asesor"}
						</span>
						<p className="burbuja__cita-texto">
							{mensajeCitado.mediaUrl ? "📎 Archivo adjunto" : mensajeCitado.texto?.slice(0, 100)}
							{mensajeCitado.texto?.length > 100 ? "..." : ""}
						</p>
					</div>
				)}
				{esMedia && mensaje.mediaUrl && !mensaje.mediaUrl.startsWith("pending:") ? (
					tipoMedia === "image" ? (
						<img src={mensaje.mediaUrl} alt="imagen" className="burbuja__imagen" onClick={() => window.open(mensaje.mediaUrl, "_blank")} />
					) : tipoMedia === "audio" ? (
						<div className="burbuja__audio">
							<div className="burbuja__audio-wrap">
								<audio
									controls
									src={mensaje.mediaUrl}
									className="burbuja__audio-player"
									ref={(el) => {
										if (el) {
											el._audioEl = el;
											el.playbackRate = 1.5; // ← nuevo: velocidad por defecto
										}
									}}
								/>
								<div className="burbuja__audio-speeds">
									{[1, 1.5, 2].map((speed) => (
										<button
											key={speed}
											className={`burbuja__audio-speed-btn${speed === 1.5 ? " active" : ""}`}
											onClick={(e) => {
												const audio = e.currentTarget.closest(".burbuja__audio-wrap").querySelector("audio");
												if (audio) {
													audio.playbackRate = speed;
													e.currentTarget
														.closest(".burbuja__audio-speeds")
														.querySelectorAll("button")
														.forEach((b) => b.classList.remove("active"));
													e.currentTarget.classList.add("active");
												}
											}}
										>
											{speed === 1 ? "1x" : `${speed}x`}
										</button>
									))}
								</div>
							</div>
							{mensaje.texto && mensaje.texto !== "[audio - no se pudo transcribir]" && (
								<p className="burbuja__audio-transcripcion">🎙️ {textoFinal}</p>
							)}
						</div>
					) : tipoMedia === "video" ? (
						<video controls src={mensaje.mediaUrl} className="burbuja__video" />
					) : (
						<div className="burbuja__media-placeholder">
							<span className="burbuja__media-icono">📎</span>
							<a href={mensaje.mediaUrl} target="_blank" rel="noreferrer">
								{mensaje.texto}
							</a>
						</div>
					)
				) : esMedia && !mensaje.mediaUrl ? (
					// Media sin URL (subida fallida o pendiente)
					<div className="burbuja__media-placeholder">
						<span className="burbuja__media-icono">
							{tipoMedia === "image" ? "🖼️" : tipoMedia === "video" ? "🎥" : tipoMedia === "audio" ? "🎙️" : "📎"}
						</span>
						<span style={{ color: "#666", fontSize: 13 }}>
							{tipoMedia === "image" ? "Imagen" : tipoMedia === "video" ? "Video" : tipoMedia === "audio" ? "Audio" : "Archivo"}
							{" — no disponible"}
						</span>
					</div>
				) : (
					<p className="burbuja__texto">{renderTextoConLinks(textoFinal)}</p>
				)}

				<div className="burbuja__meta">
					{esSaliente && (esBot || esAsesor) && (
						<span className={`burbuja__autor-badge burbuja__autor-badge--${mensaje.autor}`}>
							{esBot ? (
								<>
									<BotIcon size={11} /> Bot
								</>
							) : (
								<>
									<AsesorIcon size={11} />
									{mensaje.autorNombre || "Asesor"}
								</>
							)}
						</span>
					)}
					<span className="burbuja__hora">{formatHora(mensaje.timestamp)}</span>
					{esAdmin && !mensaje.esSeguimiento7Dias && onToggleOculto && (
						<button
							className="burbuja__btn-ocultar"
							onClick={(e) => {
								e.stopPropagation();
								onToggleOculto();
							}}
							title={mensaje.ocultoManual ? "Mostrarle este mensaje al vendedor" : "Ocultarle este mensaje al vendedor"}
						>
							{mensaje.ocultoManual ? "👁️ Mostrar" : "🙈 Ocultar"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ConversacionBurbuja;
