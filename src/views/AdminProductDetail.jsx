import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { stockGeneral } from "../data/stockData"; // 👈 STOCK REAL
import "../styles/adminproductdetail.css";

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ============================
  // MOCK DE PRODUCTO
  // ============================
  const [producto, setProducto] = useState({
    id,
    nombre: "Remera THE FATE OF OPHELIA",
    categoria: "Indumentaria",
    subcategoria: "Remeras",
    precio: 35550,
    color: "Beige",
    colorHex: "#d8c7a1",
    imagenes: [
      "https://via.placeholder.com/120",
      "https://via.placeholder.com/120",
    ],
  });

  // ============================
  // HANDLERS
  // ============================
  function actualizarCampo(campo, valor) {
    setProducto((prev) => ({ ...prev, [campo]: valor }));
  }

  function agregarImagen(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setProducto((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, url],
    }));
  }

  function eliminarImagen(index) {
    setProducto((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  }

  function guardarProducto() {
    alert("Producto guardado (cuando haya backend se enviará)");
  }

  function eliminarProducto() {
    if (confirm("¿Seguro que querés eliminar este producto?")) {
      alert("Producto eliminado");
      navigate("/admin/products");
    }
  }

  function duplicarProducto() {
    alert("Producto duplicado (cuando haya backend se creará una copia)");
  }

  // ============================
  // STOCK REAL SEGÚN COLOR
  // ============================
  const stockColor = stockGeneral.find(
    (s) => s.color === producto.color
  );

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Producto {producto.id}</h2>
      <p className="admin-section-text">Editar información del producto.</p>

      {/* ============================
          BOTONES SUPERIORES
      ============================ */}
      <div className="product-actions">
        <button className="btn-duplicar" onClick={duplicarProducto}>
          Duplicar
        </button>
        <button className="btn-eliminar" onClick={eliminarProducto}>
          Eliminar
        </button>
      </div>

      {/* ============================
          CONTENEDOR EN COLUMNA
      ============================ */}
      <div className="product-column">

        {/* DATOS GENERALES */}
        <div className="detalle-box">
          <h3 className="detalle-title">Datos generales</h3>

          <label className="input-label">Nombre</label>
          <input
            type="text"
            className="input-field"
            value={producto.nombre}
            onChange={(e) => actualizarCampo("nombre", e.target.value)}
          />

          <label className="input-label">Categoría</label>
          <select
            className="input-field"
            value={producto.categoria}
            onChange={(e) => actualizarCampo("categoria", e.target.value)}
          >
            <option>Indumentaria</option>
            <option>Cute Items</option>
            <option>Merch</option>
          </select>

          <label className="input-label">Subcategoría</label>
          <select
            className="input-field"
            value={producto.subcategoria}
            onChange={(e) => actualizarCampo("subcategoria", e.target.value)}
          >
            {producto.categoria === "Indumentaria" && (
              <>
                <option>Remeras</option>
                <option>Buzos</option>
                <option>Pijamas</option>
                <option>Shorts</option>
                <option>Totes</option>
                <option>Outlet</option>
              </>
            )}

            {producto.categoria === "Cute Items" && <option>Vasos</option>}

            {producto.categoria === "Merch" && (
              <>
                <option>Artistas nacionales</option>
                <option>Artistas internacionales</option>
              </>
            )}
          </select>

          <label className="input-label">Color (nombre)</label>
          <input
            type="text"
            className="input-field"
            value={producto.color}
            onChange={(e) => actualizarCampo("color", e.target.value)}
          />

          <label className="input-label">Color (visual)</label>
          <div className="color-row">
            <input
              type="color"
              className="color-picker"
              value={producto.colorHex}
              onChange={(e) => actualizarCampo("colorHex", e.target.value)}
            />

            <div
              className="color-preview"
              style={{ backgroundColor: producto.colorHex }}
            ></div>
          </div>

          <label className="input-label">Precio</label>
          <input
            type="number"
            className="input-field"
            value={producto.precio}
            onChange={(e) => actualizarCampo("precio", Number(e.target.value))}
          />
        </div>

        {/* ============================
            STOCK REAL
        ============================ */}
        <div className="detalle-box">
          <h3 className="detalle-title">Stock real</h3>

          {stockColor ? (
            <ul className="detalle-talles">
              {Object.entries(stockColor.talles).map(([talle, cant]) => (
                <li key={talle}>
                  <strong>{talle}:</strong> {cant} unidades
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay stock para este color.</p>
          )}
        </div>

        {/* ============================
            FOTOS
        ============================ */}
        <div className="detalle-box">
          <h3 className="detalle-title">Fotos</h3>

          <div className="fotos-grid">
            {producto.imagenes.map((img, i) => (
              <div key={i} className="foto-item">
                <img src={img} alt="foto" className="foto-preview" />
                <button
                  className="foto-delete-btn"
                  onClick={() => eliminarImagen(i)}
                >
                  ✕
                </button>
              </div>
            ))}

            <label className="foto-upload">
              + Agregar foto
              <input type="file" accept="image/*" onChange={agregarImagen} />
            </label>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <button className="btn-guardar" onClick={guardarProducto}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
