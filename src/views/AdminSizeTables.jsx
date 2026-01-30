import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/admin/sizetables.css";

export default function AdminSizeTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTable, setEditingTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    sizes: ["S", "M", "L", "XL"],
    measurements: [
      { name: "HOMBROS", values: {} },
      { name: "PECHO", values: {} },
      { name: "LARGO", values: {} },
    ],
    note: "* Las medidas pueden variar +/- 1 a 2cm",
    active: true,
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:5000/api/sizetables/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error("Error al cargar tablas:", error);
      toast.error("Error al cargar tablas de talles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.displayName) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const measurementsWithMaps = formData.measurements.map((m) => ({
        name: m.name,
        values: Object.fromEntries(Object.entries(m.values)),
      }));

      const payload = {
        ...formData,
        measurements: measurementsWithMaps,
      };

      const url = editingTable
        ? `http://localhost:5000/api/sizetables/${editingTable._id}`
        : "http://localhost:5000/api/sizetables";

      const method = editingTable ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          editingTable
            ? "Tabla actualizada correctamente"
            : "Tabla creada correctamente"
        );
        fetchTables();
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al guardar la tabla");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar la tabla");
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      displayName: table.displayName,
      sizes: table.sizes,
      measurements: table.measurements.map((m) => ({
        name: m.name,
        values: Object.fromEntries(m.values),
      })),
      note: table.note || "",
      active: table.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setTableToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`http://localhost:5000/api/sizetables/${tableToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Tabla eliminada correctamente");
        fetchTables();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar la tabla");
    } finally {
      setShowConfirm(false);
      setTableToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setTableToDelete(null);
  };

  const handleReorder = async (newOrderIds) => {
    try {
      const token = localStorage.getItem("adminToken");
      await fetch("http://localhost:5000/api/sizetables/reorder/all", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order: newOrderIds }),
      });
      await fetchTables();
      toast.success("Orden guardado correctamente");
    } catch (error) {
      console.error("Error al reordenar:", error);
      toast.error("Error al guardar el orden");
    }
  };

  const handleSaveOrder = async () => {
    const currentOrder = tables.map((t) => t._id);
    await handleReorder(currentOrder);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      sizes: ["S", "M", "L", "XL"],
      measurements: [
        { name: "HOMBROS", values: {} },
        { name: "PECHO", values: {} },
        { name: "LARGO", values: {} },
      ],
      note: "* Las medidas pueden variar +/- 1 a 2cm",
      active: true,
    });
    setEditingTable(null);
    setShowForm(false);
  };

  const handleSizeChange = (index, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = value;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSize = () => {
    setFormData({ ...formData, sizes: [...formData.sizes, ""] });
  };

  const removeSize = (index) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleMeasurementNameChange = (index, value) => {
    const newMeasurements = [...formData.measurements];
    newMeasurements[index].name = value;
    setFormData({ ...formData, measurements: newMeasurements });
  };

  const handleMeasurementValueChange = (measurementIndex, size, value) => {
    const newMeasurements = [...formData.measurements];
    newMeasurements[measurementIndex].values[size] = value;
    setFormData({ ...formData, measurements: newMeasurements });
  };

  const addMeasurement = () => {
    setFormData({
      ...formData,
      measurements: [...formData.measurements, { name: "", values: {} }],
    });
  };

  const removeMeasurement = (index) => {
    const newMeasurements = formData.measurements.filter((_, i) => i !== index);
    setFormData({ ...formData, measurements: newMeasurements });
  };

  if (loading) return <div className="admin-loading">Cargando...</div>;

  return (
    <div className="admin-sizetables">
      <div className="admin-sizetables-header">
        <h1>Tablas de Talles</h1>
        <div className="header-buttons">
          <button
            className="btn-save-order"
            onClick={handleSaveOrder}
          >
            💾 Guardar orden
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancelar" : "+ Nueva Tabla"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="sizetable-form-card">
          <h2>{editingTable ? "Editar Tabla" : "Nueva Tabla de Talles"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre Interno (único)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ej: baby-tees"
                  disabled={!!editingTable}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre para Mostrar</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="ej: Baby Tees"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Talles Disponibles</label>
              <div className="sizes-input-group">
                {formData.sizes.map((size, index) => (
                  <div key={index} className="size-input-item">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => handleSizeChange(index, e.target.value)}
                      placeholder="S, M, L..."
                    />
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="btn-remove-small"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addSize} className="btn-add-small">
                  + Talle
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Medidas</label>
              {formData.measurements.map((measurement, mIndex) => (
                <div key={mIndex} className="measurement-group">
                  <div className="measurement-header">
                    <input
                      type="text"
                      value={measurement.name}
                      onChange={(e) =>
                        handleMeasurementNameChange(mIndex, e.target.value)
                      }
                      placeholder="HOMBROS, PECHO..."
                      className="measurement-name-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeMeasurement(mIndex)}
                      className="btn-remove-small"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="measurement-values">
                    {formData.sizes.map((size, sIndex) => (
                      <div key={sIndex} className="measurement-value-item">
                        <label>{size}</label>
                        <input
                          type="text"
                          value={measurement.values[size] || ""}
                          onChange={(e) =>
                            handleMeasurementValueChange(
                              mIndex,
                              size,
                              e.target.value
                            )
                          }
                          placeholder="ej: 36cm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMeasurement}
                className="btn-add-small"
              >
                + Medida
              </button>
            </div>

            <div className="form-group">
              <label>Nota (opcional)</label>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                rows="3"
                placeholder="Notas adicionales sobre las medidas..."
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                />
                Activa
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingTable ? "Guardar Cambios" : "Crear Tabla"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="sizetables-list">
        {tables.length === 0 ? (
          <p className="empty-state">No hay tablas de talles creadas</p>
        ) : (
          tables.map((table, idx) => (
            <div
              key={table._id}
              className="sizetable-card"
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("text/plain", JSON.stringify({ id: table._id }))
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer.getData("text/plain") || "{}");
                const current = [...tables];
                const fromIdx = current.findIndex((x) => x._id === data.id);
                const toIdx = idx;
                if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
                const [moved] = current.splice(fromIdx, 1);
                current.splice(toIdx, 0, moved);
                handleReorder(current.map((x) => x._id));
              }}
            >
              <div className="sizetable-card-header">
                <div className="sizetable-header-left">
                  <span className="order-number">{idx + 1}</span>
                  <span className="drag-handle" aria-hidden>⋮⋮</span>
                  <h3>
                    {table.displayName}
                    {!table.active && <span className="badge-inactive">Inactiva</span>}
                  </h3>
                </div>
                <div className="sizetable-actions">
                  <button
                    onClick={() => handleEdit(table)}
                    className="btn-edit"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(table._id)}
                    className="btn-delete"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>

              <div className="sizetable-preview">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      {table.sizes.map((size, i) => (
                        <th key={i}>{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.measurements.map((m, i) => (
                      <tr key={i}>
                        <td><strong>{m.name}</strong></td>
                        {table.sizes.map((size, j) => (
                          <td key={j}>{m.values[size] || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {table.note && <p className="table-note">{table.note}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {showConfirm && (
        <ConfirmModal
          titulo="Eliminar Tabla de Talles"
          mensaje="¿Estás seguro de que querés eliminar esta tabla de talles? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
