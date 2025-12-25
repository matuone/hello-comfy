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
              "admin-sidebar-link" + (isActive ? " admin-sidebar-link--active" : "")
            }
          >
            General
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/sales"
            className={({ isActive }) =>
              "admin-sidebar-link" + (isActive ? " admin-sidebar-link--active" : "")
            }
          >
            Ventas
          </NavLink>
        </li>

        {/* Cuando quieras agregamos más secciones:
        <li><NavLink to="/admin/products">Productos</NavLink></li>
        <li><NavLink to="/admin/customers">Clientes</NavLink></li>
        etc.
        */}
      </ul>
    </nav>
  );
}
