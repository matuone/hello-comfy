import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Si no hay usuario → redirigir
  if (!user) {
    return <Navigate to="/mi-cuenta" replace />;
  }

  return children;
}
