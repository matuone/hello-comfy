
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Si no hay usuario → redirigir a login
  if (!user) {
    return <Navigate to="/mi-cuenta" replace />;
  }

  // Si el usuario no es admin → NotFound
  if (!user.isAdmin) {
    return <Navigate to="/notfound" replace />;
  }

  return children;
}
