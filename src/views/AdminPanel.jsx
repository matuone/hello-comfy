// src/views/AdminPanel.jsx
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/adminpanel.css";

export default function AdminPanel() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  function handleLogout() {
    logout();
  }

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <header className="admin-header">
        <h1 className="admin-title">Panel de Control</h1>
        <p className="admin-welcome">Bienvenido, {user.email}</p>

        <button className="admin-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      {/* GRID DE TARJETAS */}
      <div className="admin-grid">

        <Link to="/admin/products" className="admin-card">
          <div className="admin-card-icon">📦</div>
          <h2 className="admin-card-title">Productos</h2>
          <p className="admin-card-text">Crear, editar y eliminar productos</p>
        </Link>

        <Link to="/admin/categories" className="admin-card">
          <div className="admin-card-icon">🏷️</div>
          <h2 className="admin-card-title">Categorías</h2>
          <p className="admin-card-text">Gestionar categorías del catálogo</p>
        </Link>

        <Link to="/admin/banners" className="admin-card">
          <div className="admin-card-icon">🖼️</div>
          <h2 className="admin-card-title">Banners</h2>
          <p className="admin-card-text">Editar banners y promociones</p>
        </Link>

        <Link to="/admin/orders" className="admin-card">
          <div className="admin-card-icon">🧾</div>
          <h2 className="admin-card-title">Pedidos</h2>
          <p className="admin-card-text">Ver y gestionar pedidos</p>
        </Link>

        <Link to="/admin/customers" className="admin-card">
          <div className="admin-card-icon">👤</div>
          <h2 className="admin-card-title">Clientes</h2>
          <p className="admin-card-text">Ver información y compras de clientes</p>
        </Link>

      </div>
    </div>
  );
}
