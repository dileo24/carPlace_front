import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

/**
 * Props:
 *  - roles: array de roles permitidos (opcional — si no se pasa, solo requiere estar autenticado)
 *  - redirectTo: ruta a la que redirige si no tiene permiso (default: "/crm")
 */
export default function ProtectedRoute({ children, roles, redirectTo = "/crm" }) {
  const { isAuthenticated, userRol } = useAuth();

  if (!isAuthenticated) return <Navigate to="/loginAdminP" replace />;

  if (roles && !roles.includes(userRol)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}