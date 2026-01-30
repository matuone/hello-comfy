import { useEffect, useState } from "react";

export default function AdminDiscounts() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    type: "percentage",
    discount: 0,
  });

  const [editingId, setEditingId] = useState(null);

  // Traer productos para generar categorías dinámicas
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  // Traer reglas
  useEffect(() => {
    fetch("http://localhost:5000/api/discounts")
      .then((res) => res.json())
      .then((data) => setRules(data));
  }, []);

  // Normalizar visualmente (por si quedó algo mal en la base)
  const normalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;

  // Extraer categorías únicas
  const categories = [...new Set(products.map((p) => normalize(p.category)))];

  // Extraer subcategorías únicas según categoría seleccionada
  const subcategories = form.category
    ? [
      ...new Set(
        products
          .filter((p) => normalize(p.category) === form.category)
          .map((p) => normalize(p.subcategory))
      ),
    ]
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };

    const url = editingId
      ? `http://localhost:5000/api/discounts/${editingId}`
      : "http://localhost:5000/api/discounts";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setForm({
      category: "",
      subcategory: "",
      type: "percentage",
      discount: 0,
    });
    setEditingId(null);

    const updated = await fetch("http://localhost:5000/api/discounts").then(
      (res) => res.json()
    );
    setRules(updated);
  };

  const handleEdit = (rule) => {
    setEditingId(rule._id);
    setForm({
      category: rule.category,
      subcategory: rule.subcategory,
      type: rule.type,
      discount: rule.discount || 0,
    });
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/discounts/${id}`, {
      method: "DELETE",
    });

    setRules(rules.filter((r) => r._id !== id));
  };

  return (
    <div className="admin-main">
      <div className="admin-main-header">
        <h1 className="admin-main-title">Descuentos por Categoría</h1>
        <p className="admin-main-subtitle">
          Creá reglas de descuento por categoría y subcategoría.
        </p>
      </div>

      <div className="admin-main-content">

        {/* ============================
            SECCIÓN: FORMULARIO
        ============================ */}
        <div className="admin-section">
          <h2 className="admin-section-title">
            {editingId ? "Editar regla" : "Crear nueva regla"}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>

            <div className="admin-form-group">
              <label>Categoría</label>
              <select
                className="admin-input"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value, subcategory: "" })
                }
              >
                <option value="">Seleccionar</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Subcategoría</label>
              <select
                className="admin-input"
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
              >
                <option value="none">Todas</option>
                {subcategories.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Tipo de descuento</label>
              <select
                className="admin-input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="percentage">Porcentaje</option>
                <option value="3x2">3x2</option>
              </select>
            </div>

            {form.type === "percentage" && (
              <div className="admin-form-group">
                <label>Descuento (%)</label>
                <input
                  className="admin-input"
                  type="number"
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: Number(e.target.value) })
                  }
                />
              </div>
            )}

            <button className="table-btn table-btn--pink" style={{ width: "fit-content" }}>
              {editingId ? "Guardar cambios" : "Crear regla"}
            </button>
          </form>
        </div>

        {/* ============================
            SECCIÓN: TABLA
        ============================ */}
        <div className="admin-section" style={{ marginTop: "24px" }}>
          <h2 className="admin-section-title">Reglas existentes</h2>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Subcategoría</th>
                  <th>Tipo</th>
                  <th>Descuento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r._id}>
                    <td>{r.category}</td>
                    <td>{r.subcategory}</td>
                    <td>{r.type}</td>
                    <td>{r.type === "percentage" ? `${r.discount}%` : "3x2"}</td>
                    <td>
                      <button
                        className="table-btn"
                        onClick={() => handleEdit(r)}
                      >
                        Editar
                      </button>
                      <button
                        className="table-btn"
                        style={{ background: "#f8b4b4", color: "#b71c1c" }}
                        onClick={() => handleDelete(r._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
