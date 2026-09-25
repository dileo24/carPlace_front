// views/CRM/Calendario/Calendario.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "./Calendario.css";
import CalendarioHeader from "../../../components/CRM/Calendario/CalendarioHeader/CalendarioHeader";
import CalendarioGrid from "../../../components/CRM/Calendario/CalendarioGrid/CalendarioGrid";
import CitaDrawer from "../../../components/CRM/Calendario/CitaDrawer/CitaDrawer";
import NuevaCitaDrawer from "../../../components/CRM/Calendario/NuevaCitaDrawer/NuevaCitaDrawer";
import { LoadingState, ErrorState } from "../../../components/CRM/PageState/PageState";
import { getUsers } from "../../../services/usuarios.service";
import { useRoles } from "../../../hooks/useRoles";
import { getEventos, getEventoById, createEvento, updateEvento, deleteEvento } from "../../../services/calendario.service";

export default function Calendario() {
	const today = new Date();
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());
	const [usuarioFiltro, setUsuarioFiltro] = useState("todos");
	const [eventos, setEventos] = useState([]);
	const [usuarios, setUsuarios] = useState([]);
	const [loading, setLoading] = useState(true);
	const [eventoAEditar, setEventoAEditar] = useState(null);
	const [fechaPreseleccionada, setFechaPreseleccionada] = useState(null);
	const [error, setError] = useState(null);
	const { userRol, user, esAdmin, esSupervisor } = useRoles();

	const auth = {
		rol: userRol,
		userId: user?.id,
		nombre: user?.name?.split(" ")[0] || "",
		apellido: user?.name?.split(" ").slice(1).join(" ") || "",
	};

	const [citaSeleccionada, setCitaSeleccionada] = useState(null);
	const [drawerCitaOpen, setDrawerCitaOpen] = useState(false);
	const [drawerNuevaOpen, setDrawerNuevaOpen] = useState(false);

	useEffect(() => {
		if (!esAdmin) return;
		getUsers()
			.then((data) => setUsuarios(data.users ?? []))
			.catch(() => setUsuarios([]));
	}, [esAdmin]);

	const socketRef = useRef(null);
	useEffect(() => {
		socketRef.current = io(import.meta.env.VITE_API_URL, {
			transports: ["polling", "websocket"],
		});
		return () => socketRef.current?.disconnect();
	}, []);

	// El calendario re-fetchea tanto por cambios de mes/filtro como por el socket
	// "calendario:actualizado" (que el bot dispara seguido al agendar/confirmar/
	// cancelar visitas). Sin esta guarda, dos fetches superpuestos pueden resolver
	// fuera de orden y el más viejo pisa el estado del más nuevo — a veces con
	// una lista vacía o desactualizada. fetchIdRef asegura que solo el último
	// pedido en salir sea el que efectivamente actualiza el estado.
	const fetchIdRef = useRef(0);
	const fetchEventos = useCallback(async () => {
		const fetchId = ++fetchIdRef.current;
		setLoading(true);
		try {
			const paddedMonth = String(month + 1).padStart(2, "0");
			const params = { mes: `${year}-${paddedMonth}` };
			if (esAdmin) {
				if (usuarioFiltro !== "todos") params.usuarioId = usuarioFiltro;
			}
			// supervisor y vendedor: el backend filtra por header, no por param
			const data = await getEventos(params, auth);
			if (fetchIdRef.current !== fetchId) return;
			setEventos(data.resp ?? []);
		} catch (err) {
			if (fetchIdRef.current !== fetchId) return;
			setError("No se pudieron cargar los eventos del calendario.");
		} finally {
			if (fetchIdRef.current === fetchId) setLoading(false);
		}
	}, [year, month, usuarioFiltro, esAdmin, esSupervisor, user]);

	useEffect(() => {
		fetchEventos();
	}, [fetchEventos]);

	// ── Abrir una cita puntual por link (ej. desde el perfil de una conversación o una consulta) ──
	const location = useLocation();
	const idAutoabiertoRef = useRef(null);
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const id = params.get("id");
		if (!id || idAutoabiertoRef.current === id) return;
		const idNum = Number(id);
		const existente = eventos.find((e) => e.id === idNum);
		if (existente) {
			idAutoabiertoRef.current = id;
			handleCitaClick(existente);
			return;
		}
		if (loading) return;
		idAutoabiertoRef.current = id;
		getEventoById(idNum)
			.then((data) => {
				if (data?.resp) handleCitaClick(data.resp);
			})
			.catch(() => {});
	}, [location.search, eventos, loading]);

	useEffect(() => {
		const socket = socketRef.current;
		if (!socket) return;
		socket.on("calendario:actualizado", fetchEventos);
		return () => socket.off("calendario:actualizado", fetchEventos);
	}, [fetchEventos]);

	const totalCitas = eventos.length;
	const citasConfirmadas = eventos.filter((e) => e.estado === "confirmada").length;
	const citasPendientes = eventos.filter((e) => e.estado === "pendiente").length;

	function handlePrev() {
		if (month === 0) {
			setYear((y) => y - 1);
			setMonth(11);
		} else setMonth((m) => m - 1);
	}

	function handleNext() {
		if (month === 11) {
			setYear((y) => y + 1);
			setMonth(0);
		} else setMonth((m) => m + 1);
	}

	function handleCitaClick(cita) {
		setCitaSeleccionada(cita);
		setDrawerCitaOpen(true);
	}

	function handleDiaClick(dateStr) {
		setEventoAEditar(null);
		setFechaPreseleccionada(dateStr);
		setDrawerNuevaOpen(true);
	}

	function handleEditarCita(cita) {
		setEventoAEditar(cita);
		setFechaPreseleccionada(null);
		setDrawerNuevaOpen(true);
		setDrawerCitaOpen(false);
	}

	function handleNuevaCita() {
		setEventoAEditar(null);
		setFechaPreseleccionada(null);
		setDrawerNuevaOpen(true);
	}

	function handleCloseNueva() {
		setDrawerNuevaOpen(false);
		setEventoAEditar(null);
		setFechaPreseleccionada(null);
	}

	async function handleEliminarCita(id) {
		try {
			await deleteEvento(id, auth);
			setEventos((prev) => prev.filter((e) => e.id !== id));
			setDrawerCitaOpen(false);
			setCitaSeleccionada(null);
		} catch (err) {
			console.error("Error al eliminar evento:", err);
		}
	}

	async function handleMarcarRealizada(id, notasFinalizacion) {
		try {
			const resp = await updateEvento(id, { estado: "realizada", notasFinalizacion }, auth);
			setEventos((prev) => prev.map((e) => (e.id === id ? resp.resp : e)));
			setCitaSeleccionada((prev) => (prev ? { ...prev, estado: "realizada", notasFinalizacion } : prev));
		} catch (err) {
			console.error("Error al marcar como realizada:", err);
		}
	}

	async function handleCancelar(id) {
		try {
			const resp = await updateEvento(id, { estado: "cancelada" }, auth);
			setEventos((prev) => prev.map((e) => (e.id === id ? resp.resp : e)));
			setCitaSeleccionada((prev) => (prev ? { ...prev, estado: "cancelada" } : prev));
		} catch (err) {
			console.error("Error al cancelar evento:", err);
		}
	}

	function handleConversacionIniciada(eventoId, conversacionId) {
		setEventos((prev) => prev.map((e) => (e.id === eventoId ? { ...e, conversacionId } : e)));
		setCitaSeleccionada((prev) => (prev && prev.id === eventoId ? { ...prev, conversacionId } : prev));
	}

	async function handleGuardarCita(datosForm) {
		try {
			if (eventoAEditar) {
				const resp = await updateEvento(eventoAEditar.id, datosForm, auth);
				const actualizado = resp.resp;
				setEventos((prev) => prev.map((e) => (e.id === actualizado.id ? actualizado : e)));
				setCitaSeleccionada(actualizado);
			} else {
				const resp = await createEvento(datosForm, auth);
				const nuevoEvento = resp.resp;
				setEventos((prev) => [...prev, nuevoEvento]);
				const [ny, nm] = nuevoEvento.fecha.split("-").map(Number);
				setYear(ny);
				setMonth(nm - 1);
			}
			setEventoAEditar(null);
			setFechaPreseleccionada(null);
		} catch (err) {
			console.error("Error al guardar evento:", err);
		}
	}

	if (loading) return <LoadingState mensaje="Cargando calendario…" />;
	if (error) return <ErrorState mensaje={error} onRetry={() => setError(null)} />;

	return (
		<div className="calendario-view">
			<CalendarioHeader
				year={year}
				month={month}
				onPrev={handlePrev}
				onNext={handleNext}
				usuarioFiltro={usuarioFiltro}
				onUsuarioFiltro={setUsuarioFiltro}
				usuarios={esAdmin ? usuarios : []}
				onNuevaCita={handleNuevaCita}
				totalCitas={totalCitas}
				citasConfirmadas={citasConfirmadas}
				citasPendientes={citasPendientes}
			/>

			<CalendarioGrid year={year} month={month} citas={eventos} onCitaClick={handleCitaClick} onDiaClick={handleDiaClick} />

			<CitaDrawer
				cita={citaSeleccionada}
				open={drawerCitaOpen}
				onClose={() => setDrawerCitaOpen(false)}
				onMarcarRealizada={handleMarcarRealizada}
				onCancelar={handleCancelar}
				onEditar={handleEditarCita}
				onEliminar={handleEliminarCita}
				onConversacionIniciada={handleConversacionIniciada}
				currentUser={user}
				esAdmin={esAdmin}
			/>

			<NuevaCitaDrawer
				open={drawerNuevaOpen}
				onClose={handleCloseNueva}
				onGuardar={handleGuardarCita}
				userRol={userRol}
				currentUser={user}
				eventoAEditar={eventoAEditar}
				fechaPreseleccionada={fechaPreseleccionada}
			/>
		</div>
	);
}
