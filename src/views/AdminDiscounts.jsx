
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

// Centralización de rutas API
function apiPath(path) {
  const base = import.meta.env.VITE_API_URL;
  if (path.startsWith("/")) return base + path;
  return base + "/" + path;
}

// Categorías fijas del sistema (deben coincidir con ALLOWED_CATEGORIES del backend)
const ALLOWED_CATEGORIES = ["Indumentaria", "Cute items", "Merch"];

export default function AdminDiscounts() {
  const { adminFetch } = useAuth();
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    category: "",
    subcategory: "none",
    type: "percentage",
    discount: 0,
  });

  const [editingId, setEditingId] = useState(null);

  // 🚚 Estado para Free Shipping Threshold
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [isActiveThreshold, setIsActiveThreshold] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(0);

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" // success, error, warning, info
  });

  const openModal = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  // Traer productos para generar categorías dinámicas
  useEffect(() => {
    fetch(apiPath("/products"))
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  // Traer reglas
  useEffect(() => {
    fetch(apiPath("/discounts"))
      .then((res) => res.json())
      .then((data) => setRules(data));
  }, []);

  // 🚚 Traer Free Shipping Threshold
  useEffect(() => {
    fetch(apiPath("/discounts/free-shipping/threshold"))
      .then((res) => res.json())
      .then((data) => {
        setFreeShippingThreshold(data.threshold || 0);
        setIsActiveThreshold(data.isActive || false);
        setThresholdInput(data.threshold || 0);
      })
      .catch(() => {
        setFreeShippingThreshold(0);
        setIsActiveThreshold(false);
        setThresholdInput(0);
      });
  }, []);

  // Normalizar visualmente (por si quedó algo mal en la base)
  const normalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  // Usar categorías fijas del sistema
  const categories = ALLOWED_CATEGORIES;

  // Extraer subcategorías únicas según categoría seleccionada
  // Comparación case-insensitive para que "Cute items" / "cute items" etc. matcheen
  const subcategories = form.category
    ? [
      ...new Set(
        products
          .filter((p) => {
            const cats = Array.isArray(p.category) ? p.category : [p.category];
            return cats.some((c) => (c || "").toLowerCase() === form.category.toLowerCase());
          })
          .flatMap((p) => {
            const subs = Array.isArray(p.subcategory) ? p.subcategory : [p.subcategory];
            return subs.map((s) => normalize(s));
          })
          .filter(Boolean)
      ),
    ]
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };

    const url = editingId
      ? apiPath(`/discounts/${editingId}`)
      : apiPath("/discounts");

    const method = editingId ? "PUT" : "POST";

    await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setForm({
      category: "",
      subcategory: "none",
      type: "percentage",
      discount: 0,
    });
    setEditingId(null);

    const res = await fetch(apiPath("/discounts"));
    const updated = await res.json();
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
    await adminFetch(apiPath(`/discounts/${id}`), {
      method: "DELETE",
    });

    setRules(rules.filter((r) => r._id !== id));
  };

  // 🚚 Guardar Free Shipping Threshold
  const handleSaveThreshold = async () => {
    if (thresholdInput < 0) {
      openModal("Validación", "El monto debe ser positivo", "warning");
      return;
    }

    try {
      const res = await adminFetch(apiPath("/discounts/free-shipping/threshold"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: Number(thresholdInput), isActive: isActiveThreshold }),
      });

      const data = await res.json();
      setFreeShippingThreshold(data.threshold);
      setIsActiveThreshold(data.isActive);
      setEditingThreshold(false);
      openModal("✓ Éxito", "Configuración de envío gratis actualizada", "success");
    } catch (err) {
      openModal("✕ Error", "Error al guardar la configuración", "error");
    }
  };

  // 🚚 Toggle para activar/desactivar threshold
  const handleToggleThreshold = async () => {
    try {
      const newStatus = !isActiveThreshold;
      const res = await adminFetch(apiPath("/discounts/free-shipping/threshold"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: freeShippingThreshold, isActive: newStatus }),
      });

      const data = await res.json();
      setIsActiveThreshold(data.isActive);
    } catch (err) {
      openModal("✕ Error", "Error al cambiar estado", "error");
    }
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
            SECCIÓN: FREE SHIPPING THRESHOLD
        ============================ */}
        <div className="admin-section" style={{ width: "550px", marginBottom: "32px", paddingLeft: "24px", paddingRight: "24px" }}>
          <h2 className="admin-section-title">🚚 Envío Gratis a partir de</h2>

          <div className="admin-form-group">
            <p style={{ marginBottom: "12px", fontSize: "14px", color: "#666" }}>
              Cuando el subtotal alcance este monto, el envío será completamente gratis.
            </p>

            {editingThreshold ? (
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "14px" }}>$</span>
                  <input
                    className="admin-input"
                    type="number"
                    value={thresholdInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || Number(val) >= 0) {
                        setThresholdInput(val === "" ? 0 : Number(val));
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        setThresholdInput(0);
                      }
                    }}
                    placeholder="0"
                    style={{ flex: 1 }}
                    min="0"
                  />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="table-btn table-btn--pink"
                    onClick={handleSaveThreshold}
                  >
                    Guardar
                  </button>
                  <button
                    className="table-btn"
                    style={{ background: "#e0e0e0", color: "#333" }}
                    onClick={() => {
                      setEditingThreshold(false);
                      setThresholdInput(freeShippingThreshold);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "4px",
                width: "fit-content"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#d94f7a" }}>
                    $ {freeShippingThreshold.toLocaleString("es-AR")}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: isActiveThreshold ? "#c8e6c9" : "#ffcccc",
                    color: isActiveThreshold ? "#2e7d32" : "#c62828",
                    fontWeight: "bold"
                  }}>
                    {isActiveThreshold ? "✓ Activo" : "⊘ Pausado"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="table-btn"
                    onClick={handleToggleThreshold}
                    style={{
                      background: isActiveThreshold ? "#ffcccc" : "#c8e6c9",
                      color: isActiveThreshold ? "#c62828" : "#2e7d32"
                    }}
                  >
                    {isActiveThreshold ? "Pausar" : "Activar"}
                  </button>
                  <button
                    className="table-btn table-btn--pink"
                    onClick={() => setEditingThreshold(true)}
                  >
                    Editar monto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================
            SECCIÓN: FORMULARIO
        ============================ */}
        <div className="admin-section" style={{ width: "550px", paddingLeft: "24px", paddingRight: "24px" }}>
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
                <option value="free_shipping">Envío Gratis</option>
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
                    <td>{!r.subcategory || r.subcategory === "none" ? "Todas" : r.subcategory}</td>
                    <td>{r.type}</td>
                    <td>{r.type === "percentage" ? `${r.discount}%` : r.type === "3x2" ? "3x2" : "Envío Gratis"}</td>
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

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={closeModal}
      />
    </div>
  );
}
