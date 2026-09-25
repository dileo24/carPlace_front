import React, { useState, useEffect, useMemo } from "react";
import PublicacionesHeader from "../../../components/CRM/Publicaciones/PublicacionesHeader/PublicacionesHeader";
import PublicacionesTable from "../../../components/CRM/Publicaciones/PublicacionesTable/PublicacionesTable";
import NuevaPublicacionDrawer from "../../../components/CRM/Publicaciones/NuevaPublicacionDrawer/NuevaPublicacionDrawer";
import {
	getPublicaciones,
	pausarPublicacion,
	reactivarPublicacion,
	cerrarPublicacion,
	eliminarPublicacion,
	republicarPublicacion,
	borrarRegistroPublicacion,
} from "../../../services/publicaciones.service";
import "./Publicaciones.css";

const Publicaciones = () => {
	const [publicaciones, setPublicaciones] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [nuevoDrawerOpen, setNuevoDrawerOpen] = useState(false);
	const [actionLoadingId, setActionLoadingId] = useState(null);
	const [aviso, setAviso] = useState(null); // { tipo: "ok" | "error", texto }
	const [sort, setSort] = useState({ campo: "nombre", dir: "asc" });

	const fetchPublicaciones = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await getPublicaciones();
			setPublicaciones(Array.isArray(data?.resp) ? data.resp : []);
		} catch {
			setError("No se pudieron cargar las publicaciones. Verificá la conexión.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPublicaciones();
	}, []);

	const filtered = useMemo(() => {
		if (!search.trim()) return publicaciones;
		const q = search.toLowerCase();
		return publicaciones.filter((p) => {
			const nombre = p.Auto ? `${p.Auto.marca} ${p.Auto.modelo} ${p.Auto.anio}` : "";
			return nombre.toLowerCase().includes(q);
		});
	}, [publicaciones, search]);

	const nombreDe = (p) => (p.Auto ? `${p.Auto.marca} ${p.Auto.modelo} ${p.Auto.anio}` : `Auto #${p.autoId}`);

	const sorted = useMemo(() => {
		const { campo, dir } = sort;
		const signo = dir === "asc" ? 1 : -1;
		return [...filtered].sort((a, b) => {
			let va, vb;
			if (campo === "nombre") {
				va = nombreDe(a).toLowerCase();
				vb = nombreDe(b).toLowerCase();
			} else if (campo === "estado") {
				va = a.estado || "";
				vb = b.estado || "";
			} else {
				// publicadoEn / expiraEn — fechas, las nulas quedan siempre al final
				va = a[campo] ? new Date(a[campo]).getTime() : null;
				vb = b[campo] ? new Date(b[campo]).getTime() : null;
				if (va === null && vb === null) return 0;
				if (va === null) return 1;
				if (vb === null) return -1;
			}
			if (va < vb) return -1 * signo;
			if (va > vb) return 1 * signo;
			return 0;
		});
	}, [filtered, sort]);

	const handleSort = (campo) => {
		setSort((prev) => (prev.campo === campo ? { campo, dir: prev.dir === "asc" ? "desc" : "asc" } : { campo, dir: "asc" }));
	};

	const ejecutarAccion = async (publicacion, accion, mensajeError) => {
		setActionLoadingId(publicacion.id);
		setAviso(null);
		try {
			const data = await accion(publicacion.id);
			// "info" viene cuando la acción no hizo lo pedido porque la
			// publicación ya se había gestionado directamente en MercadoLibre —
			// el registro se corrigió solo, ver cambiarEstadoPublicacion.js.
			if (data?.info) setAviso({ tipo: "info", texto: data.info });
		} catch (err) {
			const msg = err?.response?.data?.error || mensajeError;
			setAviso({ tipo: "error", texto: msg });
		} finally {
			await fetchPublicaciones();
			setActionLoadingId(null);
		}
	};

	const handlePausar = (p) => ejecutarAccion(p, pausarPublicacion, "No se pudo pausar la publicación.");
	const handleReactivar = (p) => ejecutarAccion(p, reactivarPublicacion, "No se pudo reactivar la publicación.");
	const handleCerrar = (p) => {
		if (!window.confirm("¿Finalizar esta publicación en MercadoLibre? Queda cerrada mostrada como \"Inactiva\" en tu panel — no se puede deshacer.")) return;
		ejecutarAccion(p, cerrarPublicacion, "No se pudo finalizar la publicación.");
	};
	const handleEliminar = (p) => {
		if (!window.confirm("¿Eliminar esta publicación de MercadoLibre? A diferencia de \"Finalizar\", desaparece del todo de tu listado — no se puede deshacer.")) return;
		ejecutarAccion(p, eliminarPublicacion, "No se pudo eliminar la publicación.");
	};
	const handleRepublicar = (p) => ejecutarAccion(p, republicarPublicacion, "No se pudo republicar el auto.");
	const handleBorrarRegistro = (p) => {
		if (!window.confirm("¿Borrar este registro de la lista? Ya está eliminada de MercadoLibre — esto solo saca la fila de acá, no se puede deshacer.")) return;
		ejecutarAccion(p, borrarRegistroPublicacion, "No se pudo borrar el registro.");
	};

	return (
		<div className="publicaciones-view">
			<PublicacionesHeader
				total={publicaciones.length}
				search={search}
				onSearchChange={setSearch}
				onNuevo={() => setNuevoDrawerOpen(true)}
			/>

			{aviso && (
				<div className={`publicaciones-view__aviso publicaciones-view__aviso--${aviso.tipo}`}>{aviso.texto}</div>
			)}

			<PublicacionesTable
				publicaciones={sorted}
				loading={loading}
				error={error}
				actionLoadingId={actionLoadingId}
				sort={sort}
				onSort={handleSort}
				onPausar={handlePausar}
				onReactivar={handleReactivar}
				onCerrar={handleCerrar}
				onEliminar={handleEliminar}
				onRepublicar={handleRepublicar}
				onBorrarRegistro={handleBorrarRegistro}
			/>

			<NuevaPublicacionDrawer
				open={nuevoDrawerOpen}
				onClose={() => setNuevoDrawerOpen(false)}
				onCreated={() => {
					setNuevoDrawerOpen(false);
					fetchPublicaciones();
				}}
			/>
		</div>
	);
};

export default Publicaciones;
