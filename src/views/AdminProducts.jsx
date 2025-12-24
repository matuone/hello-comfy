// src/views/AdminProducts.jsx
import { useState } from "react";
import "../styles/admin.css";

export default function AdminProducts() {
  const [products] = useState([]); // placeholder hasta conectar backend

  function handleAddProduct() {
    alert("Función para agregar producto (se activará en Fase 2)");
  }

  return (
    <div className="admin-section">
      <h1 className="admin-title">Gestión de Productos</h1>
      <p className="admin-subtitle">
        Aquí podrás crear, editar y eliminar productos de la tienda.
      </p>

      {/* Botón agregar */}
      <div className="admin-buttons">
        <button className="admin-btn" onClick={handleAddProduct}>
          + Agregar producto
        </button>
      </div>

      {/* Placeholder de tabla */}
      <div className="admin-products-table">
        {products.length === 0 ? (
          <p className="admin-empty">Todavía no hay productos cargados.</p>
        ) : (
          <p>Acá irá la tabla real de productos</p>
        )}
      </div>
    </div>
  );
}
