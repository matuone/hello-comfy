
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isValidatingAdminToken } = useContext(AuthContext);

  // Mientras se valida el token guardado (F5 / nueva pestaña), no redirigir
  if (isValidatingAdminToken) {
    return null;
  }

  // Si no hay usuario → redirigir a login de admin
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si el usuario no es admin → NotFound
  if (!user.isAdmin) {
    return <Navigate to="/notfound" replace />;
  }

  return children;
}
