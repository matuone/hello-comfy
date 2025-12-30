import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/adminproductdetail.css";

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  // ============================
  // ESTADO INICIAL
  // ============================
  const [producto, setProducto] = useState({
    nombre: "",
    categoria: "Indumentaria",
    subcategoria: "",
    precio: "",
    color: "",
    colorHex: "#cccccc",
    imagenes: [],
    description: "",
  });

  const [colores, setColores] = useState([]);

  // ============================
  // CARGAR COLORES DESDE BACKEND
  // ============================
  useEffect(() => {
    fetch("http://localhost:5000/api/stock")
      .then((res) => res.json())
      .then((data) => {
        const lista = data.map((c) => c.color);
        setColores(lista);
      })
      .catch((err) => console.error("Error cargando colores:", err));
  }, []);

  // ============================
  // CARGAR PRODUCTO (SOLO EDICIÓN)
  // ============================
  useEffect(() => {
    if (!esEdicion) return;

    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const categoriasValidas = ["Indumentaria", "Cute Items", "Merch"];
        let categoriaNormalizada = (data.category || "").trim();

        if (!categoriasValidas.includes(categoriaNormalizada)) {
          const lower = categoriaNormalizada.toLowerCase();
          if (lower === "indumentaria") categoriaNormalizada = "Indumentaria";
          else if (lower === "cute items") categoriaNormalizada = "Cute Items";
          else if (lower === "merch") categoriaNormalizada = "Merch";
          else categoriaNormalizada = "Indumentaria";
        }

        setProducto({
          nombre: data.name,
          categoria: categoriaNormalizada,
          subcategoria: data.subcategory || "",
          precio: data.price,
          color: data.colors?.[0] || "",
          colorHex: "#cccccc",
          imagenes: data.images || [],
          description: data.description || "",
        });
      })
      .catch((err) => console.error("Error cargando producto:", err));
  }, [esEdicion, id]);

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

  // ============================
  // GUARDAR (POST o PUT)
  // ============================
  async function guardarProducto() {
    if (
      !producto.nombre.trim() ||
      !producto.categoria.trim() ||
      !producto.subcategoria.trim() ||
      !producto.color.trim() ||
      !producto.precio.toString().trim() ||
      Number(producto.precio) <= 0
    ) {
      alert("Completá todos los campos obligatorios antes de guardar.");
      return;
    }

    const payload = {
      name: producto.nombre.trim(),
      category: producto.categoria.trim(),
      subcategory: producto.subcategoria.trim(),
      price: Number(producto.precio),
      colors: [producto.color.trim()],
      images: producto.imagenes || [],
      description: producto.description || "",
    };

    try {
      const url = esEdicion
        ? `http://localhost:5000/api/products/${id}`
        : `http://localhost:5000/api/products`;

      const method = esEdicion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar");

      alert(esEdicion ? "Producto actualizado" : "Producto creado");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al guardar el producto");
    }
  }

  // ============================
  // ELIMINAR
  // ============================
  async function eliminarProducto() {
    if (!esEdicion) return;
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      alert("Producto eliminado");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el producto");
    }
  }

  // ============================
  // DUPLICAR
  // ============================
  async function duplicarProducto() {
    if (!esEdicion) return;

    const payload = {
      name: producto.nombre + " (copia)",
      category: producto.categoria,
      subcategory: producto.subcategoria || "",
      price: Number(producto.precio) || 0,
      colors: producto.color ? [producto.color.trim()] : [],
      images: producto.imagenes,
      description: producto.description,
    };

    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al duplicar");

      alert("Producto duplicado");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("No se pudo duplicar el producto");
    }
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="admin-section">
      <h2 className="admin-section-title">
        {esEdicion ? `Producto ${id}` : "Nuevo producto"}
      </h2>
      <p className="admin-section-text">
        {esEdicion ? "Editar información del producto." : "Crear un nuevo producto."}
      </p>

      {/* BOTONES SUPERIORES */}
      <div className="product-actions">
        {esEdicion && (
          <>
            <button className="btn-duplicar" onClick={duplicarProducto}>
              Duplicar
            </button>
            <button className="btn-eliminar" onClick={eliminarProducto}>
              Eliminar
            </button>
          </>
        )}
      </div>

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

          {/* SELECTOR DE COLOR DESDE BACKEND */}
          <label className="input-label">Color</label>
          <select
            className="input-field"
            value={producto.color}
            onChange={(e) => actualizarCampo("color", e.target.value)}
          >
            <option value="">Seleccionar color</option>
            {colores.map((color, i) => (
              <option key={i} value={color}>
                {color}
              </option>
            ))}
          </select>

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
            onChange={(e) => actualizarCampo("precio", e.target.value)}
            placeholder="Ingresar precio"
          />
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

        {/* BOTÓN GUARDAR */}
        <button className="btn-guardar" onClick={guardarProducto}>
          {esEdicion ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </div>
  );
}
