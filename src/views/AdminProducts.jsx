import { useState } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

export default function AdminProducts() {
  // ============================
  // CATEGORÍAS DE PRODUCTOS
  // ============================
  const categorias = ["indumentaria", "cute-items", "merch"];

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("indumentaria");

  // ============================
  // PRODUCTOS DE EJEMPLO
  // ============================
  const [productos, setProductos] = useState([
    {
      id: "P001",
      nombre: "Remera Osito Rosa",
      categoria: "indumentaria",
      precio: 9500,
      stock: 12,
      imagen: "https://via.placeholder.com/120",
    },
    {
      id: "P002",
      nombre: "Sticker Pack Cute",
      categoria: "cute-items",
      precio: 1500,
      stock: 50,
      imagen: "https://via.placeholder.com/120",
    },
    {
      id: "P003",
      nombre: "Taza HelloComfy",
      categoria: "merch",
      precio: 4500,
      stock: 20,
      imagen: "https://via.placeholder.com/120",
    },
  ]);

  // ============================
  // EDITAR PRODUCTO
  // ============================
  const [editando, setEditando] = useState(null);

  function guardarProducto() {
    setProductos(prev =>
      prev.map(p => (p.id === editando.id ? editando : p))
    );
    setEditando(null);
  }

  function borrarProducto(id) {
    if (confirm("¿Seguro que querés borrar este producto?")) {
      setProductos(prev => prev.filter(p => p.id !== id));
    }
  }

  // ============================
  // AGREGAR PRODUCTO NUEVO
  // ============================
  function agregarProducto() {
    const nuevo = {
      id: "P" + Math.floor(Math.random() * 9999),
      nombre: "Nuevo producto",
      categoria: categoriaSeleccionada,
      precio: 0,
      stock: 0,
      imagen: "https://via.placeholder.com/120",
    };

    setProductos(prev => [...prev, nuevo]);
    setEditando(nuevo);
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="admin-header">
        <h1 className="admin-title">Productos</h1>
        <p className="admin-welcome">Gestioná todos los productos de la tienda</p>
      </div>

      {/* ============================
          SELECTOR DE CATEGORÍA
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Categorías</h2>

        <div className="categoria-selector">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`categoria-btn ${categoriaSeleccionada === cat ? "active" : ""
                }`}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ============================
          LISTA DE PRODUCTOS
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Productos de {categoriaSeleccionada}</h2>

        <button className="btn-agregar" onClick={agregarProducto}>
          + Agregar producto
        </button>

        <div className="productos-grid">
          {productos
            .filter(p => p.categoria === categoriaSeleccionada)
            .map(producto => (
              <div key={producto.id} className="producto-card">
                <img src={producto.imagen} alt="" className="producto-img" />

                {editando?.id === producto.id ? (
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
                      type="number"
                      value={editando.precio}
                      onChange={e =>
                        setEditando({ ...editando, precio: Number(e.target.value) })
                      }
                    />

                    <input
                      className="producto-input"
                      type="number"
                      value={editando.stock}
                      onChange={e =>
                        setEditando({ ...editando, stock: Number(e.target.value) })
                      }
                    />

                    <button className="btn-guardar" onClick={guardarProducto}>
                      Guardar
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="producto-nombre">{producto.nombre}</h3>
                    <p className="producto-precio">${producto.precio}</p>
                    <p className="producto-stock">Stock: {producto.stock}</p>

                    <button
                      className="btn-editar"
                      onClick={() => setEditando(producto)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-borrar"
                      onClick={() => borrarProducto(producto.id)}
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
