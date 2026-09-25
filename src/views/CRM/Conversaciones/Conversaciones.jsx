import "./Conversaciones.css";
import ConversacionLista from "../../../components/CRM/Conversaciones/ConversacionLista/ConversacionLista";
import ConversacionChat from "../../../components/CRM/Conversaciones/ConversacionChat/ConversacionChat";
import MensajesPredefinidosModal from "../../../components/CRM/Conversaciones/MensajesPredefinidosModal/MensajesPredefinidosModal";
import { LoadingState, ErrorState, ErrorToast } from "../../../components/CRM/PageState/PageState";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import {
	getConversaciones,
	getConversacionById,
	updateEstado,
	tomarConversacion,
	soltarConversacion,
	marcarLeido,
	enviarMensaje,
	eliminarConversacion,
	marcarNoLeido,
	toggleOcultoMensaje,
} from "../../../services/conversaciones.service";
import { useRoles } from "../../../hooks/useRoles";
import { getMensajesPredefinidos, updateMensajesPredefinidos } from "../../../services/configuracion.service";
import { getConsultaById } from "../../../services/consultas.service";
import { useLocation } from "react-router-dom";
import NuevoChatModal from "../../../components/CRM/Conversaciones/NuevoChatModal/NuevoChatModal";

const PAGE_SIZE = 50;

