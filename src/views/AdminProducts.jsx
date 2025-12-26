import { useState } from "react";
import { Link } from "react-router-dom";
import { stockGeneral } from "../data/stockData";
import "../styles/adminproducts.css";

export default function AdminProducts() {
  const [busqueda, setBusqueda] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);

  // ============================
  // MODIFICACIÓN MASIVA DE PRECIOS
  // ============================
  const [mostrarPanelPrecios, setMostrarPanelPrecios] = useState(false);
  const [porcentaje, setPorcentaje] = useState("");

  function aplicarAumento() {
    const p = Number(porcentaje);

    if (isNaN(p) || p === 0) {
      alert("Ingresá un porcentaje válido.");
      return;
    }

    setProductos(prev =>
      prev.map(prod => ({
        ...prod,
        precio: Math.round(prod.precio * (1 + p / 100))
      }))
    );

    setMostrarPanelPrecios(false);
    setPorcentaje("");

    alert(`Precios actualizados con un aumento del ${p}%`);
  }

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
          TOOLBAR
      ============================ */}
      <div className="products-toolbar">

        {/* BOTÓN MODIFICAR PRECIOS */}
        <button
          className="mass-price-btn"
          onClick={() => setMostrarPanelPrecios(true)}
        >
          Modificar precios
        </button>

        <Link to="/admin/products/new" className="add-product-btn">
          + Agregar producto
        </Link>
      </div>

      {/* ============================
          PANEL DE MODIFICACIÓN MASIVA
      ============================ */}
      {mostrarPanelPrecios && (
        <div className="mass-price-panel">
          <h4>Modificar precios masivamente</h4>

          <label className="mass-price-label">Aumento (%)</label>
          <input
            type="number"
            className="mass-price-input"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            placeholder="Ej: 15"
          />

          <div className="mass-price-actions">
            <button className="mass-price-apply" onClick={aplicarAumento}>
              Aplicar aumento
            </button>

            <button
              className="mass-price-cancel"
              onClick={() => setMostrarPanelPrecios(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
              // ============================
              // STOCK REAL SEGÚN COLOR
              // ============================
              const stockColor = stockGeneral.find(
                (s) => s.color === prod.color
              );

              const stockTotal = stockColor
                ? Object.values(stockColor.talles).reduce((a, b) => a + b, 0)
                : 0;

              return (
                <>
                  <tr key={prod.id}>
                    <td className="prod-name-cell">

                      {/* MINIATURA + INFO */}
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

                          {/* TALLES (STOCK REAL) */}
                          <div>
                            <h4 className="detalle-subtitle">Talles</h4>

                            {stockColor ? (
                              <ul className="detalle-talles">
                                {Object.entries(stockColor.talles).map(
                                  ([talle, stock]) => (
                                    <li key={talle}>
                                      <strong>{talle}:</strong> {stock} unid.
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p>No hay stock para este color.</p>
                            )}
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
