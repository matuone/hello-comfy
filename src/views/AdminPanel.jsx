// src/views/AdminPanel.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminPanel() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="admin-panel">
      <h1>Panel de Control</h1>
      <p>Bienvenido, {user.email}</p>

      <button onClick={logout} className="admin-panel__logout">
        Cerrar sesión
      </button>

      {/* Más adelante acá van: gestión de productos, banners, etc. */}
    </div>
  );
}
