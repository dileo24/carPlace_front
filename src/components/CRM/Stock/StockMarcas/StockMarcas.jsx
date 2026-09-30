import React, { useState, useEffect, useMemo } from "react";
import MarcasHeader from "../../Marcas/MarcasHeader/MarcasHeader";
import MarcasTable from "../../Marcas/MarcasTable/MarcasTable";
import MarcaDrawer from "../../Marcas/MarcaDrawer/MarcaDrawer";
import NuevaMarcaDrawer from "../../Marcas/NuevaMarcaDrawer/NuevaMarcaDrawer";
import ConfirmDeleteMarcaDialog from "../../Marcas/ConfirmDeleteMarcaDialog/ConfirmDeleteMarcaDialog";
import { getMarcasCatalogo, getAutosPorMarca, deleteMarca } from "../../../../services/marcas.service";
import "./StockMarcas.css";

const StockMarcas = () => {
	const [marcas, setMarcas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");

	const [editDrawerOpen, setEditDrawerOpen] = useState(false);
	const [selectedMarca, setSelectedMarca] = useState(null);
	const [nuevoDrawerOpen, setNuevoDrawerOpen] = useState(false);

	// { marca, autosAfectados: null (cargando) | array } | null
	const [confirmDelete, setConfirmDelete] = useState(null);
	const [deleting, setDeleting] = useState(false);

	const fetchMarcas = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await getMarcasCatalogo();
			setMarcas(Array.isArray(data?.resp) ? data.resp : []);
		} catch {
			setError("No se pudieron cargar las marcas. Verificá la conexión.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMarcas();
	}, []);

	const filtered = useMemo(() => {
		if (!search.trim()) return marcas;
		const q = search.toLowerCase();
		return marcas.filter((m) => m.nombre?.toLowerCase().includes(q));
	}, [marcas, search]);

	const handleEdit = (marca) => {
		setSelectedMarca(marca);
		setEditDrawerOpen(true);
	};

	const handleDeleteRequest = async (marca) => {
		setConfirmDelete({ marca, autosAfectados: null });
		try {
			const data = await getAutosPorMarca(marca.id);
			setConfirmDelete({ marca, autosAfectados: Array.isArray(data?.resp) ? data.resp : [] });
		} catch {
			setConfirmDelete({ marca, autosAfectados: [] });
		}
	};

	const handleDeleteCancel = () => setConfirmDelete(null);

	const handleDeleteConfirm = async () => {
		if (!confirmDelete?.marca) return;
		setDeleting(true);
		try {
			await deleteMarca(confirmDelete.marca.id);
			setConfirmDelete(null);
			fetchMarcas();
		} catch {
			setError("No se pudo eliminar la marca.");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="stock-marcas">
			<MarcasHeader titulo="Stock · Marcas" total={marcas.length} search={search} onSearchChange={setSearch} onNuevo={() => setNuevoDrawerOpen(true)} />

			<MarcasTable marcas={filtered} loading={loading} error={error} onEdit={handleEdit} onDeleteRequest={handleDeleteRequest} />

			<MarcaDrawer
				open={editDrawerOpen}
				marca={selectedMarca}
				onClose={() => setEditDrawerOpen(false)}
				onSaved={() => {
					setEditDrawerOpen(false);
					fetchMarcas();
				}}
			/>

			<NuevaMarcaDrawer
				open={nuevoDrawerOpen}
				onClose={() => setNuevoDrawerOpen(false)}
				onCreated={() => {
					setNuevoDrawerOpen(false);
					fetchMarcas();
				}}
			/>

			<ConfirmDeleteMarcaDialog
				open={!!confirmDelete}
				nombre={confirmDelete?.marca?.nombre}
				autosAfectados={confirmDelete?.autosAfectados}
				deleting={deleting}
				onCancel={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
};

export default StockMarcas;