export default function Conversaciones() {
	const { userRol, user, esVendedorOPublicador: esVendedor, esSupervisor, esAdmin, esPublicadorVendedor } = useRoles();
	const puedeIniciarChat = esAdmin || esSupervisor || esPublicadorVendedor;
	const userId = user?.id;
	const userName = user?.name?.split(" ")[0] || "";
	const userLastName = user?.name?.split(" ").slice(1).join(" ") || "";
	const [mensajesPredefinidos, setMensajesPredefinidos] = useState([]);
	useEffect(() => {
		getMensajesPredefinidos()
			.then(setMensajesPredefinidos)
			.catch(() => setMensajesPredefinidos(MENSAJES_PREDEFINIDOS_DEFAULT));
	}, []);

	const [seleccionadaId, setSeleccionadaId] = useState(null);
	const seleccionadaIdRef = useRef(seleccionadaId);
	const marcandoRef = useRef(new Set());
	const marcarLeidoSeguroRef = useRef(() => {});
	const [conversaciones, setConversaciones] = useState([]);
	const conversacionesRef = useRef([]);
	useEffect(() => {
		conversacionesRef.current = conversaciones;
	}, [conversaciones]);
	const [cargando, setCargando] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [cargandoMas, setCargandoMas] = useState(false);
	const [vistaMovil, setVistaMovil] = useState("lista");
	const [modalPredefinidosOpen, setModalPredefinidosOpen] = useState(false);
	const [modalNuevoChatOpen, setModalNuevoChatOpen] = useState(false);
	const [errorGlobal, setErrorGlobal] = useState(null);

	// ── Carga inicial ──────────────────────────────────────────────
	useEffect(() => {
		const cargar = async () => {
			try {
				const data = await getConversaciones({ rol: userRol, userId, page: 1, limit: PAGE_SIZE });
				setConversaciones(data.resp || []);
				setPage(1);
				setHasMore(data.meta?.hasMore ?? false);
			} catch (err) {
				console.error("Error cargando conversaciones:", err);
				setErrorGlobal("No se pudieron cargar las conversaciones.");
			} finally {
				setCargando(false);
			}
		};
		cargar();
	}, [userRol, userId]);

	const handleCargarMas = useCallback(async () => {
		if (cargandoMas || !hasMore) return;
		const siguiente = page + 1;
		try {
			setCargandoMas(true);
			const data = await getConversaciones({ rol: userRol, userId, page: siguiente, limit: PAGE_SIZE });
			setConversaciones((prev) => {
				const idsExistentes = new Set(prev.map((c) => c.id));
				return [...prev, ...(data.resp || []).filter((c) => !idsExistentes.has(c.id))];
			});
			setPage(siguiente);
			setHasMore(data.meta?.hasMore ?? false);
		} catch (err) {
			console.error("Error cargando más conversaciones:", err);
		} finally {
			setCargandoMas(false);
		}
	}, [cargandoMas, hasMore, page, userRol, userId]);

	const telefonoAutoseleccionadoRef = useRef(false);
	const location = useLocation();
	useEffect(() => {
		if (!conversaciones.length) return;
		if (telefonoAutoseleccionadoRef.current) return;
		const params = new URLSearchParams(location.search);
		const tel = params.get("telefono");
		const id = params.get("id");

		// ── Por ID directo ──
		if (id) {
			const conv = conversaciones.find((c) => c.id === Number(id));
			if (conv) {
				telefonoAutoseleccionadoRef.current = true;
				handleSeleccionar(conv.id);
				return;
			}

			// No está en la lista ya cargada (puede ser vieja y haber quedado
			// fuera de la primera página) — la buscamos puntualmente.
			telefonoAutoseleccionadoRef.current = true;
			getConversacionById(id)
				.then((data) => {
					const encontrada = data.resp;
					if (!encontrada) return;
					setConversaciones((prev) => (prev.some((c) => c.id === encontrada.id) ? prev : [encontrada, ...prev]));
					handleSeleccionar(encontrada.id);
				})
				.catch(() => setErrorGlobal("No se encontró la conversación."));
			return;
		}

		// ── Por teléfono (lógica existente) ──
		if (!tel) return;
		const conv = conversaciones.find((c) => {
			const convTel = c.telefono?.replace(/\D/g, "") || "";
			const queryTel = tel.replace(/\D/g, "");
			return (
				convTel === queryTel ||
				convTel === "549" + queryTel ||
				convTel === "54" + queryTel ||
				queryTel === "549" + convTel ||
				queryTel === "54" + convTel
			);
		});
		if (conv) {
			telefonoAutoseleccionadoRef.current = true;
			handleSeleccionar(conv.id);
		}
	}, [conversaciones, location.search]);

	const conversacionActiva = conversaciones.find((c) => c.id === seleccionadaId) || null;
	useEffect(() => {
		seleccionadaIdRef.current = seleccionadaId;
	}, [seleccionadaId]);
	// ── WebSocket ──────────────────────────────────────────────────
	useEffect(() => {
		const socket = io(import.meta.env.VITE_API_URL, {
			transports: ["polling", "websocket"],
		});

		socket.on("conversacion:mensaje", (data) => {
			// El intercambio del seguimiento de 7 días queda oculto para cualquier
			// vendedor — solo admin/supervisor lo ven (ver procesarMensaje.js).
			if (data.mensaje?.esSeguimiento7Dias && !esAdmin && !esSupervisor) return;

			setConversaciones((prev) =>
				prev.map((c) => {
					if (c.id !== data.conversacionId) return c;
					const estaAbierta = c.id === seleccionadaIdRef.current;
					const yaExiste = (c.mensajes || []).some((m) => m.id === data.mensaje.id);
					// Ordenar por timestamp en vez de solo agregar al final: el backend
					// puede emitir este evento fuera de orden cronológico (ej: mensajes
					// del cliente encolados mientras el bot procesaba uno anterior, o
					// imágenes que tardan distinto en descargarse) — sin este sort, un
					// mensaje llegado "tarde" quedaba visualmente respondiendo a otra
					// cosa, o un mensaje más viejo aparecía después de uno más nuevo.
					const mensajes = yaExiste
						? (c.mensajes || []).map((m) => (m.id === data.mensaje.id ? data.mensaje : m))
						: [...(c.mensajes || []), data.mensaje].sort(
								(a, b) => new Date(a.timestamp) - new Date(b.timestamp),
							);
					// Si el backend no informó noLeido explícitamente, solo lo incrementamos
					// para mensajes reales del cliente — mensajes salientes (asesor, bot,
					// seguimientos automáticos) no deben inflar el contador si el emisor
					// del evento se olvidó de incluirlo, o quedaba un "no leído" fantasma
					// que nunca se correspondía con la base de datos.
					const noLeidoFallback = data.mensaje?.autor === "contacto" ? (c.noLeido || 0) + 1 : c.noLeido || 0;
					return {
						...c,
						mensajes,
						ultimoMensaje: data.ultimoMensaje,
						ultimaActividad: data.ultimaActividad,
						noLeido: estaAbierta ? 0 : (data.noLeido ?? noLeidoFallback),
						adminNoLeido: estaAbierta ? false : (data.adminNoLeido ?? c.adminNoLeido),
					};
				}),
			);

			if (data.conversacionId === seleccionadaIdRef.current) {
				marcarLeidoSeguroRef.current(data.conversacionId);
			}
		});

		socket.on("conversacion:estadoCambiado", (data) => {
			setConversaciones((prev) =>
				prev.map((c) =>
					c.id !== data.conversacionId
						? c
						: {
								...c,
								estado: data.estado,
								asesorNombre: data.asesorNombre,
								asesorApellido: data.asesorApellido,
							},
				),
			);
		});

		// Cuando el bot deriva a humano — mover a "en espera" para vendedores
		socket.on("conversacion:derivada", (data) => {
			setConversaciones((prev) =>
				prev.map((c) =>
					c.id !== data.conversacionId
						? c
						: {
								...c,
								estado: "asesor",
								asesorId: null, // sin asignar todavía, visible para todos
							},
				),
			);
		});

		socket.on("conversacion:actualizada", (data) => {
			setConversaciones((prev) =>
				prev.map((c) =>
					c.id !== data.conversacionId
						? c
						: {
								...c,
								...(data.estado && { estado: data.estado }),
								...(data.noLeido !== undefined && { noLeido: data.noLeido }),
								...(data.adminNoLeido !== undefined && { adminNoLeido: data.adminNoLeido }),
								...(data.consultaId !== undefined && { consultaId: data.consultaId, consulta: data.consultaId ? c.consulta : null }),
							},
				),
			);

			// El evento solo trae el id — traemos la consulta completa (estado, vehículo,
			// eventos) para que el panel del contacto no quede a medias hasta refrescar.
			if (data.consultaId) {
				getConsultaById(data.consultaId)
					.then((res) => {
						const consulta = res?.resp;
						if (!consulta) return;
						setConversaciones((prev) => prev.map((c) => (c.id !== data.conversacionId ? c : { ...c, consulta })));
					})
					.catch(() => {});
			}
		});

		socket.on("conversacion:nueva", (data) => {
			setConversaciones((prev) => {
				const yaExiste = prev.find((c) => c.id === data.conversacion.id);
				if (yaExiste) return prev;
				return [{ ...data.conversacion, mensajes: data.conversacion.mensajes || [] }, ...prev];
			});
		});

		socket.on("conversacion:resumenActualizado", (data) => {
			setConversaciones((prev) => prev.map((c) => (c.id !== data.conversacionId ? c : { ...c, resumenIA: data.resumenIA })));
		});

		socket.on("conversacion:eliminada", ({ conversacionId }) => {
			setConversaciones((prev) => prev.filter((c) => c.id !== conversacionId));
			if (seleccionadaIdRef.current === conversacionId) {
				setSeleccionadaId(null);
				setVistaMovil("lista");
			}
		});

		socket.on("conversacion:leida", (data) => {
			setConversaciones((prev) =>
				prev.map((c) => (c.id !== data.conversacionId ? c : { ...c, noLeido: 0, adminNoLeido: data.adminNoLeido })),
			);
		});

		// Un mensaje se ocultó (seguimiento de 7 días clasificado, u ocultamiento
		// manual del admin). Para el vendedor desaparece de la lista; para
		// admin/supervisor se queda, solo marcado — ellos siempre ven todo.
		socket.on("conversacion:mensajeEliminado", ({ conversacionId, mensajeId, campo }) => {
			setConversaciones((prev) =>
				prev.map((c) => {
					if (c.id !== conversacionId) return c;
					const mensajes =
						esAdmin || esSupervisor
							? (c.mensajes || []).map((m) => (m.id === mensajeId ? { ...m, [campo || "ocultoManual"]: true } : m))
							: (c.mensajes || []).filter((m) => m.id !== mensajeId);
					return { ...c, mensajes };
				}),
			);
		});

		// Se restauró un mensaje que estaba oculto manualmente.
		socket.on("conversacion:mensajeRestaurado", ({ conversacionId, mensaje }) => {
			setConversaciones((prev) =>
				prev.map((c) => {
					if (c.id !== conversacionId) return c;
					const yaExiste = (c.mensajes || []).some((m) => m.id === mensaje.id);
					const mensajes = yaExiste
						? (c.mensajes || []).map((m) => (m.id === mensaje.id ? mensaje : m))
						: [...(c.mensajes || []), mensaje].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
					return { ...c, mensajes };
				}),
			);
		});

		// Alguien soltó una conversación: puede aparecer nueva en la bolsa de "libres"
		// (si antes era de otro asesor y este vendedor no la tenía en su lista local),
		// así que reconsultamos en vez de solo mapear el estado local.
		const refrescarCargadas = async () => {
			const limiteActual = Math.max(conversacionesRef.current.length, PAGE_SIZE);
			const data = await getConversaciones({ rol: userRol, userId, page: 1, limit: limiteActual });
			setConversaciones(data.resp || []);
			setPage(Math.max(1, Math.ceil((data.resp?.length || 0) / PAGE_SIZE)));
			setHasMore(data.meta?.hasMore ?? false);
		};

		socket.on("conversacion:soltada", async () => {
			try {
				await refrescarCargadas();
			} catch (err) {
				console.error("Error refrescando tras liberar conversación:", err);
			}
		});

		socket.io.on("reconnect", async () => {
			try {
				await refrescarCargadas();
			} catch (err) {
				console.error("Error refrescando tras reconexión:", err);
			}
		});

		return () => socket.disconnect();
	}, [userRol, userId]);

	const handleMarcarNoLeido = useCallback(async () => {
		if (!seleccionadaId) return;
		try {
			await marcarNoLeido(seleccionadaId);
			setConversaciones((prev) => prev.map((c) => (c.id === seleccionadaId ? { ...c, noLeido: 1, adminNoLeido: true } : c)));
			setSeleccionadaId(null);
			setVistaMovil("lista");
		} catch (_) {}
	}, [seleccionadaId]);

	const handleSoltar = useCallback(async () => {
		if (!seleccionadaId) return;
		try {
			await soltarConversacion(seleccionadaId, { rol: userRol, userId });
			setConversaciones((prev) =>
				prev.map((c) => (c.id !== seleccionadaId ? c : { ...c, asesorId: null, asesorNombre: null, asesorApellido: null })),
			);
		} catch (err) {
			console.error("Error soltando conversación:", err);
			setErrorGlobal(err?.error || "No se pudo soltar la conversación.");
			setTimeout(() => setErrorGlobal(null), 3000);
		}
	}, [seleccionadaId, userRol, userId]);

	const marcarLeidoSeguro = useCallback(
		async (id) => {
			if (marcandoRef.current.has(id)) return;
			marcandoRef.current.add(id);
			try {
				await marcarLeido(id, { rol: userRol, userId });
			} catch (err) {
				console.error("Error marcando como leído:", err);
				try {
					await marcarLeido(id, { rol: userRol, userId });
				} catch (err2) {
					console.error("Reintento de marcarLeido también falló:", err2);
				}
			} finally {
				marcandoRef.current.delete(id);
			}
		},
		[userRol, userId],
	);
	useEffect(() => {
		marcarLeidoSeguroRef.current = marcarLeidoSeguro;
	}, [marcarLeidoSeguro]);

	const handleSeleccionar = useCallback(
		async (id) => {
			setSeleccionadaId(id);
			setVistaMovil("chat");
			setConversaciones((prev) => prev.map((c) => (c.id === id ? { ...c, noLeido: 0, ...(esAdmin && { adminNoLeido: false }) } : c)));
			await marcarLeidoSeguro(id); // ← antes tenía el try/catch acá adentro
		},
		[esAdmin, marcarLeidoSeguro],
	);

	const handleChatCreado = useCallback(
		(conv) => {
			setConversaciones((prev) => {
				const yaExiste = prev.find((c) => c.id === conv.id);
				if (yaExiste) return prev;
				return [{ ...conv, mensajes: conv.mensajes || [] }, ...prev];
			});
			handleSeleccionar(conv.id);
		},
		[handleSeleccionar],
	);

	const handleReabrir = useCallback(async () => {
		if (!seleccionadaId) return;
		try {
			const data = await updateEstado(seleccionadaId, "asesor", {
				rol: userRol,
				userId,
				nombre: userName,
				apellido: userLastName,
			});
			setConversaciones((prev) =>
				prev.map((c) =>
					c.id !== seleccionadaId
						? c
						: {
								...c,
								estado: "asesor",
								asesorId: userId,
								asesorNombre: userName,
								asesorApellido: userLastName,
							},
				),
			);
		} catch (err) {
			console.error("Error reabriendo conversación:", err);
			setErrorGlobal(err?.error || "No se pudo reabrir la conversación.");
			setTimeout(() => setErrorGlobal(null), 3000);
		}
	}, [seleccionadaId, userRol, userId, userName, userLastName]);

	useEffect(() => {
		const onVisible = () => {
			if (document.visibilityState === "visible" && seleccionadaIdRef.current) {
				marcarLeidoSeguro(seleccionadaIdRef.current);
			}
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, [marcarLeidoSeguro]);

	const handleEliminarConversacion = useCallback(async () => {
		if (!seleccionadaId) return;
		try {
			await eliminarConversacion(seleccionadaId, { rol: userRol, userId });
			setConversaciones((prev) => prev.filter((c) => c.id !== seleccionadaId));
			setSeleccionadaId(null);
			setVistaMovil("lista");
		} catch (err) {
			setErrorGlobal("No se pudo eliminar la conversación.");
			setTimeout(() => setErrorGlobal(null), 3000);
		}
	}, [seleccionadaId, userRol, userId]);

	const handleCerrarConversacion = useCallback(async (estadoConsulta) => {
		if (!seleccionadaId) return;
		try {
			await updateEstado(seleccionadaId, "cerrada", estadoConsulta);
		} catch (err) {
			setErrorGlobal(err?.error || "No se pudo cerrar la conversación.");
			setTimeout(() => setErrorGlobal(null), 3000);
		}
	}, [seleccionadaId]);

	const handleTomarControl = useCallback(async () => {
		if (!seleccionadaId) return;
		try {
			await tomarConversacion(seleccionadaId, {
				rol: userRol,
				userId,
				nombre: userName,
				apellido: userLastName,
			});
			// El socket conversacion:tomada actualiza el resto de clientes
			// Actualizar local para quien tomó
			setConversaciones((prev) =>
				prev.map((c) =>
					c.id !== seleccionadaId
						? c
						: {
								...c,
								estado: "asesor",
								asesorId: userId,
								asesorNombre: userName,
								asesorApellido: userLastName,
							},
				),
			);
		} catch (err) {
			console.error("Error tomando control:", err);
			setErrorGlobal(err?.error || "No se pudo tomar el control.");
			setTimeout(() => setErrorGlobal(null), 3000);
		}
	}, [seleccionadaId, userRol, userId, userName, userLastName]);

	const handleDevolverBot = useCallback(async () => {
		if (!seleccionadaId) return;
		try {
			await updateEstado(seleccionadaId, "bot", { rol: userRol, userId });
		} catch (err) {
			console.error("Error devolviendo al bot:", err);
			setErrorGlobal(err?.error || "No se pudo devolver al bot.");
			setTimeout(() => setErrorGlobal(null), 3000);
		}
	}, [seleccionadaId, userRol, userId]);

	const handleMensajeEnviado = useCallback(
		async (convId, texto) => {
			try {
				await enviarMensaje(convId, texto, {
					rol: userRol,
					userId,
					nombre: userName,
					apellido: userLastName,
				});
			} catch (err) {
				console.error("Error enviando mensaje:", err);
				setErrorGlobal("No se pudo enviar el mensaje.");
				setTimeout(() => setErrorGlobal(null), 3000);
			}
		},
		[userRol, userId, userName, userLastName],
	);

	const handleToggleOcultoMensaje = useCallback(async (convId, mensajeId) => {
		try {
			const data = await toggleOcultoMensaje(convId, mensajeId);
			const actualizado = data.resp;
			setConversaciones((prev) =>
				prev.map((c) =>
					c.id !== convId
						? c
						: { ...c, mensajes: (c.mensajes || []).map((m) => (m.id === mensajeId ? { ...m, ocultoManual: actualizado.ocultoManual } : m)) },
				),
			);
		} catch (err) {
			console.error("Error al ocultar/mostrar mensaje:", err);
			setErrorGlobal("No se pudo cambiar la visibilidad del mensaje.");
			setTimeout(() => setErrorGlobal(null), 3000);
		}
	}, []);

	const handleGuardarPredefinidos = useCallback(
		async (nuevos) => {
			setMensajesPredefinidos(nuevos);
			try {
				await updateMensajesPredefinidos(nuevos, { rol: userRol, userId });
			} catch (err) {
				console.error("Error guardando mensajes predefinidos:", err);
			}
		},
		[userRol, userId],
	);

	const handleVolver = useCallback(() => {
		setVistaMovil("lista");
	}, []);

	if (cargando) return <LoadingState mensaje="Cargando conversaciones…" />;

	return (
		<div className="crm-conv">
			<ErrorToast mensaje={errorGlobal} onClose={() => setErrorGlobal(null)} />

			{esAdmin && (
				<MensajesPredefinidosModal
					open={modalPredefinidosOpen}
					onClose={() => setModalPredefinidosOpen(false)}
					mensajes={mensajesPredefinidos}
					onGuardar={handleGuardarPredefinidos}
				/>
			)}

			<NuevoChatModal
				open={modalNuevoChatOpen}
				onClose={() => setModalNuevoChatOpen(false)}
				onCreado={handleChatCreado}
				userRol={userRol}
				userId={userId}
			/>

			<div className={`crm-conv__panel crm-conv__panel--lista ${vistaMovil === "chat" ? "crm-conv__panel--oculto-movil" : ""}`}>
				<ConversacionLista
					conversaciones={conversaciones}
					seleccionadaId={seleccionadaId}
					onSeleccionar={handleSeleccionar}
					esVendedor={esVendedor}
					esSupervisor={esSupervisor}
					esAdmin={esAdmin}
					puedeIniciarChat={puedeIniciarChat}
					userId={userId}
					onAbrirPredefinidos={() => setModalPredefinidosOpen(true)}
					onNuevoChat={() => setModalNuevoChatOpen(true)}
					cargando={cargando}
					hasMore={hasMore}
					cargandoMas={cargandoMas}
					onCargarMas={handleCargarMas}
				/>
			</div>

			<div className={`crm-conv__panel crm-conv__panel--chat ${vistaMovil === "lista" ? "crm-conv__panel--oculto-movil" : ""}`}>
				<ConversacionChat
					conversacion={conversacionActiva}
					onTomarControl={handleTomarControl}
					onDevolverBot={handleDevolverBot}
					onSoltar={handleSoltar}
					onReabrir={handleReabrir}
					onVolver={handleVolver}
					onMensajeEnviado={handleMensajeEnviado}
					esVendedor={esVendedor}
					esSupervisor={esSupervisor}
					mensajesPredefinidos={mensajesPredefinidos}
					esAdmin={esAdmin}
					onEliminar={handleEliminarConversacion}
					onCerrar={handleCerrarConversacion}
					onToggleOcultoMensaje={handleToggleOcultoMensaje}
					onResumenActualizado={(convId, resumen) => {
						setConversaciones((prev) => prev.map((c) => (c.id === convId ? { ...c, resumenIA: resumen } : c)));
					}}
					onConsultaGenerada={(convId, consulta) => {
						setConversaciones((prev) => prev.map((c) => (c.id === convId ? { ...c, consultaId: consulta.id, consulta } : c)));
					}}
					onNotaActualizada={(convId, notas) => {
						setConversaciones((prev) => prev.map((c) => (c.id === convId ? { ...c, notas } : c)));
					}}
					onMarcarNoLeido={handleMarcarNoLeido}
				/>
			</div>
		</div>
	);
}
