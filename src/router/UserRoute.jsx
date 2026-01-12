import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function UserRoute({ children }) {
  const { user } = useContext(AuthContext);

  // No logueado → volver al login
  if (!user) {
    return <Navigate to="/mi-cuenta" replace />;
  }

  // Si es admin → mandarlo al panel admin
  if (user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Usuario normal → dejar pasar
  return children;
}
