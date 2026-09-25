import React, { useState, useEffect, useMemo } from "react";
import UsuariosHeader from "../../../components/CRM/Usuarios/UsuariosHeader/UsuariosHeader";
import UsuariosTable from "../../../components/CRM/Usuarios/UsuariosTable/UsuariosTable";
import UsuarioDrawer from "../../../components/CRM/Usuarios/UsuarioDrawer/UsuarioDrawer";
import NuevoUsuarioDrawer from "../../../components/CRM/Usuarios/NuevoUsuarioDrawer/NuevoUsuarioDrawer";
import { getUsers, deleteUser } from "../../../services/usuarios.service";
import { useAuth } from "../../../context/AuthContext";
import "./Usuarios.css";

const Usuarios = () => {
  const { userRol } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Drawers
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [nuevoDrawerOpen, setNuevoDrawerOpen] = useState(false);

  // ── Carga / recarga ──
  const fetchUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsuarios(Array.isArray(data.users) ? data.users : []);
    } catch {
      setError("No se pudieron cargar los usuarios. Verificá la conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  // ── Filtro ──
  const filtered = useMemo(() => {
    if (!search.trim()) return usuarios;
    const q = search.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [usuarios, search]);

  // ── Editar ──
  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setEditDrawerOpen(true);
  };

  // ── Eliminar ──
  const handleDeleteRequest = (id) => setConfirmDeleteId(id);
  const handleDeleteCancel = () => setConfirmDeleteId(null);

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteUser(id);
      setConfirmDeleteId(null);
      fetchUsuarios();
    } catch {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="usuarios-view">
      <UsuariosHeader
        currentUserRol={userRol}
        total={usuarios.length}
        search={search}
        onSearchChange={setSearch}
        onNuevo={() => setNuevoDrawerOpen(true)}
      />

      <UsuariosTable
        currentUserRol={userRol}
        usuarios={filtered}
        loading={loading}
        error={error}
        confirmDeleteId={confirmDeleteId}
        onEdit={handleEdit}
        onDeleteRequest={handleDeleteRequest}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={handleDeleteCancel}
      />

      <UsuarioDrawer
        open={editDrawerOpen}
        usuario={selectedUsuario}
        currentUserRol={userRol}
        onClose={() => setEditDrawerOpen(false)}
        onSaved={() => { setEditDrawerOpen(false); fetchUsuarios(); }}
      />

      <NuevoUsuarioDrawer
        open={nuevoDrawerOpen}
        currentUserRol={userRol}
        onClose={() => setNuevoDrawerOpen(false)}
        onCreated={() => { setNuevoDrawerOpen(false); fetchUsuarios(); }}
      />
    </div>
  );
};

export default Usuarios;