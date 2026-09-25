import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import { editUser } from "../../../../services/usuarios.service";
import { ROLES, ROL_OPTIONS } from "../../../../constants/roles";
import "./UsuarioDrawer.css";

/**
 * Props:
 *  - open: boolean
 *  - usuario: objeto usuario a editar
 *  - currentUserRol: string — rol del usuario logueado (para mostrar/ocultar pass)
 *  - onClose: () => void
 *  - onSaved: (updatedUsuario) => void
 */
const UsuarioDrawer = ({ open, usuario, currentUserRol, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: "", email: "", pass: "", rol: ROLES.VENDEDOR, color: "#7c4dff" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentUserRol === ROLES.ADMIN;

  useEffect(() => {
    if (usuario) {
      setForm({ name: usuario.name, email: usuario.email, pass: "", rol: usuario.rol, color: usuario.color || "#7c4dff" });
      setError("");
    }
  }, [usuario]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError("");
    const body = {
      name: form.name,
      email: form.email,
      rol: form.rol,
    };
    // pass solo se envía si el campo tiene valor Y el usuario es admin
    if (isAdmin && form.pass.trim()) body.pass = form.pass;
    if (form.rol === ROLES.SOCIO) body.color = form.color;

    setLoading(true);
    try {
      const updated = await editUser(usuario.id, body);
      onSaved(); // recarga en el padre
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error al guardar los cambios.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: "usuario-drawer__paper" }}
    >
      <div className="usuario-drawer">
        <div className="usuario-drawer__header">
          <span className="usuario-drawer__title">Editar usuario</span>
          <button className="usuario-drawer__close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="usuario-drawer__body">
          <div className="usuario-drawer__field">
            <label className="usuario-drawer__label">Nombre</label>
            <input
              className="usuario-drawer__input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre completo"
              autoComplete="off"
            />
          </div>

          <div className="usuario-drawer__field">
            <label className="usuario-drawer__label">Correo electrónico</label>
            <input
              className="usuario-drawer__input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@email.com"
              autoComplete="off"
            />
          </div>

          {/* Campo contraseña: solo visible para admin */}
          {isAdmin && (
            <div className="usuario-drawer__field">
              <label className="usuario-drawer__label">
                Contraseña
                <span className="usuario-drawer__label-badge">Solo admin</span>
              </label>
              <input
                className="usuario-drawer__input"
                name="pass"
                type="password"
                value={form.pass}
                onChange={handleChange}
                placeholder="Dejar vacío para no cambiar"
                autoComplete="new-password"
              />
            </div>
          )}

          <div className="usuario-drawer__field">
            <label className="usuario-drawer__label">Rol</label>
            <select
              className="usuario-drawer__select"
              name="rol"
              value={form.rol}
              onChange={handleChange}
            >
              {ROL_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {form.rol === ROLES.SOCIO && (
            <div className="usuario-drawer__field">
              <label className="usuario-drawer__label">Color en el calendario</label>
              <input
                className="usuario-drawer__input"
                name="color"
                type="color"
                value={form.color}
                onChange={handleChange}
                style={{ width: 60, padding: 2 }}
              />
            </div>
          )}

          {error && <p className="usuario-drawer__error">{error}</p>}
        </div>

        <div className="usuario-drawer__footer">
          <button
            className="usuario-drawer__btn usuario-drawer__btn--primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="usuario-drawer__spinner" /> : null}
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
          <button
            className="usuario-drawer__btn usuario-drawer__btn--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default UsuarioDrawer;