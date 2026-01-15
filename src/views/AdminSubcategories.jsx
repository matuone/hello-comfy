import { useEffect, useState } from "react";
import "../styles/admin.css";

const CATEGORY_OPTIONS = [
  { value: "Indumentaria", label: "Indumentaria" },
  { value: "Cute items", label: "Cute items" },
  { value: "Merch", label: "Merch" },
];

const fetchGrouped = async () => {
  const res = await fetch("http://localhost:5000/api/products/filters/data");
  if (!res.ok) throw new Error("No se pudo cargar subcategorías");
  return res.json();
};

const fetchSubcategories = async () => {
  const res = await fetch("http://localhost:5000/api/subcategories");
  if (!res.ok) throw new Error("No se pudo cargar subcategorías manuales");
  return res.json();
};

export default function AdminSubcategories() {
  const [categoria, setCategoria] = useState("Indumentaria");
  const [nombre, setNombre] = useState("");
  const [grouped, setGrouped] = useState({});
  const [manualSubs, setManualSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingCat, setEditingCat] = useState("Indumentaria");
  const [editingName, setEditingName] = useState("");

  const loadData = async () => {
    try {
      setError("");
      const [filtersData, subsManual] = await Promise.all([
        fetchGrouped(),
        fetchSubcategories(),
      ]);
      setGrouped(filtersData.groupedSubcategories || {});
      setManualSubs(subsManual || []);
    } catch (err) {
      setError(err.message || "Error cargando datos");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoria, name: nombre }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo crear la subcategoría");
      }

      setMessage(`Subcategoría "${data.name}" creada en ${data.category}`);
      setNombre("");
      await loadData();
    } catch (err) {
      setError(err.message || "Error al crear subcategoría");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (sub) => {
    setEditingId(sub._id);
    setEditingCat(sub.category);
    setEditingName(sub.name);
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingCat("Indumentaria");
    setEditingName("");
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/subcategories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: editingCat, name: editingName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar");
      setMessage(`Subcategoría "${data.name}" actualizada`);
      cancelEdit();
      await loadData();
    } catch (err) {
      setError(err.message || "Error al actualizar");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta subcategoría?")) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/subcategories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar");
      setMessage(data.message || "Subcategoría eliminada");
      if (editingId === id) cancelEdit();
      await loadData();
    } catch (err) {
      setError(err.message || "Error al eliminar");
    }
  };

  const handleReorder = async (category, newOrderIds) => {
    try {
      await fetch("http://localhost:5000/api/subcategories/reorder/all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, order: newOrderIds }),
      });
      await loadData();
    } catch (err) {
      setError(err.message || "Error al reordenar");
    }
  };

  const groupManualByCat = CATEGORY_OPTIONS.reduce((acc, opt) => {
    acc[opt.value] = manualSubs.filter((s) => s.category === opt.value);
    return acc;
  }, {});

  const renderList = (cat) => {
    const subs = grouped[cat] || [];
    return subs.length === 0 ? "—" : subs.join(", ");
  };

  return (
    <div className="admin-card">
      <h2>Agregar subcategoría</h2>
      <p>Creá nuevas subcategorías dentro de Indumentaria, Cute items o Merch. Se reflejan automáticamente en el navbar del sitio.</p>

      <form className="admin-form admin-form--panel" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="categoria">Categoría</label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="admin-input"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="nombre">Nombre de la subcategoría</label>
          <input
            id="nombre"
            type="text"
            placeholder="Ej: Buzos oversized"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="admin-input"
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <button className="admin-btn admin-btn-primary" type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear subcategoría"}
        </button>
      </form>

      <div className="admin-subcats-grid">
        <h3>Subcategorías actuales</h3>
        <div className="admin-table-grid">
          {CATEGORY_OPTIONS.map((opt) => (
            <div key={opt.value} className="admin-table-card">
              <h4>{opt.label}</h4>
              <p>{renderList(opt.value)}</p>
            </div>
          ))}
        </div>

        {manualSubs.length > 0 && (
          <details className="admin-details">
            <summary>Subcategorías creadas manualmente (editar / borrar / ordenar)</summary>
            <div className="admin-subcats-list">
              {CATEGORY_OPTIONS.map((opt) => {
                const list = groupManualByCat[opt.value] || [];
                return (
                  <div key={opt.value} className="admin-subcats-group">
                    <div className="admin-subcats-group-header">{opt.label}</div>
                    {list.length === 0 && <p className="admin-subcats-empty">Sin subcategorías manuales</p>}
                    {list.map((s, idx) => (
                      <div
                        key={s._id}
                        className="admin-subcats-row"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ id: s._id, category: opt.value }))}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const data = JSON.parse(e.dataTransfer.getData("text/plain") || "{}");
                          if (data.category !== opt.value) return;
                          const current = [...list];
                          const fromIdx = current.findIndex((x) => x._id === data.id);
                          const toIdx = idx;
                          if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
                          const [moved] = current.splice(fromIdx, 1);
                          current.splice(toIdx, 0, moved);
                          handleReorder(opt.value, current.map((x) => x._id));
                        }}
                      >
                        <div className="admin-subcats-info">
                          <span className="drag-handle" aria-hidden>⋮⋮</span>
                          <span className="pill pill--name">{s.name}</span>
                        </div>
                        <div className="admin-subcats-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            onClick={() => startEdit(s)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost"
                            onClick={() => handleDelete(s._id)}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>

      {editingId && (
        <div className="admin-form admin-form--panel admin-form--inline">
          <h3>Editar subcategoría</h3>
          <div className="form-row">
            <label htmlFor="edit-categoria">Categoría</label>
            <select
              id="edit-categoria"
              value={editingCat}
              onChange={(e) => setEditingCat(e.target.value)}
              className="admin-input"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="edit-nombre">Nombre</label>
            <input
              id="edit-nombre"
              type="text"
              className="admin-input"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
            />
          </div>

          <div className="admin-subcats-actions">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleUpdate}
              disabled={savingEdit}
            >
              {savingEdit ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={cancelEdit}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
