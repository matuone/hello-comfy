import { useState, useEffect } from "react";
import "../styles/adminstock.css";

export default function AdminStock() {
  const ORDEN_TALLES = ["S", "M", "L", "XL", "XXL", "3XL"];

  const [stock, setStock] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(null);

  // ============================
  // CARGAR STOCK DESDE BACKEND
  // ============================
  useEffect(() => {
    fetch("http://localhost:5000/api/stock")
      .then((res) => res.json())
      .then((data) => setStock(data))
      .catch((err) => console.error("Error cargando stock:", err));
  }, []);

  // ============================
  // ACTUALIZAR TALLE (FIX PERFECTO)
  // ============================
  async function actualizarTalle(indexColor, talle, valor) {
    const copia = [...stock];

    // Permitir borrar → queda ""
    copia[indexColor].talles[talle] =
      valor === "" ? "" : Number(valor);

    setStock(copia);

    // Convertir "" a 0 antes de enviar al backend
    const payload = {
      ...copia[indexColor],
      talles: {
        ...copia[indexColor].talles,
        [talle]: valor === "" ? 0 : Number(valor),
      },
    };

    await fetch(`http://localhost:5000/api/stock/${copia[indexColor]._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  // ============================
  // ACTUALIZAR COLOR O HEX
  // ============================
  async function actualizarColor(indexColor, campo, valor) {
    const copia = [...stock];
    copia[indexColor][campo] = valor;
    setStock(copia);

    await fetch(`http://localhost:5000/api/stock/${copia[indexColor]._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copia[indexColor]),
    });
  }

  // ============================
  // AGREGAR COLOR NUEVO
  // ============================
  async function agregarColor() {
    const nuevo = {
      color: "Nuevo color",
      colorHex: "#cccccc",
      talles: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, "3XL": 0 },
    };

    const res = await fetch("http://localhost:5000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });

    const creado = await res.json();

    setStock((prev) => [creado, ...prev]);
    setHighlightIndex(0);
    setTimeout(() => setHighlightIndex(null), 1500);
  }

  // ============================
  // ELIMINAR COLOR
  // ============================
  async function eliminarColor(index) {
    if (!confirm("¿Eliminar este color del stock general?")) return;

    const id = stock[index]._id;

    await fetch(`http://localhost:5000/api/stock/${id}`, {
      method: "DELETE",
    });

    setStock((prev) => prev.filter((_, i) => i !== index));
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Stock general</h2>
      <p className="admin-section-text">
        Stock real de remeras lisas por talle y color.
      </p>

      <button className="btn-agregar-color" onClick={agregarColor}>
        + Agregar color
      </button>

      <div className="stock-column">
        {stock.map((item, index) => (
          <div
            key={item._id}
            className={
              "detalle-box" + (highlightIndex === index ? " color-added" : "")
            }
          >
            <div className="stock-header">
              <h3 className="detalle-title">{item.color}</h3>

              <button
                className="btn-eliminar-color"
                onClick={() => eliminarColor(index)}
              >
                ✕
              </button>
            </div>

            <label className="input-label">Nombre del color</label>
            <input
              type="text"
              className="input-field"
              value={item.color}
              onChange={(e) =>
                actualizarColor(index, "color", e.target.value)
              }
            />

            <label className="input-label">Color visual</label>
            <div className="color-row">
              <input
                type="color"
                className="color-picker"
                value={item.colorHex}
                onChange={(e) =>
                  actualizarColor(index, "colorHex", e.target.value)
                }
              />
              <div
                className="color-preview"
                style={{ backgroundColor: item.colorHex }}
              ></div>
            </div>

            <h4 className="detalle-subtitle">Talles</h4>

            <div className="talles-grid">
              {ORDEN_TALLES.map((talle) => (
                <div key={talle} className="talle-item">
                  <label>{talle}</label>
                  <input
                    type="number"
                    className="input-field-talle"
                    value={
                      item.talles[talle] === "" ? "" : item.talles[talle]
                    }
                    onChange={(e) =>
                      actualizarTalle(index, talle, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
