import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import { createUser } from "../../../../services/usuarios.service";
import { ROLES, ROL_OPTIONS } from "../../../../constants/roles";
import "./NuevoUsuarioDrawer.css";

const INITIAL_FORM = { name: "", email: "", pass: "", rol: ROLES.VENDEDOR, color: "#7c4dff" };

/**
 * Props:
 *  - open: boolean
 *  - currentUserRol: string — rol del usuario logueado
 *  - onClose: () => void
 *  - onCreated: (nuevoUsuario) => void
 */
const NuevoUsuarioDrawer = ({ open, currentUserRol, onClose, onCreated }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentUserRol === ROLES.ADMIN;

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setError("");
    }
  }, [open]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) return setError("El nombre es requerido.");
    if (!form.email.trim()) return setError("El correo electrónico es requerido.");
    // pass requerida al crear, pero solo si el usuario es admin (quien tiene el campo)
    if (isAdmin && !form.pass.trim()) return setError("La contraseña es requerida.");

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        rol: form.rol,
      };
      if (isAdmin && form.pass.trim()) payload.pass = form.pass;
      if (form.rol === ROLES.SOCIO) payload.color = form.color;

      await createUser(payload);
      onCreated(); // recarga en el padre
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error al crear el usuario.";
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
      PaperProps={{ className: "nuevo-drawer__paper" }}
    >
      <div className="nuevo-drawer">
        <div className="nuevo-drawer__header">
          <span className="nuevo-drawer__title">Nuevo usuario</span>
          <button className="nuevo-drawer__close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="nuevo-drawer__body">
          <div className="nuevo-drawer__field">
            <label className="nuevo-drawer__label">Nombre</label>
            <input
              className="nuevo-drawer__input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre completo"
              autoComplete="off"
            />
          </div>

          <div className="nuevo-drawer__field">
            <label className="nuevo-drawer__label">Correo electrónico</label>
            <input
              className="nuevo-drawer__input"
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
            <div className="nuevo-drawer__field">
              <label className="nuevo-drawer__label">
                Contraseña
                <span className="nuevo-drawer__label-badge">Solo admin</span>
              </label>
              <div className="nuevo-drawer__input-wrap">
                <input
                  className="nuevo-drawer__input nuevo-drawer__input--pass"
                  name="pass"
                  type="text"
                  value={form.pass}
                  onChange={handleChange}
                  placeholder="Contraseña segura"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <div className="nuevo-drawer__field">
            <label className="nuevo-drawer__label">Rol</label>
            <select
              className="nuevo-drawer__select"
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

          {/* Color del calendario: solo tiene sentido para el socio, que
              comparte el calendario del equipo y necesita distinguirse. */}
          {form.rol === ROLES.SOCIO && (
            <div className="nuevo-drawer__field">
              <label className="nuevo-drawer__label">Color en el calendario</label>
              <input
                className="nuevo-drawer__input"
                name="color"
                type="color"
                value={form.color}
                onChange={handleChange}
                style={{ width: 60, padding: 2 }}
              />
            </div>
          )}

          {error && <p className="nuevo-drawer__error">{error}</p>}
        </div>

        <div className="nuevo-drawer__footer">
          <button
            className="nuevo-drawer__btn nuevo-drawer__btn--primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="nuevo-drawer__spinner" /> : null}
            {loading ? "Creando…" : "Crear usuario"}
          </button>
          <button
            className="nuevo-drawer__btn nuevo-drawer__btn--secondary"
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

export default NuevoUsuarioDrawer;