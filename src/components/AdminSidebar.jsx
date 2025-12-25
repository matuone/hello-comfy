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
        {/* después agregamos Ventas, Productos, etc. */}
      </ul>
    </nav>
  );
}
