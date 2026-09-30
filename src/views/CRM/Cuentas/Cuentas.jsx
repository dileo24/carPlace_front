import React, { useState, useEffect, useMemo } from "react";
import CuentasHeader from "../../../components/CRM/Cuentas/CuentasHeader/CuentasHeader";
import CuentasFilters from "../../../components/CRM/Cuentas/CuentasFilters/CuentasFilters";
import CuentasTable from "../../../components/CRM/Cuentas/CuentasTable/CuentasTable";
import NuevaDeudaDrawer from "../../../components/CRM/Cuentas/NuevaDeudaDrawer/NuevaDeudaDrawer";
import SaldarDeudaDrawer from "../../../components/CRM/Cuentas/SaldarDeudaDrawer/SaldarDeudaDrawer";
import { getCuentas } from "../../../services/cuentas.service";
import { useAuth } from "../../../context/AuthContext";
import "./Cuentas.css";

const Cuentas = () => {
	const { user } = useAuth();
	const [deudas, setDeudas] = useState([]);
	const [admins, setAdmins] = useState([]);
	const [saldos, setSaldos] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [nuevoDrawerOpen, setNuevoDrawerOpen] = useState(false);
	const [deudaASaldar, setDeudaASaldar] = useState(null);

	const [filtroAmbito, setFiltroAmbito] = useState("todos");
	const [filtroTipo, setFiltroTipo] = useState("todos");
	const [filtroEstado, setFiltroEstado] = useState("pendientes");

	const fetchCuentas = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await getCuentas();
			setDeudas(Array.isArray(data?.resp?.deudas) ? data.resp.deudas : []);
			setAdmins(Array.isArray(data?.resp?.admins) ? data.resp.admins : []);
			setSaldos(data?.resp?.saldos || {});
		} catch {
			setError("No se pudieron cargar las cuentas. Verificá la conexión.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCuentas();
	}, []);

	const deudasFiltradas = useMemo(
		() =>
			deudas.filter((d) => {
				// Los préstamos cuentan como movimientos de empresa.
				if (filtroAmbito === "internos" && d.tipo !== "interna") return false;
				if (filtroAmbito === "empresa" && d.tipo === "interna") return false;
				if (filtroTipo === "deudas" && d.tipo === "prestamo") return false;
				if (filtroTipo === "prestamos" && d.tipo !== "prestamo") return false;
				if (filtroEstado === "pendientes" && d.saldada) return false;
				if (filtroEstado === "saldadas" && !d.saldada) return false;
				return true;
			}),
		[deudas, filtroAmbito, filtroTipo, filtroEstado],
	);

	const miSaldo = saldos[user?.id] || { ARS: 0, USD: 0 };

	return (
		<div className="cuentas-view">
			<CuentasHeader total={deudasFiltradas.length} miSaldo={miSaldo} onNuevo={() => setNuevoDrawerOpen(true)} />

			<CuentasFilters
				ambito={filtroAmbito}
				tipo={filtroTipo}
				estado={filtroEstado}
				onAmbito={setFiltroAmbito}
				onTipo={setFiltroTipo}
				onEstado={setFiltroEstado}
			/>

			<CuentasTable
				deudas={deudasFiltradas}
				loading={loading}
				error={error}
				currentUserId={user?.id}
				onSaldar={setDeudaASaldar}
			/>

			<NuevaDeudaDrawer
				open={nuevoDrawerOpen}
				admins={admins}
				currentAdminId={user?.id}
				onClose={() => setNuevoDrawerOpen(false)}
				onCreated={() => {
					setNuevoDrawerOpen(false);
					fetchCuentas();
				}}
			/>

			<SaldarDeudaDrawer
				open={!!deudaASaldar}
				deuda={deudaASaldar}
				onClose={() => setDeudaASaldar(null)}
				onSaldada={() => {
					setDeudaASaldar(null);
					fetchCuentas();
				}}
			/>
		</div>
	);
};

export default Cuentas;
