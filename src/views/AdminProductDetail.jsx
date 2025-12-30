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
    subcategoria: "Remeras",
    precio: "",
    color: "",
    imagenes: [],
    description: "",
  });

  const [colores, setColores] = useState([]);

  // Estados nuevos
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  // ============================
  // CARGAR COLORES
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
  // CARGAR PRODUCTO (EDICIÓN)
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
    if (campo === "categoria") {
      let sub = "";
      if (valor === "Indumentaria") sub = "Remeras";
      else if (valor === "Cute Items") sub = "Vasos";
      else if (valor === "Merch") sub = "Artistas nacionales";

      setProducto((prev) => ({
        ...prev,
        categoria: valor,
        subcategoria: sub,
      }));
    } else {
      setProducto((prev) => ({ ...prev, [campo]: valor }));
    }
  }

  // ============================
  // SUBIR IMAGEN (MEJORADO)
  // ============================
  async function agregarImagen(e) {
    const file = e.target.files[0];
    if (!file) return;

    setErrorImagen("");

    // Preview instantáneo
    const previewLocal = URL.createObjectURL(file);
    setProducto((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, previewLocal],
    }));

    setSubiendoImagen(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:5000/api/products/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen");

      const data = await res.json();

      // Reemplazar preview por URL real
      setProducto((prev) => {
        const sinPreview = prev.imagenes.filter((img) => img !== previewLocal);
        return {
          ...prev,
          imagenes: [...sinPreview, data.url],
        };
      });
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setErrorImagen("No se pudo subir la imagen. Probá de nuevo.");

      // Sacar preview si falló
      setProducto((prev) => ({
        ...prev,
        imagenes: prev.imagenes.filter((img) => img !== previewLocal),
      }));
    } finally {
      setSubiendoImagen(false);
    }

    e.target.value = "";
  }

  // ============================
  // ELIMINAR IMAGEN
  // ============================
  function eliminarImagen(index) {
    setProducto((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  }

  // ============================
  // ⭐ MARCAR COMO PRINCIPAL
  // ============================
  function marcarComoPrincipal(index) {
    const nuevas = [...producto.imagenes];
    const [img] = nuevas.splice(index, 1);
    nuevas.unshift(img);

    setProducto((prev) => ({
      ...prev,
      imagenes: nuevas,
    }));
  }

  // ============================
  // DRAG & DROP
  // ============================
  function onDragStart(e, index) {
    setDragIndex(index);
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function onDrop(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const nuevas = [...producto.imagenes];
    const [movida] = nuevas.splice(dragIndex, 1);
    nuevas.splice(index, 0, movida);

    setProducto((prev) => ({
      ...prev,
      imagenes: nuevas,
    }));

    setDragIndex(null);
  }

  // ============================
  // GUARDAR PRODUCTO
  // ============================
  async function guardarProducto() {
    const camposObligatorios = {
      nombre: producto.nombre,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      color: producto.color,
      precio: producto.precio,
    };

    const faltanCampos = Object.entries(camposObligatorios).some(
      ([_, valor]) => !valor || valor.toString().trim() === ""
    );

    const precioValido =
      !isNaN(parseInt(producto.precio, 10)) &&
      parseInt(producto.precio, 10) > 0;

    if (faltanCampos || !precioValido) {
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
  // ELIMINAR PRODUCTO
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
  // DUPLICAR PRODUCTO
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
        {esEdicion
          ? "Editar información del producto."
          : "Crear un nuevo producto."}
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

          {errorImagen && (
            <p className="input-error-text">{errorImagen}</p>
          )}

          <div className="fotos-grid">
            {producto.imagenes.map((img, i) => (
              <div
                key={i}
                className={`foto-item ${i === 0 ? "foto-principal" : ""}`}
                draggable
                onDragStart={(e) => onDragStart(e, i)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, i)}
              >
                {/* ⭐ BOTÓN PRINCIPAL */}
                <button
                  className="foto-star-btn"
                  onClick={() => marcarComoPrincipal(i)}
                  title="Marcar como principal"
                >
                  {i === 0 ? "⭐" : "☆"}
                </button>

                <img src={img} alt="foto" className="foto-preview" />

                <button
                  className="foto-delete-btn"
                  onClick={() => eliminarImagen(i)}
                >
                  ✕
                </button>
              </div>
            ))}

            <label
              className={`foto-upload ${subiendoImagen ? "foto-upload-disabled" : ""
                }`}
            >
              {subiendoImagen ? "Subiendo foto..." : "+ Agregar foto"}
              <input
                type="file"
                accept="image/*"
                onChange={agregarImagen}
                disabled={subiendoImagen}
              />
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
