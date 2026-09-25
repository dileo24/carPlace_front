import React, { useEffect, useRef, useState, forwardRef } from "react";
import "./ConversacionChat.css";
import ConversacionHeader from "../ConversacionHeader/ConversacionHeader";
import ConversacionBurbuja from "../ConversacionBurbuja/ConversacionBurbuja";
import ContactoPerfilDrawer from "../ContactoPerfilDrawer/ContactoPerfilDrawer";
import { getMensajesConSeparadores, formatHora } from "../../../../constants/crmConversaciones";
import { SendIcon, BotIcon, EmptyInboxIcon } from "../../../../constants/crmConversacionesIcons";
import { enviarAudio, enviarMedia } from "../../../../services/conversaciones.service";
import { Mp3Encoder } from "@breezystack/lamejs";
import { useAuth } from "../../../../context/AuthContext";

const TEXTAREA_MAX_HEIGHT = 96;
const convertirAMp3 = async (webmBlob) => {
	const arrayBuffer = await webmBlob.arrayBuffer();

	// Decodificamos con el contexto original (puede ser 48000 en macOS)
	const audioCtx = new AudioContext();
	const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
	await audioCtx.close();

	const originalSampleRate = audioBuffer.sampleRate;
	const targetSampleRate = Math.min(originalSampleRate, 44100);

	let finalBuffer = audioBuffer;

	// Si la sampleRate supera 44100 (caso macOS), resampleamos
	if (originalSampleRate > targetSampleRate) {
		const offlineCtx = new OfflineAudioContext(
			audioBuffer.numberOfChannels,
			Math.ceil(audioBuffer.duration * targetSampleRate),
			targetSampleRate,
		);
		const source = offlineCtx.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(offlineCtx.destination);
		source.start(0);
		finalBuffer = await offlineCtx.startRendering();
	}

	const channels = finalBuffer.numberOfChannels;
	const sampleRate = finalBuffer.sampleRate; // ahora siempre ≤ 44100
	const encoder = new Mp3Encoder(channels, sampleRate, 128);

	const left = finalBuffer.getChannelData(0);
	const right = channels > 1 ? finalBuffer.getChannelData(1) : left;

	const toInt16 = (float32) => {
		const int16 = new Int16Array(float32.length);
		for (let i = 0; i < float32.length; i++) {
			int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
		}
		return int16;
	};

	const leftInt16 = toInt16(left);
	const rightInt16 = toInt16(right);

	const chunkSize = 1152;
	const mp3Data = [];

	for (let i = 0; i < leftInt16.length; i += chunkSize) {
		const leftChunk = leftInt16.subarray(i, i + chunkSize);
		const rightChunk = rightInt16.subarray(i, i + chunkSize);
		const encoded = encoder.encodeBuffer(leftChunk, rightChunk);
		if (encoded.length > 0) mp3Data.push(encoded);
	}

	const final = encoder.flush();
	if (final.length > 0) mp3Data.push(final);

	return new Blob(mp3Data, { type: "audio/mp3" });
};

