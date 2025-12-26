import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/adminproducts.css";

export default function AdminProducts() {
  const [busqueda, setBusqueda] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);

  // ============================
  // MOCK DE PRODUCTOS
  // ============================
  const [productos, setProductos] = useState([
    {
      id: "P001",
      nombre: "Remera THE FATE OF OPHELIA",
      categoria: "Indumentaria",
      subcategoria: "Remeras",
      color: "Beige",
      colorHex: "#d8c7a1",
      precio: 35550,
      talles: {
        XS: 5,
        S: 8,
        M: 12,
        L: 4,
        XL: 0,
        XXL: 2,
        XXXL: 1,
      },
      imagenes: [
        "https://via.placeholder.com/80",
        "https://via.placeholder.com/80",
      ],
    },
    {
      id: "P002",
      nombre: "Buzo oversize beige SNOOPY",
      categoria: "Indumentaria",
      subcategoria: "Buzos",
      color: "Beige",
      colorHex: "#e4d3b5",
      precio: 59850,
      talles: {
        XS: 0,
        S: 3,
        M: 6,
        L: 10,
        XL: 4,
        XXL: 1,
        XXXL: 0,
      },
      imagenes: ["https://via.placeholder.com/80"],
    },
    {
      id: "P003",
      nombre: "Vaso térmico CUTE BEAR",
      categoria: "Cute Items",
      subcategoria: "Vasos",
      color: "Rosa pastel",
      colorHex: "#f7c6d0",
      precio: 18900,
      talles: {},
      imagenes: ["https://via.placeholder.com/80"],
    },
  ]);

  // ============================
  // FILTRADO
  // ============================
  const productosFiltrados = productos.filter((p) =>
    [p.nombre, p.categoria, p.subcategoria]
      .join(" ")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // ============================
  // ACCIONES
  // ============================
  function eliminarProducto(id) {
    if (confirm("¿Seguro que querés eliminar este producto?")) {
      setProductos((prev) => prev.filter((p) => p.id !== id));
    }
  }

  function duplicarProducto(prod) {
    const copia = {
      ...prod,
      id: "P" + Math.floor(Math.random() * 9000 + 1000),
      nombre: prod.nombre + " (copia)",
    };
    setProductos((prev) => [...prev, copia]);
  }

  function toggleExpand(id) {
    setExpandedRows((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Productos</h2>
      <p className="admin-section-text">
        Gestión de catálogo, precios, talles y fotos.
      </p>

      {/* ============================
          BUSCADOR
      ============================ */}
      <input
        type="text"
        placeholder="Buscar por nombre o categoría..."
        className="products-search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* ============================
          BOTÓN AGREGAR
      ============================ */}
      <div className="products-toolbar">
        <Link to="/admin/products/new" className="add-product-btn">
          + Agregar producto
        </Link>
      </div>

      {/* ============================
          TABLA
      ============================ */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Subcategoría</th>
              <th>Precio</th>
              <th>Stock total</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.map((prod) => {
              const stockTotal = Object.values(prod.talles).reduce(
                (acc, n) => acc + n,
                0
              );

              return (
                <>
                  <tr key={prod.id}>
                    <td className="prod-name-cell">

                      {/* ============================
                          MINIATURA + INFO
                      ============================ */}
                      <div className="prod-name-wrapper">
                        <img
                          src={prod.imagenes[0]}
                          alt={prod.nombre}
                          className="prod-thumb"
                        />

                        <div className="prod-name-text">
                          <span className="prod-title">{prod.nombre}</span>

                          <span className="prod-subinfo">
                            {prod.categoria} / {prod.subcategoria}
                          </span>

                          {/* COLOR */}
                          <div className="prod-color-row">
                            <span className="prod-color-label">Color:</span>
                            <span
                              className="prod-color-box"
                              style={{ backgroundColor: prod.colorHex }}
                            ></span>
                            <span className="prod-color-name">{prod.color}</span>
                          </div>
                        </div>
                      </div>

                      {/* BOTÓN DETALLES */}
                      <button
                        className="productos-toggle"
                        onClick={() => toggleExpand(prod.id)}
                      >
                        Ver detalles{" "}
                        <span
                          className={
                            expandedRows.includes(prod.id)
                              ? "flecha up"
                              : "flecha"
                          }
                        >
                          ▾
                        </span>
                      </button>
                    </td>

                    <td>{prod.categoria}</td>
                    <td>{prod.subcategoria}</td>
                    <td>${prod.precio.toLocaleString()}</td>
                    <td>{stockTotal}</td>

                    <td className="acciones-cell">
                      <Link
                        to={`/admin/products/${prod.id}`}
                        className="accion-btn editar"
                      >
                        ✏️
                      </Link>

                      <button
                        className="accion-btn duplicar"
                        onClick={() => duplicarProducto(prod)}
                      >
                        📄
                      </button>

                      <button
                        className="accion-btn eliminar"
                        onClick={() => eliminarProducto(prod.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>

                  {/* ============================
                      FILA EXPANDIDA
                  ============================ */}
                  {expandedRows.includes(prod.id) && (
                    <tr className="fila-expandida">
                      <td colSpan="6">
                        <div className="producto-detalle-grid">

                          {/* FOTOS */}
                          <div>
                            <h4 className="detalle-subtitle">Fotos</h4>
                            <div className="detalle-fotos">
                              {prod.imagenes.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="foto"
                                  className="detalle-foto"
                                />
                              ))}
                            </div>
                          </div>

                          {/* TALLES */}
                          <div>
                            <h4 className="detalle-subtitle">Talles</h4>
                            <ul className="detalle-talles">
                              {Object.entries(prod.talles).map(
                                ([talle, stock]) => (
                                  <li key={talle}>
                                    <strong>{talle}:</strong> {stock} unid.
                                  </li>
                                )
                              )}
                            </ul>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
