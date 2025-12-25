// src/views/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <AdminSidebar />
      </aside>

      <main className="admin-main">
        <header className="admin-main-header">
          <h1 className="admin-main-title">Panel de administración</h1>
          <p className="admin-main-subtitle">
            Gestión interna de Hello Comfy
          </p>
        </header>

        <section className="admin-main-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
