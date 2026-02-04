
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminproducts.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function AdminProductNew() {
  const navigate = useNavigate();

  const [stockColors, setStockColors] = useState([]);
  const [selectedStockColorId, setSelectedStockColorId] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    price: "",
    colors: "",
    sizes: "",
    images: "",
    description: "",
  });

  // ============================
  // Cargar colores reales desde StockColor
  // ============================
  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch(apiPath("/stock"));
        const data = await res.json();
        setStockColors(data);
      } catch (err) {
        console.error("Error al cargar colores:", err);
      }
    }
    fetchColors();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // ⭐ Validación obligatoria
    if (!selectedStockColorId) {
      alert("Seleccioná un color real (StockColor)");
      return;
    }

    // ⭐ Normalización de arrays
    const parsedColors =
      form.colors.trim() === ""
        ? []
        : form.colors.split(",").map((c) => c.trim());

    const parsedSizes =
      form.sizes.trim() === ""
        ? []
        : form.sizes.split(",").map((s) => s.trim());

    const parsedImages =
      form.images.trim() === ""
        ? []
        : form.images.split(",").map((i) => i.trim());

    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price),

      colors: parsedColors,
      sizes: parsedSizes,
      images: parsedImages,
      description: form.description,

      // ⭐ EL STOCK REAL
      stockColorId: selectedStockColorId,
    };

    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Error al crear producto");
      }

      alert("Producto creado con éxito");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Hubo un problema al crear el producto");
    }
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Nuevo producto</h2>

      <form className="product-form" onSubmit={handleSubmit}>
        <label>Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Categoría</label>
        <input name="category" value={form.category} onChange={handleChange} />

        <label>Subcategoría</label>
        <input
          name="subcategory"
          value={form.subcategory}
          onChange={handleChange}
        />

        <label>Precio</label>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
        />

        {/* ⭐ NUEVO: selector de color real */}
        <label>Color real (StockColor)</label>
        <select
          value={selectedStockColorId}
          onChange={(e) => setSelectedStockColorId(e.target.value)}
        >
          <option value="">Seleccionar color…</option>
          {stockColors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.color} — {c.colorHex}
            </option>
          ))}
        </select>

        <label>Colores (texto opcional, separados por coma)</label>
        <input
          name="colors"
          value={form.colors}
          onChange={handleChange}
          placeholder="rosa, blanco, negro"
        />

        <label>Talles (separados por coma)</label>
        <input
          name="sizes"
          value={form.sizes}
          onChange={handleChange}
          placeholder="S, M, L, XL"
        />

        <label>Imágenes (URLs separadas por coma)</label>
        <input
          name="images"
          value={form.images}
          onChange={handleChange}
          placeholder="https://img1.jpg, https://img2.jpg"
        />

        <label>Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <button className="add-product-btn" type="submit">
          Crear producto
        </button>
      </form>
    </div>
  );
}
