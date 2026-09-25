// views/CRM/Consultas/Consultas.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ConsultaDrawer from "../../../components/CRM/Consultas/ConsultaDrawer/ConsultaDrawer";
import NuevaConsultaDrawer from "../../../components/CRM/Consultas/NuevaConsultaDrawer/NuevaConsultaDrawer";
import ConsultaKanban from "../../../components/CRM/Consultas/ConsultaKanban/ConsultaKanban";
import { ESTADOS, ESTADO_LABEL } from "../../../constants/crm";
import { useRoles } from "../../../hooks/useRoles";
import { getConsultas, getConsultaById, createConsulta, updateConsulta } from "../../../services/consultas.service";
import "./Consultas.css";
import { LoadingState, ErrorState } from "../../../components/CRM/PageState/PageState";

const PAGE_SIZE = 50;

export default function Consultas() {
	const { userRol, user, esVendedor, esSupervisor, esAdmin } = useRoles();

	const [consultas, setConsultas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [estadoFiltro, setEstadoFiltro] = useState("todos");
	const [selected, setSelected] = useState(null);
	const [showNueva, setShowNueva] = useState(false);
	const [page, setPage] = useState(1);
	const [totalConsultas, setTotalConsultas] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [cargandoMas, setCargandoMas] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchInput);
		}, 600);
		return () => clearTimeout(timer);
	}, [searchInput]);

	// ── Carga ─────────────────────────────────────────────────────────────────
	const fetchConsultas = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getConsultas({
				estado: estadoFiltro !== "todos" ? estadoFiltro : undefined,
				busqueda: search || undefined,
				rol: userRol,
				userId: user.id,
				page: 1,
				limit: PAGE_SIZE,
			});
			setConsultas(data.resp);
			setPage(1);
			setTotalConsultas(data.meta?.total ?? data.resp.length);
			setHasMore(data.meta?.hasMore ?? false);
		} catch (err) {
			console.error(err);
			setError("No se pudieron cargar las consultas.");
		} finally {
			setLoading(false);
		}
	}, [estadoFiltro, search]);

	useEffect(() => {
		fetchConsultas();
	}, [fetchConsultas]);

	// ── Abrir una consulta puntual por link (ej. desde el perfil de una conversación o una cita) ──
	const location = useLocation();
	const idAutoabiertoRef = useRef(null);
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const id = params.get("id");
		if (!id || idAutoabiertoRef.current === id) return;
		const idNum = Number(id);
		const existente = consultas.find((c) => c.id === idNum);
		if (existente) {
			idAutoabiertoRef.current = id;
			setSelected(existente);
			return;
		}
		if (loading) return;
		idAutoabiertoRef.current = id;
		getConsultaById(idNum)
			.then((data) => {
				if (data?.resp) setSelected(data.resp);
			})
			.catch(() => {});
	}, [location.search, consultas, loading]);

	const handleCargarMas = useCallback(async () => {
		if (cargandoMas || !hasMore) return;
		const siguiente = page + 1;
		try {
			setCargandoMas(true);
			const data = await getConsultas({
				estado: estadoFiltro !== "todos" ? estadoFiltro : undefined,
				busqueda: search || undefined,
				rol: userRol,
				userId: user.id,
				page: siguiente,
				limit: PAGE_SIZE,
			});
			setConsultas((prev) => {
				const idsExistentes = new Set(prev.map((c) => c.id));
				return [...prev, ...data.resp.filter((c) => !idsExistentes.has(c.id))];
			});
			setPage(siguiente);
			setTotalConsultas(data.meta?.total ?? totalConsultas);
			setHasMore(data.meta?.hasMore ?? false);
		} catch (err) {
			console.error("Error cargando más consultas:", err);
		} finally {
			setCargandoMas(false);
		}
	}, [cargandoMas, hasMore, page, estadoFiltro, search]);

	const CLODER_EMAIL = "clodersona@gmail.com";
	const CLODER_NAME = "Cloder Sona";
	const esCloder = user?.email === CLODER_EMAIL || user?.name === CLODER_NAME;

	function puedeVerDatos(consulta) {
		if (esAdmin || esSupervisor) return true;
		if (esCloder) return true; // Cloder siempre ve los datos
		// Vendedor normal: solo ve datos si él mismo cargó la consulta
		return consulta.asesorId === user.id && consulta.cargadoPor === "usuario";
	}
	function puedeEditar(consulta) {
		if (esAdmin) return true;
		// Solo el creador puede editar completo: vendedor que cargó la consulta manualmente
		return consulta.asesorId === user.id && consulta.cargadoPor === "usuario";
	}

	// ── Filtrado client-side ──────────────────────────────────────────────────
	const filtered = useMemo(() => {
		return consultas.filter((c) => {
			const matchEstado = estadoFiltro === "todos" || c.estado === estadoFiltro;
			return matchEstado;
		});
	}, [consultas, estadoFiltro]);

	// ── CRUD ──────────────────────────────────────────────────────────────────
	async function handleCreated(formData) {
		const data = await createConsulta(formData);
		setConsultas((prev) => [data.resp, ...prev]);
	}

	async function handleUpdate(id, cambios) {
		try {
			const data = await updateConsulta(id, cambios, { rol: userRol, userId: user.id });
			const actualizada = data.resp;
			setConsultas((prev) => prev.map((c) => (c.id === id ? actualizada : c)));
			if (selected?.id === id) setSelected(actualizada);
		} catch (err) {
			console.error(err);
		}
	}

	function handleHistorialUpdate(consultaId, entrada, accion = "add") {
		setConsultas((prev) =>
			prev.map((c) => {
				if (c.id !== consultaId) return c;
				let historial = c.historial ?? [];

				if (accion === "add") historial = [...historial, entrada];
				if (accion === "update") historial = historial.map((h) => (h.id === entrada.id ? { ...h, texto: entrada.texto } : h));
				if (accion === "delete") historial = historial.filter((h) => h.id !== entrada.id);

				return { ...c, historial };
			}),
		);
	}

	function handleDelete(id) {
		setConsultas((prev) => prev.filter((c) => c.id !== id));

		if (selected?.id === id) {
			setSelected(null);
		}
	}

	// ── Render ────────────────────────────────────────────────────────────────
	if (loading) return <LoadingState mensaje="Cargando consultas…" />;

	if (error) return <ErrorState mensaje={error} onRetry={fetchConsultas} />;

	return (
		<div className="cq-root">
			{/* Header */}
			<motion.div className="cq-page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
				<div>
					<h1 className="cq-page-title">Consultas</h1>
					<p className="cq-page-sub">
						{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
						{filtered.length !== consultas.length && ` de ${consultas.length}`}
						{hasMore && (
							<>
								{" · "}
								<button className="cq-link-cargar-mas" onClick={handleCargarMas} disabled={cargandoMas}>
									{cargandoMas ? "Cargando…" : `Cargar más (${consultas.length} de ${totalConsultas})`}
								</button>
							</>
						)}
					</p>
				</div>
				<button className="cq-btn-new" onClick={() => setShowNueva(true)}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					Nueva consulta
				</button>
			</motion.div>

			{/* Filtros */}
			<motion.div className="cq-filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
				<div className="cq-search-wrap">
					<svg className="cq-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						className="cq-search"
						placeholder="Buscar por vehículo…"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					{searchInput && (
						<button
							className="cq-search-clear"
							onClick={() => {
								setSearchInput("");
								setSearch("");
							}}
						>
							✕
						</button>
					)}
				</div>

				<div className="cq-filter-group">
					<select className="cq-select" value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
						{ESTADOS.map((e) => (
							<option key={e} value={e}>
								{ESTADO_LABEL[e]}
							</option>
						))}
					</select>
				</div>
			</motion.div>

			{/* Tablero */}
			<ConsultaKanban consultas={filtered} onOpen={setSelected} onUpdate={handleUpdate} puedeVerDatos={puedeVerDatos} />

			{/* Drawers */}
			<ConsultaDrawer
				consulta={selected}
				onClose={() => setSelected(null)}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				esAdmin={esAdmin}
				esSupervisor={esSupervisor}
				esVendedor={esVendedor}
				puedeVerDatos={selected ? puedeVerDatos(selected) : false}
				puedeEditar={selected ? puedeEditar(selected) : false}
				onHistorialUpdate={handleHistorialUpdate}
				userId={user?.id}
				userRol={userRol}
			/>
			<NuevaConsultaDrawer
				open={showNueva}
				onClose={() => setShowNueva(false)}
				onCreated={handleCreated}
				esAdmin={esAdmin}
				esSupervisor={esSupervisor}
				currentUser={user}
			/>
		</div>
	);
}
