{/* ============================
      OPINIONES
    ============================ */}

// src/components/AdminSidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMaintenance } from "../context/MaintenanceContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function AdminSidebar({ onNavigate }) {
  const { logout, adminFetch } = useAuth();
  const { isMaintenanceMode, toggleMaintenanceMode } = useMaintenance();
  const navigate = useNavigate();
  const [isSyncingInstagram, setIsSyncingInstagram] = useState(false);
  const [instagramSyncMessage, setInstagramSyncMessage] = useState("");

  async function handleInstagramSync() {
    try {
      setIsSyncingInstagram(true);
      setInstagramSyncMessage("Sincronizando Instagram...");

      const response = await adminFetch(apiPath("/instagram/sync"), {
        method: "POST",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "No se pudo sincronizar Instagram");
      }

      setInstagramSyncMessage(data?.message || "Instagram sincronizado correctamente");
    } catch (error) {
      console.error("Error sincronizando Instagram:", error);
      setInstagramSyncMessage(error?.message || "Error al sincronizar Instagram");
    } finally {
      setIsSyncingInstagram(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
    if (onNavigate) onNavigate();
  }

  function handleHome() {
    navigate("/");
    if (onNavigate) onNavigate();
  }

  function handleNavLink() {
    if (onNavigate) onNavigate();
  }

  return (
    <nav className="admin-sidebar-nav">
      <div className="admin-sidebar-header">
        <span className="admin-sidebar-logo">Hello Comfy</span>
        <span className="admin-sidebar-tag">Admin</span>
      </div>

      <ul className="admin-sidebar-list">

        {/* ============================
            GENERAL
        ============================ */}
        <li>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            General
          </NavLink>
        </li>

        {/* ============================
            VENTAS
        ============================ */}
        <li>
          <NavLink
            to="/admin/sales"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Ventas
          </NavLink>
        </li>

        {/* ============================
            PRODUCTOS
        ============================ */}
        <li>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Productos
          </NavLink>
        </li>

        {/* ============================
            STOCK
        ============================ */}
        <li>
          <NavLink
            to="/admin/stock"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Stock
          </NavLink>
        </li>

        {/* ============================
            CLIENTES
        ============================ */}
        <li>
          <NavLink
            to="/admin/customers"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Clientes
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/opinions"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Opiniones
          </NavLink>
        </li>
        {/* ============================
            CARRITOS ABANDONADOS
        ============================ */}
        <li>
          <NavLink
            to="/admin/abandoned-carts"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Carritos abandonados
          </NavLink>
        </li>

        {/* ============================
            ESTADÍSTICAS
        ============================ */}
        <li>
          <NavLink
            to="/admin/stats"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Estadísticas
          </NavLink>
        </li>

        {/* ============================
            MARKETING
        ============================ */}
        <li>
          <NavLink
            to="/admin/marketing"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Marketing
          </NavLink>
        </li>

        {/* ============================
            DESCUENTOS
        ============================ */}
        <li>
          <NavLink
            to="/admin/discounts"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Descuentos
          </NavLink>
        </li>

        {/* ============================
            CÓDIGOS PROMOCIONALES
        ============================ */}
        <li>
          <NavLink
            to="/admin/promocodes"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Códigos promocionales
          </NavLink>
        </li>

        {/* ============================
            SUBCATEGORÍAS
        ============================ */}
        <li>
          <NavLink
            to="/admin/subcategories"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Agregar subcategoría
          </NavLink>
        </li>

        {/* ============================
            TABLAS DE TALLES
        ============================ */}
        <li>
          <NavLink
            to="/admin/sizetables"
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " admin-sidebar-link--active" : "")
            }
            onClick={handleNavLink}
          >
            Agregar tabla de talle
          </NavLink>
        </li>

      </ul>

      {/* ============================
          BOTONES DE ACCIÓN
      ============================ */}
      <div className="admin-sidebar-actions">
        <div className="admin-sidebar-toggle-maintenance">
          <label
            htmlFor="maintenance-toggle"
            className={`maintenance-label ${isMaintenanceMode ? "maintenance-label--paused" : "maintenance-label--active"}`}
          >
            {isMaintenanceMode ? "🔴 Web Pausada" : "🟢 Web Activa"}
          </label>
          <label className="toggle-switch-container">
            <input
              id="maintenance-toggle"
              type="checkbox"
              checked={!isMaintenanceMode}
              onChange={(e) => toggleMaintenanceMode(!e.target.checked)}
              className="maintenance-toggle"
            />
            <span className={`toggle-switch ${isMaintenanceMode ? "toggle-switch--paused" : ""}`}></span>
          </label>
        </div>

        <button
          className="admin-sidebar-action-btn instagram-sync-btn"
          onClick={handleInstagramSync}
          disabled={isSyncingInstagram}
          title="Sincronizar últimos posteos de Instagram"
        >
          {isSyncingInstagram ? "⏳ Sincronizando Instagram..." : "📸 Sincronizar Instagram ahora"}
        </button>

        {instagramSyncMessage && (
          <p className="instagram-sync-feedback">{instagramSyncMessage}</p>
        )}

        <button
          className="admin-sidebar-action-btn home-btn"
          onClick={handleHome}
          title="Volver al home"
        >
          🏠 Volver al home
        </button>

        <button
          className="admin-sidebar-action-btn tools-btn"
          title="Herramientas (próximamente)"
        >
          🛠️ Herramientas
        </button>

        <button
          className="admin-sidebar-action-btn logout-btn"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
