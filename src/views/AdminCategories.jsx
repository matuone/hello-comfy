// src/views/AdminCategories.jsx
import { useState } from "react";
import "../styles/admin.css";

export default function AdminCategories() {
  const [categories] = useState([]); // placeholder hasta backend

  function handleAddCategory() {
    alert("Función para agregar categoría (se activará en Fase 2)");
  }

  return (
    <div className="admin-section">
      <h1 className="admin-title">Gestión de Categorías</h1>
      <p className="admin-subtitle">
        Aquí podrás crear, editar y eliminar categorías del catálogo.
      </p>

      {/* Botón agregar */}
      <div className="admin-buttons">
        <button className="admin-btn" onClick={handleAddCategory}>
          + Agregar categoría
        </button>
      </div>

      {/* Placeholder */}
      <div className="admin-products-table">
        {categories.length === 0 ? (
          <p className="admin-empty">Todavía no hay categorías cargadas.</p>
        ) : (
          <p>Acá irá la tabla real de categorías</p>
        )}
      </div>
    </div>
  );
}
