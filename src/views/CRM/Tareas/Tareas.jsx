// views/CRM/Tareas/Tareas.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./Tareas.css";
import TareasHeader from "../../../components/CRM/Tareas/TareasHeader/TareasHeader";
import TareasBoard from "../../../components/CRM/Tareas/TareasBoard/TareasBoard";
import TareaDrawer from "../../../components/CRM/Tareas/TareaDrawer/TareaDrawer";
import NuevaTareaDrawer from "../../../components/CRM/Tareas/NuevaTareaDrawer/NuevaTareaDrawer";
import { filterTareas, sortByPrioridad, getMetrics } from "../../../constants/crmTareas";
import { getTareas, createTarea, updateTarea } from "../../../services/tareas.service";
import { LoadingState, ErrorState } from "../../../components/CRM/PageState/PageState";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Tareas() {
	const location = useLocation();
	const { userRol, user } = useAuth();
	const auth = { rol: userRol, userId: user?.id };

	const [tareas, setTareas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filtroPrioridad, setFiltroPrioridad] = useState("todas");
	const [filtroTipo, setFiltroTipo] = useState("todos");
	const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
	const [drawerDetalle, setDrawerDetalle] = useState(false);
	const [drawerNueva, setDrawerNueva] = useState(false);

	const fetchTareas = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getTareas({}, auth);
			const normalizadas = data.resp.map((t) => ({
				...t,
				notas: typeof t.notas === "string" ? JSON.parse(t.notas) : (t.notas ?? []),
			}));
			setTareas(normalizadas);
		} catch (err) {
			console.error("Error cargando tareas:", err);
			setError("No se pudieron cargar las tareas.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTareas();
	}, [fetchTareas]);

	useEffect(() => {
		if (!location.state?.tareaId || tareas.length === 0) return;
		const tarea = tareas.find((t) => t.id === location.state.tareaId);
		if (tarea) handleOpenDetalle(tarea);
	}, [tareas, location.state?.tareaId]);

	const tareasFiltradas = useMemo(() => {
		const filtradas = filterTareas(tareas, { prioridad: filtroPrioridad, tipo: filtroTipo });
		return sortByPrioridad(filtradas);
	}, [tareas, filtroPrioridad, filtroTipo]);

	const metrics = useMemo(() => getMetrics(tareasFiltradas), [tareasFiltradas]);

	function handleOpenDetalle(tarea) {
		setTareaSeleccionada(tarea);
		setDrawerDetalle(true);
	}

	function handleCloseDetalle() {
		setDrawerDetalle(false);
		setTimeout(() => setTareaSeleccionada(null), 300);
	}

	function handleDeleteTarea(id) {
		setTareas((prev) => prev.filter((t) => t.id !== id));
	}

	async function handleUpdateTarea(tareaActualizada) {
		try {
			const { id, ...campos } = tareaActualizada;
			const payload = {
				titulo: campos.titulo,
				tipo: campos.tipo,
				prioridad: campos.prioridad,
				estado: campos.estado,
				descripcion: campos.descripcion ?? null,
				notas: campos.notas ?? [],
			};
			const data = await updateTarea(id, payload, auth);
			const actualizada = {
				...data.resp,
				notas: typeof data.resp.notas === "string" ? JSON.parse(data.resp.notas) : (data.resp.notas ?? []),
			};
			setTareas((prev) => prev.map((t) => (t.id === actualizada.id ? actualizada : t)));
			if (tareaSeleccionada?.id === actualizada.id) setTareaSeleccionada(actualizada);
		} catch (err) {
			console.error("Error actualizando tarea:", err);
		}
	}

	async function handleGuardarNueva(formData) {
		try {
			const payload = {
				titulo: formData.titulo,
				tipo: formData.tipo,
				prioridad: formData.prioridad,
				descripcion: formData.descripcion || null,
				creadoPor: "usuario",
			};
			const data = await createTarea(payload, auth);
			setTareas((prev) => [data.resp, ...prev]);
		} catch (err) {
			console.error("Error creando tarea:", err);
		}
	}

	if (loading) return <LoadingState mensaje="Cargando tareas…" />;
	if (error) return <ErrorState mensaje={error} onRetry={() => window.location.reload()} />;

	return (
		<div className="tareas-view">
			<TareasHeader
				filtroPrioridad={filtroPrioridad}
				onFiltroPrioridad={setFiltroPrioridad}
				filtroTipo={filtroTipo}
				onFiltroTipo={setFiltroTipo}
				onNuevaTarea={() => setDrawerNueva(true)}
				metrics={metrics}
			/>
			<TareasBoard vista="tablero" tareas={tareasFiltradas} onOpen={handleOpenDetalle} onUpdate={handleUpdateTarea} />
			<TareaDrawer
				open={drawerDetalle}
				tarea={tareaSeleccionada}
				onClose={handleCloseDetalle}
				onUpdate={handleUpdateTarea}
				onDelete={handleDeleteTarea}
				auth={auth}
			/>
			<NuevaTareaDrawer open={drawerNueva} onClose={() => setDrawerNueva(false)} onGuardar={handleGuardarNueva} />
		</div>
	);
}
