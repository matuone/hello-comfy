// src/components/AdminSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMaintenance } from "../context/MaintenanceContext";

export default function AdminSidebar() {
  const { logout } = useAuth();
  const { isMaintenanceMode, toggleMaintenanceMode } = useMaintenance();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleHome() {
    navigate("/");
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
          >
            Clientes
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
