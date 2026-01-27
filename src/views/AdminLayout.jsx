// src/views/AdminLayout.jsx

import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";
import { useState } from "react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cierra el sidebar al navegar (en móvil)
  function handleSidebarClose() {
    setSidebarOpen(false);
  }

  return (
    <div className="admin-shell">
      {/* Botón hamburguesa solo visible en móvil */}
      <button
        className="admin-hamburger-btn"
        aria-label="Abrir menú"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Sidebar: offcanvas en móvil, fijo en desktop */}
      <aside className={`admin-sidebar${sidebarOpen ? " admin-sidebar--open" : ""}`}>
        <AdminSidebar onNavigate={handleSidebarClose} />
      </aside>

      {/* Overlay para cerrar el menú en móvil */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={handleSidebarClose} />}

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
