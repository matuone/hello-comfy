
import { useState, useEffect, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import Notification from "../components/Notification";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/adminproducts.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

const ORDEN_TALLES = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function AdminProducts() {
  const [busqueda, setBusqueda] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mostrarPanelPrecios, setMostrarPanelPrecios] = useState(false);
  const [porcentaje, setPorcentaje] = useState("");

  // ============================
  // NOTIFICACIÓN
  // ============================
  const location = useLocation();
  const notiInicial = location.state?.noti || null;
  const [noti, setNoti] = useState(notiInicial);

  // ============================
  // MODAL ELIMINAR
  // ============================
  const [modalEliminar, setModalEliminar] = useState(null);

  // ============================
  // CARGAR PRODUCTOS
  // ============================
  useEffect(() => {
    fetch(apiPath("/products"))
      .then((res) => res.json())
      .then((data) => {
        const adaptados = data.map((p) => ({
          id: p._id,
          nombre: p.name,
          categoria: p.category,
          subcategoria: p.subcategory,
          precio: p.price,
          imagenes: p.images,
          color: p.stockColorId?.color || "Sin color",
          colorHex: p.stockColorId?.colorHex || "#ccc",
          stock: p.stockColorId?.talles || {},
          stockColorId: p.stockColorId?._id || null,
        }));

        setProductos(adaptados);
      })
      .catch((err) => console.error("Error al cargar productos:", err));
  }, []);

  // ============================
  // MODIFICACIÓN MASIVA DE PRECIOS
  // ============================
  function aplicarAumento() {
    const p = Number(porcentaje);
    if (isNaN(p) || p === 0) {
      setNoti({ mensaje: "Ingresá un porcentaje válido.", tipo: "error" });
      return;
    }

    setProductos((prev) =>
      prev.map((prod) => ({
        ...prod,
        precio: Math.round(prod.precio * (1 + p / 100)),
      }))
    );

    setMostrarPanelPrecios(false);
    setPorcentaje("");

    setNoti({
      mensaje: `Precios actualizados con un aumento del ${p}%`,
      tipo: "exito",
    });
  }

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
  // ELIMINAR
  // ============================
  function eliminarProducto(id) {
    setModalEliminar(id);
  }

  async function confirmarEliminacion() {
    const id = modalEliminar;
    setModalEliminar(null);

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      setProductos((prev) => prev.filter((p) => p.id !== id));

      setNoti({
        mensaje: "Producto eliminado",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setNoti({
        mensaje: "No se pudo eliminar el producto",
        tipo: "error",
      });
    }
  }

  // ============================
  // DUPLICAR PRODUCTO (desde la tabla, usando datos completos)
  // ============================
  async function duplicarProducto(prod) {
    try {
      // 1) Traer el producto completo desde el backend (con descripción, sizeGuide y stockColorId correcto)
      const detalleRes = await fetch(
        `http://localhost:5000/api/products/${prod.id}`
      );

      if (!detalleRes.ok) {
        console.error("Error al obtener producto original para duplicar");
        setNoti({
          mensaje: "No se pudo obtener el producto original para duplicar",
          tipo: "error",
        });
        return;
      }

      const original = await detalleRes.json();

      // stockColorId puede venir como objeto (populate) o como string (id)
      const stockColorId =
        original.stockColorId?._id || original.stockColorId || prod.stockColorId;

      // 2) Armar el payload con TODOS los datos necesarios
      const payload = {
        name: (original.name || prod.nombre) + " (copia)",
        category: original.category || prod.categoria,
        subcategory: original.subcategory || prod.subcategoria || "",
        price: Number(original.price ?? prod.precio) || 0,
        images: original.images && original.images.length > 0
          ? original.images
          : prod.imagenes,
        stockColorId, // 👈 MISMO STOCK REAL
        description: original.description || "",
        sizeGuide: original.sizeGuide || "remeras",
      };

      // 3) Crear el nuevo producto
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const saved = await res.json();

      if (!res.ok) {
        console.error("Error al duplicar:", saved);
        setNoti({
          mensaje: "No se pudo duplicar el producto",
          tipo: "error",
        });
        return;
      }

      // 4) Adaptar para la tabla.
      // OJO: el backend puede NO devolver stockColorId populado,
      // así que usamos el original como fallback para color / stock.
      const adaptado = {
        id: saved._id,
        nombre: saved.name,
        categoria: saved.category,
        subcategoria: saved.subcategory,
        precio: saved.price,
        imagenes: saved.images,
        color:
          saved.stockColorId?.color ||
          original.stockColorId?.color ||
          prod.color ||
          "Sin color",
        colorHex:
          saved.stockColorId?.colorHex ||
          original.stockColorId?.colorHex ||
          prod.colorHex ||
          "#ccc",
        stock:
          saved.stockColorId?.talles ||
          original.stockColorId?.talles ||
          prod.stock ||
          {},
        stockColorId:
          saved.stockColorId?._id ||
          original.stockColorId?._id ||
          stockColorId ||
          null,
      };

      setProductos((prev) => [adaptado, ...prev]);

      setNoti({
        mensaje: "Producto duplicado correctamente",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error duplicando producto:", err);
      setNoti({
        mensaje: "Error duplicando producto",
        tipo: "error",
      });
    }
  }

  // ============================
  // EXPANDIR FILA
  // ============================
  function toggleExpand(id) {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Productos</h2>
      <p className="admin-section-text">
        Gestión de catálogo, precios, talles y fotos.
      </p>

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar por nombre o categoría..."
        className="products-search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* TOOLBAR */}
      <div className="products-toolbar">
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

      {/* PANEL DE MODIFICACIÓN MASIVA */}
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

      {/* TABLA */}
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
              const stockTotal = prod.stock
                ? Object.values(prod.stock).reduce((a, b) => a + b, 0)
                : 0;

              return (
                <Fragment key={prod.id}>
                  <tr>
                    <td className="prod-name-cell">
                      <div className="prod-name-wrapper">
                        <img
                          src={
                            prod.imagenes?.[0] ||
                            "https://via.placeholder.com/80"
                          }
                          alt={prod.nombre}
                          className="prod-thumb"
                        />

                        <div className="prod-name-text">
                          <span className="prod-title">{prod.nombre}</span>

                          <span className="prod-subinfo">
                            {prod.categoria} / {prod.subcategoria}
                          </span>

                          <div className="prod-color-row">
                            <span className="prod-color-label">Color:</span>
                            <span
                              className="prod-color-box"
                              style={{ backgroundColor: prod.colorHex }}
                            ></span>
                            <span className="prod-color-name">
                              {prod.color}
                            </span>
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
                    <td>${prod.precio?.toLocaleString()}</td>

                    <td>
                      {prod.stock ? (
                        <>
                          {ORDEN_TALLES.map((talle) => (
                            <span key={talle} style={{ marginRight: "6px" }}>
                              {talle}: {prod.stock[talle] ?? 0}
                            </span>
                          ))}
                          <br />
                          <strong>Total:</strong> {stockTotal}
                        </>
                      ) : (
                        <>
                          Sin stock
                          <br />
                          <strong>Total:</strong> 0
                        </>
                      )}
                    </td>

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

                  {/* FILA EXPANDIDA */}
                  {expandedRows.includes(prod.id) && (
                    <tr className="fila-expandida">
                      <td colSpan="6">
                        <div className="producto-detalle-grid">
                          <div>
                            <h4 className="detalle-subtitle">Fotos</h4>
                            <div className="detalle-fotos">
                              {prod.imagenes?.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="foto"
                                  className="detalle-foto"
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="detalle-subtitle">Talles</h4>

                            {prod.stock ? (
                              <ul className="detalle-talles">
                                {Object.entries(prod.stock).map(
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
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* NOTIFICACIÓN */}
      {noti && (
        <Notification
          mensaje={noti.mensaje}
          tipo={noti.tipo}
          onClose={() => setNoti(null)}
        />
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminar && (
        <ConfirmModal
          titulo="Eliminar producto"
          mensaje="¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={confirmarEliminacion}
          onCancel={() => setModalEliminar(null)}
        />
      )}
    </div>
  );
}
