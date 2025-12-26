import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/adminproductdetail.css";

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const ORDEN_TALLES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  const [producto, setProducto] = useState({
    id,
    nombre: "Remera THE FATE OF OPHELIA",
    categoria: "Indumentaria",
    subcategoria: "Remeras",
    precio: 35550,
    color: "Beige",
    colorHex: "#d8c7a1",
    talles: {
      XS: 5,
      S: 8,
      M: 12,
      L: 4,
      XL: 0,
      XXL: 2,
      "3XL": 1,
    },
    imagenes: [
      "https://via.placeholder.com/120",
      "https://via.placeholder.com/120",
    ],
  });

  const [tallesActivos, setTallesActivos] = useState(
    ORDEN_TALLES.filter((t) => producto.talles[t] !== undefined)
  );

  function toggleTalleActivo(talle) {
    setTallesActivos((prev) =>
      prev.includes(talle)
        ? prev.filter((t) => t !== talle)
        : [...prev, talle]
    );
  }

  function actualizarCampo(campo, valor) {
    setProducto((prev) => ({ ...prev, [campo]: valor }));
  }

  function actualizarTalle(talle, valor) {
    setProducto((prev) => ({
      ...prev,
      talles: { ...prev.talles, [talle]: Number(valor) },
    }));
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

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Producto {producto.id}</h2>
      <p className="admin-section-text">Editar información del producto.</p>

      <div className="product-actions">
        <button className="btn-duplicar" onClick={duplicarProducto}>
          Duplicar
        </button>
        <button className="btn-eliminar" onClick={eliminarProducto}>
          Eliminar
        </button>
      </div>

      {/* ============================
          COLUMNAS ALINEADAS
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

        {/* TALLES */}
        <div className="detalle-box">
          <h3 className="detalle-title">Talles y stock</h3>

          <div className="talles-selector">
            {ORDEN_TALLES.map((t) => (
              <button
                key={t}
                className={
                  tallesActivos.includes(t)
                    ? "talle-chip talle-chip--active"
                    : "talle-chip"
                }
                onClick={() => toggleTalleActivo(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="talles-grid">
            {tallesActivos.map((talle) => (
              <div key={talle} className="talle-item">
                <label>{talle}</label>
                <input
                  type="number"
                  className="input-field"
                  value={producto.talles[talle] ?? 0}
                  onChange={(e) => actualizarTalle(talle, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* FOTOS */}
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

        <button className="btn-guardar" onClick={guardarProducto}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
