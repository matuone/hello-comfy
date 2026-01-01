import { useEffect, useState } from "react";

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    code: "",
    discount: 0,
    validFrom: "",
    validUntil: "",
    category: "all",
    subcategory: "all",
    active: true,
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/promocodes")
      .then((res) => res.json())
      .then((data) => setCodes(data));

    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const subcategories =
    form.category === "all"
      ? ["all"]
      : [
        "all",
        ...new Set(
          products
            .filter((p) => p.category === form.category)
            .map((p) => p.subcategory)
        ),
      ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };

    const url = editingId
      ? `http://localhost:5000/api/promocodes/${editingId}`
      : "http://localhost:5000/api/promocodes";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setForm({
      code: "",
      discount: 0,
      validFrom: "",
      validUntil: "",
      category: "all",
      subcategory: "all",
      active: true,
    });
    setEditingId(null);

    const updated = await fetch("http://localhost:5000/api/promocodes").then(
      (res) => res.json()
    );
    setCodes(updated);
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      discount: c.discount,
      validFrom: c.validFrom.slice(0, 10),
      validUntil: c.validUntil.slice(0, 10),
      category: c.category,
      subcategory: c.subcategory,
      active: c.active,
    });
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/promocodes/${id}`, {
      method: "DELETE",
    });

    setCodes(codes.filter((c) => c._id !== id));
  };

  return (
    <div className="admin-main">
      <div className="admin-main-header">
        <h1 className="admin-main-title">Códigos Promocionales</h1>
        <p className="admin-main-subtitle">
          Creá códigos como VERANO2026 con fecha de inicio y fin.
        </p>
      </div>

      <div className="admin-main-content">

        {/* ============================
            SECCIÓN: FORMULARIO
        ============================ */}
        <div className="admin-section">
          <h2 className="admin-section-title">
            {editingId ? "Editar código" : "Crear nuevo código"}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <div>
              <label>Código</label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div>
              <label>Descuento (%)</label>
              <input
                type="number"
                value={form.discount}
                onChange={(e) =>
                  setForm({ ...form, discount: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label>Desde</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
              />
            </div>

            <div>
              <label>Hasta</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm({ ...form, validUntil: e.target.value })
                }
              />
            </div>

            <div>
              <label>Categoría</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value, subcategory: "all" })
                }
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Subcategoría</label>
              <select
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
              >
                {subcategories.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Activo</label>
              <select
                value={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.value === "true" })
                }
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            <button className="table-btn" style={{ width: "fit-content" }}>
              {editingId ? "Guardar cambios" : "Crear código"}
            </button>
          </form>
        </div>

        {/* ============================
            SECCIÓN: TABLA
        ============================ */}
        <div className="admin-section" style={{ marginTop: "24px" }}>
          <h2 className="admin-section-title">Códigos existentes</h2>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Categoría</th>
                  <th>Subcategoría</th>
                  <th>Activo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c._id}>
                    <td>{c.code}</td>
                    <td>{c.discount}%</td>
                    <td>{c.validFrom.slice(0, 10)}</td>
                    <td>{c.validUntil.slice(0, 10)}</td>
                    <td>{c.category}</td>
                    <td>{c.subcategory}</td>
                    <td>{c.active ? "Sí" : "No"}</td>
                    <td>
                      <button className="table-btn" onClick={() => handleEdit(c)}>
                        Editar
                      </button>
                      <button
                        className="table-btn"
                        style={{ background: "#f8b4b4", color: "#b71c1c" }}
                        onClick={() => handleDelete(c._id)}
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
