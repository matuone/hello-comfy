import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminproducts.css";

export default function AdminProductNew() {
  const navigate = useNavigate();

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price),
      colors: form.colors.split(",").map((c) => c.trim()),
      sizes: form.sizes.split(",").map((s) => s.trim()),
      images: form.images.split(",").map((i) => i.trim()),
      description: form.description,
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

        <label>Colores (separados por coma)</label>
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
