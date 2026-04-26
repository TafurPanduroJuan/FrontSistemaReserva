import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — guarda una ruta según el rol del usuario autenticado.
 *
 * Props:
 *  - allowedRoles: string[] — roles que pueden acceder. Ej: ["administrador", "personal"]
 *  - redirectTo: string — ruta de redirección si no está autorizado (default "/login")
 *  - children: JSX
 *
 * Ejemplo de uso:
 *  <ProtectedRoute allowedRoles={["administrador"]}>
 *    <IntranetHome />
 *  </ProtectedRoute>
 */
export default function ProtectedRoute({
  allowedRoles = [],
  redirectTo = "/login",
  children,
}) {
  const { user } = useAuth();

  // No autenticado → login
  if (!user) return <Navigate to="/login" replace />;

  // Rol no permitido → redirigir según rol
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    if (user.rol === "administrador") return <Navigate to="/intranet" replace />;
    if (user.rol === "personal") return <Navigate to="/intranet/mesas" replace />;
    return <Navigate to="/mi-cuenta" replace />;
  }

  return children;
}