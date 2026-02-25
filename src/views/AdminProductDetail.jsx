
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Notification from "../components/Notification";
import "../styles/adminproductdetail.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

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
    subcategoria: "",  // ⭐ CAMBIO: Vacía inicialmente para que el usuario seleccione dinámicamente
    precio: "",
    stockColorId: "",
    imagenes: [],
    description: "",
    cardDescription: "", // ⭐ NUEVO (para cards)
    sizeGuide: "remeras",
    weight: "",
    dimHeight: "",
    dimWidth: "",
    dimLength: "",
  });

  const [colores, setColores] = useState([]);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [errores, setErrores] = useState({});
  const [noti, setNoti] = useState(null);
  const [sizeTables, setSizeTables] = useState([]);
  const [groupedSubcategories, setGroupedSubcategories] = useState({}); // ⭐ NUEVO: subcategorías dinámicas

  const loadingGlobal = subiendoImagen;

  // ============================
  // CARGAR SUBCATEGORÍAS DINÁMICAMENTE
  // ============================
  useEffect(() => {
    fetch(apiPath("/products/filters/data"))
      .then((res) => res.json())
      .then((data) => {
        setGroupedSubcategories(data.groupedSubcategories || {});
      })
      .catch((err) => console.error("Error cargando subcategorías:", err));
  }, []);
  useEffect(() => {
    fetch(apiPath("/sizetables"))
      .then((res) => res.json())
      .then((data) => {
        setSizeTables(data);
      })
      .catch((err) => console.error("Error cargando tablas de talles:", err));
  }, []);

  // ============================
  // CARGAR COLORES (StockColor)
  // ============================
  useEffect(() => {
    fetch(apiPath("/stock"))
      .then((res) => res.json())
      .then((data) => {
        setColores(data);
      })
      .catch((err) => console.error("Error cargando colores:", err));
  }, []);

  // ============================
  // CARGAR PRODUCTO (EDICIÓN)
  // ============================
  useEffect(() => {
    if (!esEdicion) return;

    fetch(apiPath(`/products/${id}`))
      .then((res) => res.json())
      .then((data) => {
        const categoriasValidas = ["Indumentaria", "Cute items", "Merch"]; // ⭐ ARREGLADO: "Cute items" con i minúscula
        let categoriaNormalizada = (data.category || "").trim();

        if (!categoriasValidas.includes(categoriaNormalizada)) {
          const lower = categoriaNormalizada.toLowerCase();
          if (lower === "indumentaria") categoriaNormalizada = "Indumentaria";
          else if (lower === "cute items" || lower === "cute items") categoriaNormalizada = "Cute items"; // ⭐ ARREGLADO
          else if (lower === "merch") categoriaNormalizada = "Merch";
          else categoriaNormalizada = "Indumentaria";
        }

        setProducto({
          nombre: data.name,
          categoria: categoriaNormalizada,
          subcategoria: data.subcategory || "",
          precio: data.price,
          stockColorId: data.stockColorId?._id || "",
          imagenes: data.images || [],
          description: data.description || "",
          cardDescription: data.cardDescription || "", // ⭐ NUEVO
          sizeGuide: data.sizeGuide || "remeras",
          weight: data.weight || "",
          dimHeight: data.dimensions?.height || "",
          dimWidth: data.dimensions?.width || "",
          dimLength: data.dimensions?.length || "",
        });
      })
      .catch((err) => console.error("Error cargando producto:", err));
  }, [esEdicion, id]);

  // ============================
  // VALIDACIÓN
  // ============================
  function validarProducto() {
    const nuevosErrores = {};

    if (!producto.nombre.trim() || producto.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    if (!producto.categoria) {
      nuevosErrores.categoria = "Seleccioná una categoría.";
    }

    if (!producto.subcategoria) {
      nuevosErrores.subcategoria = "Seleccioná una subcategoría.";
    }

    if (!producto.stockColorId) {
      nuevosErrores.color = "Seleccioná un color real.";
    }

    if (!producto.precio || Number(producto.precio) <= 0) {
      nuevosErrores.precio = "Ingresá un precio válido.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  // ============================
  // HANDLERS GENERALES
  // ============================
  function actualizarCampo(campo, valor) {
    setErrores((prev) => ({ ...prev, [campo]: "" }));

    if (campo === "categoria") {
      // Cuando cambias de categoría, queremos que el usuario seleccione una subcategoría explícitamente
      // Solo sugerimos la primera disponible si la subcategoría actual no es válida
      const subsDisponibles = groupedSubcategories[valor] || [];
      let nuevaSub = producto.subcategoria;

      // Si la subcategoría actual no existe en la nueva categoría, limpiamos
      if (!subsDisponibles.includes(producto.subcategoria)) {
        nuevaSub = "";
      }

      setProducto((prev) => ({
        ...prev,
        categoria: valor,
        subcategoria: nuevaSub,
      }));
    } else {
      setProducto((prev) => ({ ...prev, [campo]: valor }));
    }
  }

  // ============================
  // SUBIR IMAGEN
  // ============================
  async function agregarImagen(e) {
    const file = e.target.files[0];
    if (!file) return;

    setErrorImagen("");

    const previewLocal = URL.createObjectURL(file);
    setProducto((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, previewLocal],
    }));

    setSubiendoImagen(true);

    try {
      const opciones = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
      };

      const archivoComprimido = await imageCompression(file, opciones);

      const formData = new FormData();
      formData.append("images", archivoComprimido);

      const res = await fetch(apiPath("/products/upload"), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen");

      const data = await res.json();
      const urlSubida = data.urls?.[0];

      if (!urlSubida) throw new Error("Respuesta inválida");

      setProducto((prev) => {
        const sinPreview = prev.imagenes.filter((img) => img !== previewLocal);
        return {
          ...prev,
          imagenes: [...sinPreview, urlSubida],
        };
      });
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setErrorImagen("No se pudo subir la imagen. Probá de nuevo.");

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
  // MARCAR COMO PRINCIPAL
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
    e.currentTarget.classList.add("dragging");
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function onDrop(e, index) {
    e.preventDefault();

    const draggingEl = document.querySelector(".dragging");
    if (draggingEl) draggingEl.classList.remove("dragging");

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
    if (loadingGlobal) {
      setNoti({
        mensaje: "Esperá a que terminen de subir las imágenes.",
        tipo: "error",
      });
      return;
    }

    if (!validarProducto()) return;

    const payload = {
      name: producto.nombre.trim(),
      category: producto.categoria.trim(),
      subcategory: producto.subcategoria.trim(),
      price: Number(producto.precio),
      stockColorId: producto.stockColorId,
      images: producto.imagenes || [],
      description: producto.description || "",
      cardDescription: producto.cardDescription || "", // ⭐ NUEVO
      sizeGuide: producto.sizeGuide,
      weight: producto.weight ? Number(producto.weight) : 0,
      dimensions: {
        height: producto.dimHeight ? Number(producto.dimHeight) : 0,
        width: producto.dimWidth ? Number(producto.dimWidth) : 0,
        length: producto.dimLength ? Number(producto.dimLength) : 0,
      },
    };

    try {
      const url = esEdicion
        ? apiPath(`/products/${id}`)
        : apiPath("/products");
      const method = esEdicion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar");

      navigate("/admin/products", {
        state: {
          noti: {
            mensaje: esEdicion ? "Producto actualizado" : "Producto creado",
            tipo: "exito",
          },
        },
      });
    } catch (err) {
      console.error(err);
      setNoti({
        mensaje: "Hubo un error al guardar el producto",
        tipo: "error",
      });
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
      stockColorId: producto.stockColorId,
      images: producto.imagenes,
      description: producto.description,
      cardDescription: producto.cardDescription || "", // ⭐ NUEVO
      sizeGuide: producto.sizeGuide,
      weight: producto.weight ? Number(producto.weight) : 0,
      dimensions: {
        height: producto.dimHeight ? Number(producto.dimHeight) : 0,
        width: producto.dimWidth ? Number(producto.dimWidth) : 0,
        length: producto.dimLength ? Number(producto.dimLength) : 0,
      },
    };

    try {
      const res = await fetch(apiPath("/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al duplicar");

      setNoti({
        mensaje: "Producto duplicado",
        tipo: "exito",
      });

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setNoti({
        mensaje: "No se pudo duplicar el producto",
        tipo: "error",
      });
    }
  }

  // ============================
  // ELIMINAR PRODUCTO
  // ============================
  async function eliminarProducto() {
    if (!esEdicion) return;

    if (!confirm("¿Seguro que querés eliminar este producto?")) return;

    try {
      const res = await fetch(apiPath(`/products/${id}`), {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");

      setNoti({
        mensaje: "Producto eliminado",
        tipo: "exito",
      });

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setNoti({
        mensaje: "No se pudo eliminar el producto",
        tipo: "error",
      });
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

          {/* NOMBRE */}
          <label className="input-label">Nombre</label>
          <input
            type="text"
            className={`input-field ${errores.nombre ? "input-error" : ""}`}
            value={producto.nombre}
            onChange={(e) => actualizarCampo("nombre", e.target.value)}
          />
          {errores.nombre && (
            <p className="input-error-text">{errores.nombre}</p>
          )}

          {/* CATEGORÍA */}
          <label className="input-label">Categoría</label>
          <select
            className={`input-field ${errores.categoria ? "input-error" : ""}`}
            value={producto.categoria}
            onChange={(e) => actualizarCampo("categoria", e.target.value)}
          >
            <option>Indumentaria</option>
            <option>Cute items</option>
            <option>Merch</option>
          </select>
          {errores.categoria && (
            <p className="input-error-text">{errores.categoria}</p>
          )}

          {/* SUBCATEGORÍA */}
          <label className="input-label">Subcategoría</label>
          <select
            className={`input-field ${errores.subcategoria ? "input-error" : ""}`}
            value={producto.subcategoria}
            onChange={(e) => actualizarCampo("subcategoria", e.target.value)}
          >
            <option value="">Seleccionar subcategoría...</option>
            {(groupedSubcategories[producto.categoria] || []).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          {errores.subcategoria && (
            <p className="input-error-text">{errores.subcategoria}</p>
          )}

          {/* COLOR REAL */}
          <label className="input-label">Color real (StockColor)</label>
          <select
            className={`input-field ${errores.color ? "input-error" : ""}`}
            value={producto.stockColorId}
            onChange={(e) => actualizarCampo("stockColorId", e.target.value)}
          >
            <option value="">Seleccionar color…</option>
            {colores.map((c) => (
              <option key={c._id} value={c._id}>
                {c.color} — {c.colorHex}
              </option>
            ))}
          </select>
          {errores.color && (
            <p className="input-error-text">{errores.color}</p>
          )}

          {/* PRECIO */}
          <label className="input-label">Precio</label>
          <input
            type="number"
            className={`input-field ${errores.precio ? "input-error" : ""}`}
            value={producto.precio}
            onChange={(e) => actualizarCampo("precio", e.target.value)}
            placeholder="Ingresar precio"
          />
          {errores.precio && (
            <p className="input-error-text">{errores.precio}</p>
          )}

          {/* DESCRIPCIÓN CORTA (cards) */}
          <label className="input-label">Descripción corta (para cards)</label>
          <textarea
            className="input-field textarea-field"
            value={producto.cardDescription}
            onChange={(e) => actualizarCampo("cardDescription", e.target.value)}
            placeholder="Texto breve para mostrar en las cards..."
          />

          {/* DESCRIPCIÓN LARGA */}
          <label className="input-label">Descripción larga</label>
          <ReactQuill
            theme="snow"
            value={producto.description || ""}
            onChange={(value) => actualizarCampo("description", value)}
            placeholder="Descripción detallada del producto..."
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["clean"],
              ],
            }}
          />

          {/* PESO Y DIMENSIONES (ENVÍO) */}
          <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#555', fontSize: '14px', fontWeight: 600 }}>📦 Envío — Peso y dimensiones</h4>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', maxWidth: '520px' }}>
            <div>
              <label className="input-label">Peso (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={producto.weight}
                onChange={(e) => actualizarCampo("weight", e.target.value)}
                placeholder="0.3"
              />
            </div>
            <div>
              <label className="input-label">Alto (cm)</label>
              <input
                type="number"
                step="1"
                min="0"
                className="input-field"
                value={producto.dimHeight}
                onChange={(e) => actualizarCampo("dimHeight", e.target.value)}
                placeholder="5"
              />
            </div>
            <div>
              <label className="input-label">Ancho (cm)</label>
              <input
                type="number"
                step="1"
                min="0"
                className="input-field"
                value={producto.dimWidth}
                onChange={(e) => actualizarCampo("dimWidth", e.target.value)}
                placeholder="20"
              />
            </div>
            <div>
              <label className="input-label">Largo (cm)</label>
              <input
                type="number"
                step="1"
                min="0"
                className="input-field"
                value={producto.dimLength}
                onChange={(e) => actualizarCampo("dimLength", e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          {/* GUIA DE TALLES */}
          <label className="input-label">Guía de talles</label>
          <select
            className="input-field"
            value={producto.sizeGuide}
            onChange={(e) => actualizarCampo("sizeGuide", e.target.value)}
          >
            <option value="none">Sin tabla</option>
            {sizeTables.map((table) => (
              <option key={table._id} value={table.name}>
                {table.displayName}
              </option>
            ))}
          </select>
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
        <button
          className={`btn-guardar ${loadingGlobal ? "btn-guardar-disabled" : ""
            }`}
          onClick={guardarProducto}
          disabled={loadingGlobal}
        >
          {loadingGlobal
            ? "Esperando imágenes..."
            : esEdicion
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
      </div>

      {/* NOTIFICACIÓN */}
      {noti && (
        <Notification
          mensaje={noti.mensaje}
          tipo={noti.tipo}
          onClose={() => setNoti(null)}
        />
      )}
    </div>
  );
}
