// src/views/AdminOrders.jsx
import { useState } from "react";
import "../styles/admin.css";

export default function AdminOrders() {
  const [orders] = useState([]); // placeholder hasta backend

  function handleRefresh() {
    alert("Función para refrescar pedidos (se activará en Fase 2)");
  }

  return (
    <div className="admin-section">
      <h1 className="admin-title">Gestión de Pedidos</h1>
      <p className="admin-subtitle">
        Aquí podrás ver, actualizar y gestionar los pedidos de los clientes.
      </p>

      {/* Botón refrescar */}
      <div className="admin-buttons">
        <button className="admin-btn" onClick={handleRefresh}>
          🔄 Actualizar pedidos
        </button>
      </div>

      {/* Placeholder */}
      <div className="admin-products-table">
        {orders.length === 0 ? (
          <p className="admin-empty">Todavía no hay pedidos registrados.</p>
        ) : (
          <p>Acá irá la tabla real de pedidos</p>
        )}
      </div>
    </div>
  );
}
