import { useState, useEffect } from "react";
import "../styles/adminstock.css";

export default function AdminStock() {
  const ORDEN_TALLES = ["S", "M", "L", "XL", "XXL", "3XL"];

  const [rows, setRows] = useState([]);
  const [toast, setToast] = useState(null); // { message, type }
  const [modal, setModal] = useState(null); // { message, type, onConfirm }
  const [talleSelectionModal, setTalleSelectionModal] = useState(false);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  function pedirConfirmacion(message, type, onConfirm) {
    setModal({ message, type, onConfirm });
  }

  // Cerrar modal con ESC
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setModal(null);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Centralización de rutas API
  function apiPath(path) {
    const base = import.meta.env.VITE_API_URL || "/api";
    if (path.startsWith("/")) return base + path;
    return base + "/" + path;
  }
  // CARGAR STOCK
  // ============================
  useEffect(() => {
    fetch(apiPath("/stock"))
      .then((res) => res.json())
      .then((data) =>
        setRows(
          data.map((item) => ({
            data: item,
            dirty: false,
            saving: false,
            saved: false,
            error: false,
          }))
        )
      );
  }, []);

  // ============================
  // AGREGAR COLOR NUEVO
  // ============================
  async function crearColor(talleUnico) {
    const nuevo = {
      color: "Nuevo color",
      colorHex: "#cccccc",
      paused: false,
      talleUnico: talleUnico,
      talles: talleUnico
        ? { "Único": 0 }
        : { S: 0, M: 0, L: 0, XL: 0, XXL: 0, "3XL": 0 },
    };

    const res = await fetch(apiPath("/stock"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });

    const creado = await res.json();

    setRows((prev) => [
      {
        data: creado,
        dirty: false,
        saving: false,
        saved: false,
        error: false,
      },
      ...prev,
    ]);

    showToast("Color agregado al stock.", "success");
    setTalleSelectionModal(false);
  }

  function agregarColor() {
    setTalleSelectionModal(true);
  }

  // ============================
  // ELIMINAR COLOR (confirmado)
  // ============================
  async function eliminarFilaConfirmado(index) {
    const row = rows[index];
    await fetch(apiPath(`/stock/${row.data._id}`), {
      method: "DELETE",
    });
    setRows((prev) => prev.filter((_, i) => i !== index));
    showToast("Color eliminado del stock.", "warning");
  }

  function eliminarFila(index) {
    const nombre = rows[index].data.color || "este color";
    pedirConfirmacion(
      `¿Eliminar ${nombre} del stock?`,
      "delete",
      () => eliminarFilaConfirmado(index)
    );
  }

  // ============================
  // PAUSAR / REACTIVAR COLOR
  // ============================
  async function togglePauseConfirmado(index) {
    const copia = [...rows];
    const row = copia[index];

    row.data.paused = !row.data.paused;
    setRows(copia);

    await fetch(apiPath(`/stock/${row.data._id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row.data),
    });

    showToast(
      row.data.paused
        ? "Color pausado. Ya no se muestra en el sitio."
        : "Color reactivado. Vuelve a estar disponible.",
      "info"
    );
  }

  function togglePause(index) {
    const row = rows[index];
    const nombre = row.data.color || "este color";

    pedirConfirmacion(
      row.data.paused
        ? `¿Reactivar ${nombre}?`
        : `¿Pausar ${nombre}?`,
      row.data.paused ? "resume" : "pause",
      () => togglePauseConfirmado(index)
    );
  }

  // ============================
  // EDITAR CELDA
  // ============================
  function editar(index, campo, valor) {
    setRows((prev) => {
      const copia = [...prev];
      copia[index].data[campo] = valor;
      copia[index].dirty = true;
      return copia;
    });
  }

  function editarTalle(index, talle, valor) {
    setRows((prev) => {
      const copia = [...prev];
      const numValue = valor === "" || valor === undefined ? "" : Number(valor);
      copia[index].data.talles[talle] = Number.isNaN(numValue) ? "" : numValue;
      copia[index].dirty = true;
      return copia;
    });
  }

  // ============================
  // GUARDAR FILA (confirmado)
  // ============================
  async function guardarFilaConfirmado(index) {
    setRows((prev) => {
      const copia = [...prev];
      copia[index].saving = true;
      copia[index].saved = false;
      copia[index].error = false;
      return copia;
    });

    const row = rows[index].data;
    const payload = {
      ...row,
      talles: Object.fromEntries(
        Object.entries(row.talles || {}).map(([talle, cantidad]) => [
          talle,
          cantidad === "" || cantidad === undefined ? 0 : Number(cantidad),
        ])
      ),
    };

    try {
      const res = await fetch(apiPath(`/stock/${row._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      setRows((prev) => {
        const copia = [...prev];
        copia[index].saving = false;
        copia[index].dirty = false;
        copia[index].saved = true;
        return copia;
      });

      showToast("Cambios guardados correctamente.", "success");

      setTimeout(() => {
        setRows((prev) => {
          const copia = [...prev];
          copia[index].saved = false;
          return copia;
        });
      }, 1500);
    } catch (err) {
      setRows((prev) => {
        const copia = [...prev];
        copia[index].saving = false;
        copia[index].error = true;
        return copia;
      });
      showToast("No se pudieron guardar los cambios.", "error");
    }
  }

  function guardarFila(index) {
    const nombre = rows[index].data.color || "este color";
    pedirConfirmacion(
      `¿Guardar cambios de ${nombre}?`,
      "save",
      () => guardarFilaConfirmado(index)
    );
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="admin-stock-excel">

      {/* MODAL SELECCIÓN TALLE */}
      {talleSelectionModal && (
        <div
          className="comfy-modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains("comfy-modal-backdrop")) {
              setTalleSelectionModal(false);
            }
          }}
        >
          <div className="comfy-modal animate-in">
            <div className="modal-icon">👕</div>

            <h3 className="modal-title">Tipo de producto</h3>
            <p className="modal-message">
              ¿Este color es para un producto de talle único o múltiples talles?
            </p>

            <div className="comfy-modal-buttons comfy-modal-buttons--dual">
              <button
                className="btn-talle-unico"
                onClick={() => crearColor(true)}
              >
                <span className="btn-label">Talle Único</span>
                <span className="btn-sublabel">Gorras, accesorios, etc.</span>
              </button>

              <button
                className="btn-talle-multiple"
                onClick={() => crearColor(false)}
              >
                <span className="btn-label">Múltiples Talles</span>
                <span className="btn-sublabel">S, M, L, XL, XXL, 3XL</span>
              </button>
            </div>

            <button
              className="btn-modal-close"
              onClick={() => setTalleSelectionModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ============================
          MODAL COMFY
      ============================ */}
      {modal && (
        <div
          className="comfy-modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains("comfy-modal-backdrop")) {
              setModal(null);
            }
          }}
        >
          <div className="comfy-modal animate-in">
            <div className="modal-icon">
              {modal.type === "delete" && "🗑️"}
              {modal.type === "pause" && "⏸️"}
              {modal.type === "resume" && "▶️"}
              {modal.type === "save" && "💾"}
            </div>

            <p className="modal-message">{modal.message}</p>

            <div className="comfy-modal-buttons">
              <button
                className="btn-confirm"
                onClick={() => {
                  modal.onConfirm();
                  setModal(null);
                }}
              >
                Confirmar
              </button>

              <button className="btn-cancel" onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST COMFY */}
      {toast && (
        <div className={`comfy-toast comfy-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <h2>Stock general</h2>

      <button className="btn-agregar-color" onClick={agregarColor}>
        + Agregar color
      </button>

      {/* TABLA TALLES MÚLTIPLES */}
      {rows.some((r) => !r.data.talleUnico) && (
        <>
          <h3 className="tabla-subtitulo">🧣 Talles Múltiples (S, M, L, XL, XXL, 3XL)</h3>
          <div className="excel-table-container">
            <table className="excel-table">
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Hex</th>
                  <th>Pausado</th>
                  {ORDEN_TALLES.map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows
                  .filter((row) => !row.data.talleUnico)
                  .map((row, originalIndex) => {
                    const index = rows.indexOf(row);
                    return (
                      <tr
                        key={row.data._id}
                        className={
                          row.saving
                            ? "saving-row"
                            : row.saved
                              ? "saved-row"
                              : row.dirty
                                ? "dirty-row"
                                : ""
                        }
                      >
                        <td>
                          <input
                            value={row.data.color}
                            onChange={(e) => editar(index, "color", e.target.value)}
                          />
                        </td>

                        <td>
                          <input
                            type="color"
                            value={row.data.colorHex}
                            onChange={(e) => editar(index, "colorHex", e.target.value)}
                          />
                        </td>

                        {/* TOGGLE PAUSAR */}
                        <td>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={!row.data.paused}
                              onChange={() => togglePause(index)}
                            />
                            <span className="slider"></span>
                          </label>
                        </td>

                        {ORDEN_TALLES.map((t) => (
                          <td key={t}>
                            <input
                              type="number"
                              value={row.data.talles[t] ?? ""}
                              onChange={(e) => editarTalle(index, t, e.target.value)}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  editarTalle(index, t, 0);
                                }
                              }}
                            />
                          </td>
                        ))}

                        <td className="acciones">
                          <button
                            className="btn-guardar"
                            disabled={!row.dirty || row.saving}
                            onClick={() => guardarFila(index)}
                          >
                            {row.saving ? "Guardando..." : "Guardar"}
                          </button>

                          <button
                            className="btn-eliminar"
                            onClick={() => eliminarFila(index)}
                          >
                            ✕
                          </button>

                          {row.saved && <span className="ok-msg">✔ Guardado</span>}
                          {row.error && <span className="error-msg">✖ Error</span>}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TABLA TALLES ÚNICOS */}
      {rows.some((r) => r.data.talleUnico) && (
        <>
          <h3 className="tabla-subtitulo">👒 Talles Únicos (Gorras, Accesorios)</h3>
          <div className="excel-table-container">
            <table className="excel-table excel-table--unico">
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Hex</th>
                  <th>Pausado</th>
                  <th style={{ textAlign: "center" }}>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {rows
                  .filter((row) => row.data.talleUnico)
                  .map((row, originalIndex) => {
                    const index = rows.indexOf(row);
                    return (
                      <tr
                        key={row.data._id}
                        className={
                          row.saving
                            ? "saving-row"
                            : row.saved
                              ? "saved-row"
                              : row.dirty
                                ? "dirty-row"
                                : ""
                        }
                      >
                        <td>
                          <input
                            value={row.data.color}
                            onChange={(e) => editar(index, "color", e.target.value)}
                          />
                        </td>

                        <td>
                          <input
                            type="color"
                            value={row.data.colorHex}
                            onChange={(e) => editar(index, "colorHex", e.target.value)}
                          />
                        </td>

                        {/* TOGGLE PAUSAR */}
                        <td>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={!row.data.paused}
                              onChange={() => togglePause(index)}
                            />
                            <span className="slider"></span>
                          </label>
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <input
                            type="number"
                            value={row.data.talles["Único"] ?? ""}
                            onChange={(e) => editarTalle(index, "Único", e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                editarTalle(index, "Único", 0);
                              }
                            }}
                            style={{ width: "80px", textAlign: "center" }}
                          />
                        </td>

                        <td className="acciones">
                          <button
                            className="btn-guardar"
                            disabled={!row.dirty || row.saving}
                            onClick={() => guardarFila(index)}
                          >
                            {row.saving ? "Guardando..." : "Guardar"}
                          </button>

                          <button
                            className="btn-eliminar"
                            onClick={() => eliminarFila(index)}
                          >
                            ✕
                          </button>

                          {row.saved && <span className="ok-msg">✔ Guardado</span>}
                          {row.error && <span className="error-msg">✖ Error</span>}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
