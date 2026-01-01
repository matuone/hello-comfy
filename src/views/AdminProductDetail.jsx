import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import Notification from "../components/Notification";
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
    sizeGuide: "remeras",
  });

  const [colores, setColores] = useState([]);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [errores, setErrores] = useState({});
  const [noti, setNoti] = useState(null);

  const loadingGlobal = subiendoImagen;

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
          sizeGuide: data.sizeGuide || "remeras",
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

    if (!producto.color) {
      nuevosErrores.color = "Seleccioná un color.";
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
  // SUBIR IMAGEN (CON COMPRESIÓN + CLOUDINARY)
  // ============================
  async function agregarImagen(e) {
    const file = e.target.files[0];
    if (!file) return;

    setErrorImagen("");

    // Preview instantáneo local
    const previewLocal = URL.createObjectURL(file);
    setProducto((prev) => ({
      ...prev,
      imagenes: [...prev.imagenes, previewLocal],
    }));

    setSubiendoImagen(true);

    try {
      const opciones = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1400,
        useWebWorker: true,
      };

      const archivoComprimido = await imageCompression(file, opciones);

      const formData = new FormData();
      // 👇 nombre de campo alineado con upload.array("images", 10)
      formData.append("images", archivoComprimido);

      const res = await fetch("http://localhost:5000/api/products/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen");

      const data = await res.json();

      // backend devuelve { urls: [...] }
      const urlSubida = data.urls?.[0];

      if (!urlSubida) {
        throw new Error("Respuesta de subida sin URL válida");
      }

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

      // saco el preview temporal
      setProducto((prev) => ({
        ...prev,
        imagenes: prev.imagenes.filter((img) => img !== previewLocal),
      }));
    } finally {
      setSubiendoImagen(false);
    }

    // reset input file
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
      colors: [producto.color.trim()],
      images: producto.imagenes || [],
      description: producto.description || "",
      sizeGuide: producto.sizeGuide,
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
      sizeGuide: producto.sizeGuide,
    };

    try {
      const res = await fetch("http://localhost:5000/api/products", {
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
            <option>Cute Items</option>
            <option>Merch</option>
          </select>
          {errores.categoria && (
            <p className="input-error-text">{errores.categoria}</p>
          )}

          {/* SUBCATEGORÍA */}
          <label className="input-label">Subcategoría</label>
          <select
            className={`input-field ${errores.subcategoria ? "input-error" : ""
              }`}
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
          {errores.subcategoria && (
            <p className="input-error-text">{errores.subcategoria}</p>
          )}

          {/* COLOR */}
          <label className="input-label">Color</label>
          <select
            className={`input-field ${errores.color ? "input-error" : ""}`}
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

          {/* DESCRIPCIÓN */}
          <label className="input-label">Descripción</label>
          <textarea
            className="input-field textarea-field"
            value={producto.description}
            onChange={(e) => actualizarCampo("description", e.target.value)}
            placeholder="Descripción detallada del producto..."
          />

          {/* GUIA DE TALLES */}
          {/* GUIA DE TALLES */}
          <label className="input-label">Guía de talles</label>
          <select
            className="input-field"
            value={producto.sizeGuide}
            onChange={(e) => actualizarCampo("sizeGuide", e.target.value)}
          >
            <option value="none">Sin tabla</option>
            <option value="babytees">Baby Tees</option>
            <option value="croptops">Crop Tops</option>
            <option value="remeras">Remeras</option>
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
                {/* BOTÓN PRINCIPAL */}
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
