// views/CRM/Stock/Stock.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import "./Stock.css";
import StockDashboard from "../../../components/CRM/Stock/StockDashboard/StockDashboard";
import StockFilters from "../../../components/CRM/Stock/StockFilters/StockFilters";
import StockCard from "../../../components/CRM/Stock/StockCard/StockCard";
import StockDrawer from "../../../components/CRM/Stock/StockDrawer/StockDrawer";
import StockAlistaje from "../../../components/CRM/Stock/StockAlistaje/StockAlistaje";
import StockMarcas from "../../../components/CRM/Stock/StockMarcas/StockMarcas";
import { normalizarPatente } from "../../../utils/patente";
import { getAutos } from "../../../services/autos.service";
import { getAutosPublicadosIds } from "../../../services/publicaciones.service";
import { useRoles } from "../../../hooks/useRoles";
import { LoadingState, ErrorState } from "../../../components/CRM/PageState/PageState";

export default function Stock() {
	const [autos, setAutos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { esAdmin, esSupervisor, esVendedor, esPublicadorVendedor: esPublicVend } = useRoles();

	// Solo admin y supervisor ven "no_disponible"
	const puedeVerNoDisp = esAdmin || esSupervisor;

	const [busqueda, setBusqueda] = useState("");
	const [filtroEstado, setFiltroEstado] = useState("todos");
	const [vistaAlistaje, setVistaAlistaje] = useState(false);
	const [filtroCondicion, setFiltroCondicion] = useState("");
	const [filtroTipo, setFiltroTipo] = useState("");

	const [autoSeleccionado, setAutoSeleccionado] = useState(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const [autosEnML, setAutosEnML] = useState(new Set());

	// Vista Autos / Marcas (Marcas solo para admin), sincronizada con ?vista=marcas
	const vistaMarcas = esAdmin && searchParams.get("vista") === "marcas";
	function cambiarVista(vista) {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (vista === "marcas") next.set("vista", "marcas");
				else next.delete("vista");
				return next;
			},
			{ replace: true },
		);
	}

	const vistaToggle = esAdmin ? (
		<div className="stock-view__vista-toggle" role="tablist" aria-label="Vista de stock">
			<button
				type="button"
				role="tab"
				aria-selected={!vistaMarcas}
				className={`stock-view__vista-btn${!vistaMarcas ? " stock-view__vista-btn--active" : ""}`}
				onClick={() => cambiarVista("autos")}
			>
				Autos
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={vistaMarcas}
				className={`stock-view__vista-btn${vistaMarcas ? " stock-view__vista-btn--active" : ""}`}
				onClick={() => cambiarVista("marcas")}
			>
				Marcas
			</button>
		</div>
	) : null;

	useEffect(() => {
		getAutosPublicadosIds()
			.then((data) => setAutosEnML(new Set(data?.resp || [])))
			.catch(() => setAutosEnML(new Set()));
	}, []);

	useEffect(() => {
		async function fetchAutos() {
			try {
				setLoading(true);
				const data = await getAutos({
					orderBy: "marca",
					orderDir: "ASC",
					sinFiltroVisible: true,
					...(filtroCondicion && { condicion: filtroCondicion }),
					...(filtroTipo && { tipo: filtroTipo }),
				});
				if (data?.resp) {
					const lista = (puedeVerNoDisp ? data.resp : data.resp.filter((a) => a.estado !== "no_disponible")).sort((a, b) => {
						const marcaA = a.marca?.toLowerCase() ?? "";
						const marcaB = b.marca?.toLowerCase() ?? "";
						if (marcaA !== marcaB) return marcaA.localeCompare(marcaB);
						const modeloA = a.modelo?.toLowerCase() ?? "";
						const modeloB = b.modelo?.toLowerCase() ?? "";
						return modeloA.localeCompare(modeloB);
					});
					setAutos(lista);
				}
			} catch (err) {
				console.error("Error al cargar autos:", err);
				setError("No se pudo cargar el stock. Verificá tu conexión.");
			} finally {
				setLoading(false);
			}
		}
		fetchAutos();
	}, [filtroCondicion, filtroTipo, puedeVerNoDisp]);

	const autosFiltrados = useMemo(() => {
		let lista = autos;

		if (filtroEstado !== "todos") {
			lista = lista.filter((a) => a.estado === filtroEstado);
		}

		if (busqueda.trim()) {
			const q = busqueda.toLowerCase().trim();
			const qPatente = normalizarPatente(busqueda);
			lista = lista.filter(
				(a) =>
					a.marca?.toLowerCase().includes(q) ||
					a.modelo?.toLowerCase().includes(q) ||
					a.anio?.toString().includes(q) ||
					(qPatente && normalizarPatente(a.patente).includes(qPatente)),
			);
		}

		return lista;
	}, [autos, filtroEstado, busqueda]);

	function handleUpdateAuto(id, cambios) {
		setAutos((prev) => prev.map((a) => (a.id === id ? { ...a, ...cambios } : a)));
		if (autoSeleccionado?.id === id) {
			setAutoSeleccionado((prev) => ({ ...prev, ...cambios }));
		}
	}

	function handleToggleTarea(autoId, tareaId) {
		const auto = autos.find((a) => a.id === autoId);
		const tareas = (auto?.tareasAlistaje || []).map((t) => (t.id === tareaId ? { ...t, hecha: !t.hecha } : t));
		handleUpdateAuto(autoId, { tareasAlistaje: tareas });
	}

	function handleOpenDrawer(auto) {
		const conMeta = autos.find((a) => a.id === auto.id) || auto;
		setAutoSeleccionado(conMeta);
		setDrawerOpen(true);
	}

	// Permite llegar desde otro módulo (ej. Publicaciones) con
	// /crm/stock?autoId=123 y que abra directo el drawer de ese auto.
	useEffect(() => {
		const autoId = searchParams.get("autoId");
		if (!autoId || autos.length === 0) return;
		const auto = autos.find((a) => String(a.id) === autoId);
		if (auto) {
			handleOpenDrawer(auto);
		}
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.delete("autoId");
			return next;
		}, { replace: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autos]);

	if (vistaMarcas) {
		return (
			<div className="stock-view">
				{vistaToggle}
				<StockMarcas />
			</div>
		);
	}

	if (loading) return <LoadingState mensaje="Cargando stock…" />;

	if (error) return <ErrorState mensaje={error} />;

	return (
		<div className="stock-view">
			{vistaToggle}
			<StockDashboard autos={autos} esVendedor={esVendedor || esPublicVend} />

			<StockFilters
				filtroEstado={filtroEstado}
				onFiltroEstado={setFiltroEstado}
				vistaAlistaje={vistaAlistaje}
				onToggleAlistaje={() => setVistaAlistaje((p) => !p)}
				busqueda={busqueda}
				onBusqueda={setBusqueda}
				totalFiltrados={autosFiltrados.length}
				esVendedor={esVendedor}
				esAdmin={esAdmin}
				esPublicVend={esPublicVend}
				filtroCondicion={filtroCondicion}
				onFiltroCondicion={setFiltroCondicion}
				filtroTipo={filtroTipo}
				onFiltroTipo={setFiltroTipo}
				puedeVerNoDisp={puedeVerNoDisp} // ← nuevo
			/>

			{vistaAlistaje ? (
				<StockAlistaje autos={autos} onOpen={handleOpenDrawer} onToggleTarea={handleToggleTarea} />
			) : (
				<div className="stock-view__grid-wrap">
					{autosFiltrados.length === 0 ? (
						<div className="stock-view__empty">
							<p>Sin resultados para esta búsqueda</p>
						</div>
					) : (
						<div className="stock-view__grid">
							{autosFiltrados.map((auto, idx) => (
								<StockCard
									key={auto.id}
									auto={auto}
									onOpen={handleOpenDrawer}
									animDelay={idx * 35}
									esAdmin={esAdmin}
									enML={autosEnML.has(auto.id)}
								/>
							))}
						</div>
					)}
				</div>
			)}

			<StockDrawer
				auto={autoSeleccionado}
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onUpdate={handleUpdateAuto}
				esAdmin={esAdmin}
				esSupervisor={esSupervisor}
			/>
		</div>
	);
}
