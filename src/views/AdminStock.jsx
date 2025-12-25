import { useState } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

export default function AdminStock() {
  // ============================
  // TALLES Y COLORES
  // ============================
  const talles = ["S", "M", "L", "XL", "XXL"];
  const colores = ["Blanco", "Negro", "Rosa", "Celeste", "Beige"];

  // ============================
  // STOCK DE EJEMPLO
  // ============================
  const [stock, setStock] = useState({
    S: { Blanco: 10, Negro: 5, Rosa: 8, Celeste: 6, Beige: 4 },
    M: { Blanco: 12, Negro: 7, Rosa: 9, Celeste: 5, Beige: 3 },
    L: { Blanco: 8, Negro: 4, Rosa: 6, Celeste: 7, Beige: 2 },
    XL: { Blanco: 6, Negro: 3, Rosa: 4, Celeste: 5, Beige: 1 },
    XXL: { Blanco: 4, Negro: 2, Rosa: 3, Celeste: 2, Beige: 1 },
  });

  // ============================
  // ACTUALIZAR STOCK
  // ============================
  function actualizarStock(talle, color, valor) {
    setStock(prev => ({
      ...prev,
      [talle]: {
        ...prev[talle],
        [color]: Number(valor),
      },
    }));
  }

  function guardarCambios() {
    alert("Stock actualizado correctamente");
    // Aquí conectás tu backend
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="admin-header">
        <h1 className="admin-title">Stock de Remeras Base</h1>
        <p className="admin-welcome">Controlá el stock por talle y color</p>
      </div>

      {/* ============================
          TABLA DE STOCK
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Inventario</h2>

        <div className="stock-grid">
          {/* ENCABEZADO */}
          <div className="stock-header">Talle / Color</div>
          {colores.map(color => (
            <div key={color} className="stock-header">{color}</div>
          ))}

          {/* FILAS */}
          {talles.map(talle => (
            <>
              <div key={talle} className="stock-talle">{talle}</div>

              {colores.map(color => (
                <input
                  key={talle + color}
                  type="number"
                  className="stock-input"
                  value={stock[talle][color]}
                  onChange={e => actualizarStock(talle, color, e.target.value)}
                />
              ))}
            </>
          ))}
        </div>

        <button className="btn-guardar" onClick={guardarCambios}>
          Guardar cambios
        </button>
      </section>
    </AdminLayout>
  );
}
