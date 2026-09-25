import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./Ventas.css";
import VentasHeader from "../../../components/CRM/Ventas/VentasHeader/VentasHeader";
import VentasTable from "../../../components/CRM/Ventas/VentasTable/VentasTable";
import VentaDrawer from "../../../components/CRM/Ventas/VentaDrawer/VentaDrawer";
import VentasMonthNav from "../../../components/CRM/Ventas/VentasMonthNav/VentasMonthNav";
import { getVentas, createVenta, updateVenta, deleteVenta } from "../../../services/ventas.service";
import { LoadingState, ErrorState } from "../../../components/CRM/PageState/PageState";
import { getAutos } from "../../../services/autos.service";
import { useLocation } from "react-router-dom";
import { useRoles } from "../../../hooks/useRoles";

function getMesActualDefault() {
	const today = new Date();
	return { year: today.getFullYear(), month: today.getMonth() };
}

export default function Ventas() {
	const { userRol, user, esSupervisor, esSocio } = useRoles();
	// El socio nunca crea/edita/elimina ventas (lo sigue haciendo el admin) —
	// se trata como solo-lectura igual que el supervisor.
	const soloLectura = esSupervisor || esSocio;
	const userId = user?.id;
	const [ventas, setVentas] = useState([]);
	const [autos, setAutos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [busqueda, setBusqueda] = useState("");
	const [ordenAsc, setOrdenAsc] = useState(false);
	const [modo, setModo] = useState(null);
	const [ventaEditar, setVentaEditar] = useState(null);
	const [autoPreseleccionado, setAutoPreseleccionado] = useState(null);
	const [mesActual, setMesActual] = useState(getMesActualDefault);
	const location = useLocation();
	const [error, setError] = useState(null);

	useEffect(() => {
		async function cargar() {
			try {
				const [ventasData, autosData] = await Promise.all([getVentas(), getAutos()]);
				setVentas(ventasData.resp ?? []);
				setAutos(autosData.resp ?? []);
			} catch (err) {
				console.error("Error al cargar datos:", err);
				setError("No se pudieron cargar las ventas.");
			} finally {
				setLoading(false);
			}
		}
		cargar();
	}, []);

	useEffect(() => {
		if (location.state?.autoPreseleccionado) {
			setModo("nueva");
			setAutoPreseleccionado(location.state.autoPreseleccionado);
			window.history.replaceState({}, "");
		}
	}, []);

	// Ventas del mes seleccionado, con búsqueda y orden aplicados
	const ventasFiltradas = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return ventas
			.filter((v) => {
				// Filtro por mes
				const [y, m] = v.fechaVenta?.split("-").map(Number) ?? [];
				if (y !== mesActual.year || m !== mesActual.month + 1) return false;
				// Filtro por búsqueda
				if (!q) return true;
				return (
					v.nombre?.toLowerCase().includes(q) ||
					v.apellido?.toLowerCase().includes(q) ||
					v.vehiculoVendido?.toLowerCase().includes(q) ||
					v.telefono?.includes(q)
				);
			})
			.sort((a, b) => {
				const diff = new Date(a.fechaVenta) - new Date(b.fechaVenta);
				return ordenAsc ? diff : -diff;
			});
	}, [ventas, busqueda, ordenAsc, mesActual]);

	// Métricas del mes visible (sin filtro de búsqueda)
	const ventasDelMes = useMemo(() => {
		return ventas.filter((v) => {
			const [y, m] = v.fechaVenta?.split("-").map(Number) ?? [];
			return y === mesActual.year && m === mesActual.month + 1;
		});
	}, [ventas, mesActual]);

	function handleNuevaVenta() {
		setVentaEditar(null);
		setModo("nueva");
	}

	const handleEditarVenta = useCallback(
		(venta) => {
			if (soloLectura) return; // defensa extra: aunque el botón esté oculto, no se abre el drawer
			setVentaEditar(venta);
			setModo("editar");
		},
		[soloLectura],
	);

	const handleEliminarVenta = useCallback(
		async (id) => {
			if (soloLectura) return;
			try {
				await deleteVenta(id, { rol: userRol, userId });
				setVentas((prev) => prev.filter((v) => v.id !== id));
			} catch (err) {
				console.error("Error al eliminar venta:", err);
				setError(err?.response?.data?.resp || "No se pudo eliminar la venta.");
			}
		},
		[soloLectura, userRol, userId],
	);

	async function handleGuardar(datosForm) {
		try {
			if (modo === "nueva") {
				const resp = await createVenta(datosForm);
				setVentas((prev) => [resp.resp, ...prev]);
				if (resp.advertencia) {
					window.alert(`⚠️ ${resp.advertencia}`);
				}
				if (datosForm.fechaVenta) {
					const [y, m] = datosForm.fechaVenta.split("-").map(Number);
					setMesActual({ year: y, month: m - 1 });
				}
			} else if (modo === "editar") {
				const resp = await updateVenta(ventaEditar.id, datosForm, { rol: userRol, userId });
				setVentas((prev) => prev.map((v) => (v.id === ventaEditar.id ? resp.resp : v)));
			}
			setModo(null);
			setVentaEditar(null);
		} catch (err) {
			console.error("Error al guardar venta:", err);
		}
	}

	function handleCloseDrawer() {
		setModo(null);
		setVentaEditar(null);
		setAutoPreseleccionado(null);
	}

	if (loading) return <LoadingState mensaje="Cargando ventas…" />;
	if (error) return <ErrorState mensaje={error} onRetry={() => window.location.reload()} />;

	return (
		<div className="ventas-view">
			<VentasHeader
				ventas={ventasDelMes}
				busqueda={busqueda}
				onBusqueda={setBusqueda}
				ordenAsc={ordenAsc}
				onToggleOrden={() => setOrdenAsc((prev) => !prev)}
				onNuevaVenta={handleNuevaVenta}
				puedeCrear={!esSocio}
			/>

			<VentasMonthNav ventas={ventas} mesActual={mesActual} onMesChange={setMesActual} />

			<VentasTable ventas={ventasFiltradas} onEditar={handleEditarVenta} onEliminar={handleEliminarVenta} esSupervisor={soloLectura} />

			<VentaDrawer
				modo={modo}
				venta={ventaEditar}
				onClose={handleCloseDrawer}
				onGuardar={handleGuardar}
				autos={autos}
				autoPreseleccionado={autoPreseleccionado}
			/>
		</div>
	);
}