const ConversacionChat = forwardRef(
	(
		{
			conversacion,
			onTomarControl,
			onDevolverBot,
			onSoltar,
			onVolver,
			onMensajeEnviado,
			esVendedor,
			esSupervisor,
			mensajesPredefinidos = [],
			esAdmin,
			onEliminar,
			onCerrar,
			onResumenActualizado,
			onConsultaGenerada,
			onNotaActualizada,
			onMarcarNoLeido,
			onToggleOcultoMensaje,
		},
		ref,
	) => {
		const { userRol, user } = useAuth();
		const userId = user?.id;
		const userName = user?.name?.split(" ")[0] || "";
		const userLastName = user?.name?.split(" ").slice(1).join(" ") || "";

		const [inputValue, setInputValue] = useState("");
		const [enviando, setEnviando] = useState(false);
		const [errorEnvio, setErrorEnvio] = useState(null);
		const messagesEndRef = useRef(null);
		const textareaRef = useRef(null);
		const [perfilOpen, setPerfilOpen] = useState(false);
		const [mostrarPredefinidos, setMostrarPredefinidos] = useState(false);
		const [grabando, setGrabando] = useState(false);
		const [audioBlob, setAudioBlob] = useState(null);
		const [enviandoAudio, setEnviandoAudio] = useState(false);
		const mediaRecorderRef = useRef(null);
		const chunksRef = useRef([]);
		const mediaInputRef = useRef(null);
		const streamRef = useRef(null);
		const [archivosPreview, setArchivosPreview] = useState([]); // [{ file, url, tipo }]
		const [enviandoMedia, setEnviandoMedia] = useState(false);
		const [segundosGrabando, setSegundosGrabando] = useState(0);
		const timerGrabacionRef = useRef(null);

		const liberarStream = () => {
			clearInterval(timerGrabacionRef.current);
			timerGrabacionRef.current = null;
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => t.stop());
				streamRef.current = null;
			}
		};

		useEffect(() => {
			setMostrarPredefinidos(false);
			liberarStream();
			if (mediaRecorderRef.current && grabando) {
				mediaRecorderRef.current.stop();
				setGrabando(false);
			}
		}, [conversacion?.id]);

		useEffect(() => {
			const timer = setTimeout(() => {
				if (messagesEndRef.current) {
					messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
				}
			}, 50);
			return () => clearTimeout(timer);
		}, [conversacion?.mensajes?.length, conversacion?.id]);

		useEffect(() => {
			const contenedor = document.querySelector(".conv-chat__mensajes");
			if (!contenedor) return;

			const handleLoad = () => {
				if (messagesEndRef.current) {
					messagesEndRef.current.scrollIntoView({ behavior: "auto" });
				}
			};
			contenedor.addEventListener("load", handleLoad, true);
			return () => contenedor.removeEventListener("load", handleLoad, true);
		}, [conversacion?.id]);

		useEffect(() => {
			setInputValue("");
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		}, [conversacion?.id]);

		if (!conversacion) {
			return (
				<div className="conv-chat conv-chat--empty" ref={ref}>
					<div className="conv-chat__empty-state">
						<EmptyInboxIcon size={52} style={{ color: "#2a2a2a" }} />
						<p className="conv-chat__empty-title">Seleccioná una conversación</p>
						<p className="conv-chat__empty-sub">Elegí un chat de la lista para ver los mensajes</p>
					</div>
				</div>
			);
		}

		const esAsesor = conversacion.estado === "asesor";
		const esCerrada = conversacion.estado === "cerrada";
		const esMiConversacion = String(conversacion.asesorId) === String(userId);
		const puedeResponder = esAsesor && !esCerrada && !esSupervisor && (esAdmin || esMiConversacion);
		const items = getMensajesConSeparadores(conversacion.mensajes);

		const handleEnviar = async () => {
			const texto = inputValue.trim();
			if (!texto || !puedeResponder || enviando) return;

			setEnviando(true);
			setErrorEnvio(null);
			try {
				await onMensajeEnviado(conversacion.id, texto);
				setInputValue("");
				if (textareaRef.current) {
					textareaRef.current.style.height = "auto";
					textareaRef.current.focus();
				}
			} catch (_) {
				setErrorEnvio("No se pudo enviar el mensaje. Intentá de nuevo.");
				setTimeout(() => setErrorEnvio(null), 3000);
			} finally {
				setEnviando(false);
			}
		};

		const esIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

		const getMimeTypeSoportado = () => {
			const tipos = ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm", "audio/ogg"];
			return tipos.find((t) => MediaRecorder.isTypeSupported(t)) || "";
		};

		const handleMicDown = async () => {
			if (!puedeResponder || grabando) return;
			chunksRef.current = [];

			try {
				const unlockCtx = new (window.AudioContext || window.webkitAudioContext)();
				await unlockCtx.resume();
				await unlockCtx.close();
			} catch (_) {}

			let stream;
			try {
				stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				streamRef.current = stream;
			} catch (e) {
				console.error("❌ getUserMedia falló:", e.name, e.message);
				setErrorEnvio(`Micrófono no disponible: ${e.name}`);
				setTimeout(() => setErrorEnvio(null), 4000);
				return;
			}

			const mimeType = getMimeTypeSoportado();
			const recorderOptions = mimeType ? { mimeType } : {};

			let recorder;
			try {
				recorder = new MediaRecorder(stream, recorderOptions);
			} catch (e) {
				console.error("❌ MediaRecorder falló:", e.name, e.message);
				// Intentar sin opciones como fallback
				try {
					recorder = new MediaRecorder(stream);
				} catch (e2) {
					console.error("❌ MediaRecorder sin opciones también falló:", e2.message);
					stream.getTracks().forEach((t) => t.stop());
					setErrorEnvio("Tu dispositivo no soporta grabación de audio.");
					setTimeout(() => setErrorEnvio(null), 3000);
					return;
				}
			}

			mediaRecorderRef.current = recorder;

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};

			recorder.onstop = async () => {
				const actualMime = recorder.mimeType || mimeType || "audio/webm";
				const rawBlob = new Blob(chunksRef.current, { type: actualMime });

				if (esIOS() || actualMime.includes("mp4") || actualMime.includes("aac")) {
					setAudioBlob(rawBlob);
					stream.getTracks().forEach((t) => t.stop());
					streamRef.current = null;
					return;
				}

				try {
					const mp3Blob = await convertirAMp3(rawBlob);
					setAudioBlob(mp3Blob);
				} catch (e) {
					console.warn("No se pudo convertir, usando raw:", e);
					setAudioBlob(rawBlob);
				}

				stream.getTracks().forEach((t) => t.stop());
			};

			try {
				recorder.start(250);
				setGrabando(true);
				setSegundosGrabando(0);
				timerGrabacionRef.current = setInterval(() => {
					setSegundosGrabando((s) => s + 1);
				}, 1000);
			} catch (e) {
				console.error("❌ recorder.start() falló:", e.message);
				stream.getTracks().forEach((t) => t.stop());
			}
		};

		const handleMicUp = async () => {
			if (!mediaRecorderRef.current || !grabando) return;
			clearInterval(timerGrabacionRef.current);
			timerGrabacionRef.current = null;
			mediaRecorderRef.current.stop();
			setGrabando(false);
			setTimeout(() => liberarStream(), 1000);
		};

		const handleEnviarAudio = async () => {
			if (!audioBlob || enviandoAudio) return;
			setEnviandoAudio(true);
			try {
				await enviarAudio(conversacion.id, audioBlob, {
					rol: userRol,
					userId,
					nombre: userName,
					apellido: userLastName,
				});
				setAudioBlob(null);
			} catch (_) {
				setErrorEnvio("No se pudo enviar el audio. Intentá de nuevo.");
				setTimeout(() => setErrorEnvio(null), 3000);
			} finally {
				setEnviandoAudio(false);
			}
		};

		const handleMediaChange = (e) => {
			const files = Array.from(e.target.files || []);
			if (!files.length) return;
			e.target.value = "";

			const LIMITE_VIDEO = 16 * 1024 * 1024;

			const rechazados = [];
			const aceptados = [];

			for (const file of files) {
				const esVideo = file.type.startsWith("video");
				if (esVideo && file.size > LIMITE_VIDEO) {
					rechazados.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB — límite 16MB)`);
				} else {
					aceptados.push(file);
				}
			}

			if (rechazados.length) {
				setErrorEnvio(`Video demasiado grande: ${rechazados.join(", ")}`);
				setTimeout(() => setErrorEnvio(null), 5000);
			}

			if (!aceptados.length) return;

			const nuevos = aceptados.map((file) => ({
				file,
				url: URL.createObjectURL(file),
				tipo: file.type.startsWith("video") ? "video" : "image",
			}));
			setArchivosPreview((prev) => [...prev, ...nuevos]);
		};

		const handleQuitarArchivo = (index) => {
			setArchivosPreview((prev) => {
				URL.revokeObjectURL(prev[index].url);
				return prev.filter((_, i) => i !== index);
			});
		};

		const handleEnviarMedia = async () => {
			if (!archivosPreview.length || enviandoMedia) return;
			setEnviandoMedia(true);
			let fallaron = 0;
			try {
				for (const item of archivosPreview) {
					const formData = new FormData();
					formData.append("file", item.file);
					try {
						await enviarMedia(conversacion.id, formData, {
							rol: userRol,
							userId,
							nombre: userName,
							apellido: userLastName,
						});
						// Se saca del compositor apenas se confirma el envío — si una
						// foto más adelante falla, las que ya se mandaron no quedan
						// "pegadas" en la lista (y no se reenvían duplicadas al
						// reintentar, ya que solo queda lo que realmente falta).
						setArchivosPreview((prev) => {
							URL.revokeObjectURL(item.url);
							return prev.filter((p) => p !== item);
						});
					} catch (err) {
						fallaron++;
						console.error("Error al enviar archivo:", err);
					}
				}
				if (fallaron > 0) {
					setErrorEnvio(
						fallaron === 1
							? "No se pudo enviar 1 archivo. Quedó listo para reintentar."
							: `No se pudieron enviar ${fallaron} archivos. Quedaron listos para reintentar.`,
					);
					setTimeout(() => setErrorEnvio(null), 5000);
				}
			} finally {
				setEnviandoMedia(false);
			}
		};

		return (
			<div className="conv-chat" ref={ref}>
				<ConversacionHeader
					conversacion={conversacion}
					onTomarControl={onTomarControl}
					onDevolverBot={onDevolverBot}
					onSoltar={onSoltar}
					userId={userId}
					onVolver={onVolver}
					onVerPerfil={() => setPerfilOpen(true)}
					esVendedor={esVendedor}
					esSupervisor={esSupervisor}
					esAdmin={esAdmin}
					onEliminar={onEliminar}
					onCerrar={onCerrar}
					onMarcarNoLeido={onMarcarNoLeido}
				/>
				<ContactoPerfilDrawer
					conversacion={conversacion}
					open={perfilOpen}
					onClose={() => setPerfilOpen(false)}
					esVendedor={esVendedor}
					esSupervisor={esSupervisor}
					onResumenActualizado={onResumenActualizado}
					onConsultaGenerada={onConsultaGenerada}
					onNotaActualizada={onNotaActualizada}
				/>

				<div className="conv-chat__mensajes">
					{items.map((item, index) => {
						if (item.tipo === "separador") {
							return (
								<div key={item.id} className="conv-chat__separador">
									<span>{item.label}</span>
								</div>
							);
						}
						return (
							<div
								key={item.id}
								id={`msg-${item.waMsgId || item.id}`}
								className="conv-chat__burbuja-anim"
								style={{ animationDelay: `${Math.min(index * 0.04, 0.5)}s` }}
							>
								<ConversacionBurbuja
									mensaje={item}
									esVendedor={esVendedor}
									esSupervisor={esSupervisor}
									mensajes={conversacion.mensajes}
									esAdmin={esAdmin}
									onToggleOculto={onToggleOcultoMensaje ? () => onToggleOcultoMensaje(conversacion.id, item.id) : undefined}
								/>
							</div>
						);
					})}
					<div ref={messagesEndRef} />
				</div>

				<div className="conv-chat__input-area">
					{errorEnvio && <div className="conv-chat__error">{errorEnvio}</div>}

					{!puedeResponder && (
						<div className={`conv-chat__banner conv-chat__banner--${conversacion.estado}`}>
							{conversacion.estado === "bot" && (
								<>
									<BotIcon size={14} style={{ color: "#3b82f6" }} />
									<span>
										El bot está manejando esta conversación.{" "}
										<button className="conv-chat__banner-btn" onClick={onTomarControl}>
											Tomá el control
										</button>{" "}
										para responder.
									</span>
								</>
							)}

							{conversacion.estado === "cerrada" && <span>Esta conversación está cerrada.</span>}

							{conversacion.estado === "asesor" &&
								!esMiConversacion &&
								!esAdmin &&
								(conversacion.asesorId ? (
									<span>Esta conversación la está atendiendo {conversacion.asesorNombre || "otro asesor"}.</span>
								) : (
									<span>
										Conversación disponible.{" "}
										<button className="conv-chat__banner-btn" onClick={onTomarControl}>
											Tomá el control
										</button>{" "}
										para responder.
									</span>
								))}
						</div>
					)}

					{puedeResponder && (
						<div className="conv-chat__input-wrap">
							{mostrarPredefinidos && (
								<div className="conv-chat__predefinidos">
									{mensajesPredefinidos.map((msg) => (
										<button
											key={msg}
											className="conv-chat__predefinido-btn"
											onClick={() => {
												setInputValue(msg);
												setMostrarPredefinidos(false);
												textareaRef.current?.focus();
											}}
										>
											{msg}
										</button>
									))}
								</div>
							)}

							<div className="conv-chat__input-row">
								<button
									className={`conv-chat__predefinidos-toggle ${mostrarPredefinidos ? "conv-chat__predefinidos-toggle--activo" : ""}`}
									onClick={() => setMostrarPredefinidos((v) => !v)}
									title="Mensajes predeterminados"
								>
									<svg viewBox="0 0 20 20" fill="none" width="16" height="16">
										<path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
									</svg>
								</button>

								{/* Input oculto para archivos */}
								<input
									ref={mediaInputRef}
									type="file"
									accept="image/jpeg,image/png,video/mp4"
									multiple
									style={{ display: "none" }}
									onChange={handleMediaChange}
								/>

								{audioBlob ? (
									// ── Preview de audio grabado — reemplaza el textarea ──
									<div className="conv-chat__audio-preview">
										<audio controls src={URL.createObjectURL(audioBlob)} className="conv-chat__audio-preview-player" />
										<button
											className="conv-chat__audio-cancel"
											onClick={() => {
												setAudioBlob(null);
												liberarStream();
											}}
											title="Cancelar"
										>
											✕
										</button>
										<button className="conv-chat__send-btn" onClick={handleEnviarAudio} disabled={enviandoAudio}>
											{enviandoAudio ? <span className="conv-chat__spinner-small" /> : <SendIcon size={17} />}
										</button>
									</div>
								) : archivosPreview.length > 0 ? (
									// ── Preview de archivos seleccionados ──
									<div className="conv-chat__media-preview">
										<div className="conv-chat__media-preview-list">
											{archivosPreview.map((item, i) => (
												<div key={i} className="conv-chat__media-preview-item">
													{item.tipo === "image" ? (
														<img src={item.url} alt={`preview-${i}`} className="conv-chat__media-preview-thumb" />
													) : (
														<video src={item.url} className="conv-chat__media-preview-thumb" muted />
													)}
													<button className="conv-chat__media-preview-remove" onClick={() => handleQuitarArchivo(i)} title="Quitar">
														✕
													</button>
												</div>
											))}
											{/* Botón para agregar más */}
											<button className="conv-chat__media-preview-add" onClick={() => mediaInputRef.current?.click()} title="Agregar más">
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
													<line x1="12" y1="5" x2="12" y2="19" />
													<line x1="5" y1="12" x2="19" y2="12" />
												</svg>
											</button>
										</div>
										<div className="conv-chat__media-preview-actions">
											<button
												className="conv-chat__audio-cancel"
												onClick={() => {
													archivosPreview.forEach((a) => URL.revokeObjectURL(a.url));
													setArchivosPreview([]);
												}}
											>
												Cancelar
											</button>
											<button className="conv-chat__send-btn" onClick={handleEnviarMedia} disabled={enviandoMedia}>
												{enviandoMedia ? <span className="conv-chat__spinner-small" /> : <SendIcon size={17} />}
											</button>
										</div>
									</div>
								) : grabando ? (
									// ── Modo grabando ──
									<>
										<div className="conv-chat__grabando-indicator">
											<span className="conv-chat__grabando-dot" />
											<span className="conv-chat__grabando-texto">Grabando... {segundosGrabando}s</span>
											<button className="conv-chat__grabando-stop" onClick={handleMicUp}>
												Detener
											</button>
										</div>
										<button className="conv-chat__mic-btn conv-chat__mic-btn--grabando" onClick={handleMicUp} title="Detener grabación">
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
												<rect x="9" y="2" width="6" height="12" rx="3" />
												<path d="M5 10a7 7 0 0 0 14 0" />
												<line x1="12" y1="19" x2="12" y2="22" />
												<line x1="9" y1="22" x2="15" y2="22" />
											</svg>
										</button>
									</>
								) : (
									// ── Modo normal ──
									<>
										<textarea
											ref={textareaRef}
											className="conv-chat__textarea"
											value={inputValue}
											onChange={(e) => {
												setInputValue(e.target.value);
												const el = e.target;
												el.style.height = "auto";
												el.style.height = Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT) + "px";
											}}
											placeholder="Escribí un mensaje..."
											rows={1}
											disabled={enviando}
										/>
										{/* Botón adjuntar */}
										<button
											className="conv-chat__mic-btn"
											onClick={() => mediaInputRef.current?.click()}
											disabled={enviandoMedia}
											title="Adjuntar imagen o video"
										>
											{enviandoMedia ? (
												<span className="conv-chat__spinner-small" />
											) : (
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
													<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
												</svg>
											)}
										</button>
										<button
											className="conv-chat__mic-btn"
											onClick={grabando ? handleMicUp : handleMicDown}
											title={grabando ? "Detener grabación" : "Grabar audio"}
										>
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
												<rect x="9" y="2" width="6" height="12" rx="3" />
												<path d="M5 10a7 7 0 0 0 14 0" />
												<line x1="12" y1="19" x2="12" y2="22" />
												<line x1="9" y1="22" x2="15" y2="22" />
											</svg>
										</button>
										<button
											className="conv-chat__send-btn"
											onClick={handleEnviar}
											disabled={!inputValue.trim() || enviando}
											aria-label="Enviar mensaje"
										>
											{enviando ? <span className="conv-chat__spinner-small" /> : <SendIcon size={17} />}
										</button>
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		);
	},
);

ConversacionChat.displayName = "ConversacionChat";

export default ConversacionChat;
