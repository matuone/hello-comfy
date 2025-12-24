// src/views/AdminCustomers.jsx
import { useState } from "react";
import "../styles/admin.css";

export default function AdminCustomers() {
  const [customers] = useState([]); // placeholder hasta backend

  function handleRefresh() {
    alert("Función para refrescar clientes (se activará en Fase 2)");
  }

  return (
    <div className="admin-section">
      <h1 className="admin-title">Clientes</h1>
      <p className="admin-subtitle">
        Información de clientes y su historial de compras.
      </p>

      {/* Botón refrescar */}
      <div className="admin-buttons">
        <button className="admin-btn" onClick={handleRefresh}>
          🔄 Actualizar clientes
        </button>
      </div>

      {/* Placeholder */}
      <div className="admin-products-table">
        {customers.length === 0 ? (
          <p className="admin-empty">
            Todavía no hay clientes registrados.
          </p>
        ) : (
          <p>Acá irá la tabla real de clientes con historial</p>
        )}
      </div>
    </div>
  );
}
