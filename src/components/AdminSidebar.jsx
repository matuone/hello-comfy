// src/components/AdminSidebar.jsx
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <nav className="admin-sidebar-nav">
      <div className="admin-sidebar-header">
        <span className="admin-sidebar-logo">Hello Comfy</span>
        <span className="admin-sidebar-tag">Admin</span>
      </div>

      <ul className="admin-sidebar-list">

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
            NUEVA SECCIÓN: ESTADÍSTICAS
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

      </ul>
    </nav>
  );
}
