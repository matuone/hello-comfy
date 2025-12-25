import { useState } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

export default function AdminCategories() {
  // ============================
  // CATEGORÍAS DE EJEMPLO
  // ============================
  const [categorias, setCategorias] = useState([
    { id: "C001", nombre: "Indumentaria", slug: "indumentaria" },
    { id: "C002", nombre: "Cute Items", slug: "cute-items" },
    { id: "C003", nombre: "Merch", slug: "merch" },
  ]);

  // ============================
  // EDITAR CATEGORÍA
  // ============================
  const [editando, setEditando] = useState(null);

  function guardarCategoria() {
    setCategorias(prev =>
      prev.map(c => (c.id === editando.id ? editando : c))
    );
    setEditando(null);
  }

  function borrarCategoria(id) {
    if (confirm("¿Seguro que querés borrar esta categoría?")) {
      setCategorias(prev => prev.filter(c => c.id !== id));
    }
  }

  // ============================
  // AGREGAR CATEGORÍA NUEVA
  // ============================
  function agregarCategoria() {
    const nueva = {
      id: "C" + Math.floor(Math.random() * 9999),
      nombre: "Nueva categoría",
      slug: "nueva-categoria",
    };

    setCategorias(prev => [...prev, nueva]);
    setEditando(nueva);
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="admin-header">
        <h1 className="admin-title">Categorías</h1>
        <p className="admin-welcome">Gestioná las categorías de productos</p>
      </div>

      {/* ============================
          LISTA DE CATEGORÍAS
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Listado de categorías</h2>

        <button className="btn-agregar" onClick={agregarCategoria}>
          + Agregar categoría
        </button>

        <div className="categorias-grid">
          {categorias.map(cat => (
            <div key={cat.id} className="categoria-card">
              {editando?.id === cat.id ? (
                <>
                  <input
                    className="producto-input"
                    value={editando.nombre}
                    onChange={e =>
                      setEditando({ ...editando, nombre: e.target.value })
                    }
                  />

                  <input
                    className="producto-input"
                    value={editando.slug}
                    onChange={e =>
                      setEditando({ ...editando, slug: e.target.value })
                    }
                  />

                  <button className="btn-guardar" onClick={guardarCategoria}>
                    Guardar
                  </button>
                </>
              ) : (
                <>
                  <h3 className="categoria-nombre">{cat.nombre}</h3>
                  <p className="categoria-slug">/{cat.slug}</p>

                  <button
                    className="btn-editar"
                    onClick={() => setEditando(cat)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn-borrar"
                    onClick={() => borrarCategoria(cat.id)}
                  >
                    Borrar
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}
