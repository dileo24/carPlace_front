import React, { useState, useEffect } from "react";
import CuentasHeader from "../../../components/CRM/Cuentas/CuentasHeader/CuentasHeader";
import CuentasTable from "../../../components/CRM/Cuentas/CuentasTable/CuentasTable";
import NuevaDeudaDrawer from "../../../components/CRM/Cuentas/NuevaDeudaDrawer/NuevaDeudaDrawer";
import { getCuentas, deleteDeuda } from "../../../services/cuentas.service";
import { useAuth } from "../../../context/AuthContext";
import "./Cuentas.css";

const Cuentas = () => {
	const { user } = useAuth();
	const [deudas, setDeudas] = useState([]);
	const [admins, setAdmins] = useState([]);
	const [saldos, setSaldos] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [confirmDeleteId, setConfirmDeleteId] = useState(null);
	const [nuevoDrawerOpen, setNuevoDrawerOpen] = useState(false);

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

	const handleDeleteRequest = (id) => setConfirmDeleteId(id);
	const handleDeleteCancel = () => setConfirmDeleteId(null);

	const handleDeleteConfirm = async (id) => {
		try {
			await deleteDeuda(id);
			setConfirmDeleteId(null);
			fetchCuentas();
		} catch {
			setConfirmDeleteId(null);
		}
	};

	const miSaldo = saldos[user?.id] || { ARS: 0, USD: 0 };

	return (
		<div className="cuentas-view">
			<CuentasHeader total={deudas.length} miSaldo={miSaldo} onNuevo={() => setNuevoDrawerOpen(true)} />

			<CuentasTable
				deudas={deudas}
				loading={loading}
				error={error}
				confirmDeleteId={confirmDeleteId}
				onDeleteRequest={handleDeleteRequest}
				onDeleteConfirm={handleDeleteConfirm}
				onDeleteCancel={handleDeleteCancel}
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
		</div>
	);
};

export default Cuentas;
