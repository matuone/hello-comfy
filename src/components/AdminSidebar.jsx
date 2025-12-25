import { Link, useLocation } from "react-router-dom";
import "../styles/adminpanel.css";

export default function AdminSidebar() {
  const { pathname } = useLocation();

  const items = [
    { path: "/admin", label: "General" },
    { path: "/admin/orders", label: "Ventas" },
    { path: "/admin/products", label: "Productos" },
    { path: "/admin/stock", label: "Stock" },
    { path: "/admin/banners", label: "Mensaje del Banner" },
    { path: "/admin/customers", label: "Clientes" }, // 👈 AGREGADO
  ];

  return (
    <aside className="admin-categories-sidebar">
      <h3 className="sidebar-title">Panel</h3>

      <ul className="sidebar-list">
        {items.map((item) => (
          <li
            key={item.path}
            className={`sidebar-item ${pathname === item.path ? "active" : ""
              }`}
          >
            <Link className="sidebar-link" to={item.path}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
