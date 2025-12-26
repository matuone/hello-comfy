import { useState } from "react";
import { stockGeneral as initialStock } from "../data/stockData";
import "../styles/adminstock.css";

export default function AdminStock() {
  const ORDEN_TALLES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  const [stock, setStock] = useState(initialStock);
  const [highlightIndex, setHighlightIndex] = useState(null);

  function actualizarTalle(indexColor, talle, valor) {
    setStock(prev => {
      const copia = [...prev];
      copia[indexColor].talles[talle] = Number(valor);
      return copia;
    });
  }

  function actualizarColor(indexColor, campo, valor) {
    setStock(prev => {
      const copia = [...prev];
      copia[indexColor][campo] = valor;
      return copia;
    });
  }

  function agregarColor() {
    const nuevo = {
      color: "Nuevo color",
      colorHex: "#cccccc",
      talles: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, "3XL": 0 }
    };

    // Insertar primero
    setStock(prev => [nuevo, ...prev]);

    // Activar highlight en el primer elemento
    setHighlightIndex(0);

    // Quitar highlight después de 1.5s
    setTimeout(() => setHighlightIndex(null), 1500);
  }

  function eliminarColor(index) {
    if (confirm("¿Eliminar este color del stock general?")) {
      setStock(prev => prev.filter((_, i) => i !== index));
    }
  }

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
            key={index}
            className={
              "detalle-box" +
              (highlightIndex === index ? " color-added" : "")
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
              onChange={e => actualizarColor(index, "color", e.target.value)}
            />

            <label className="input-label">Color visual</label>
            <div className="color-row">
              <input
                type="color"
                className="color-picker"
                value={item.colorHex}
                onChange={e => actualizarColor(index, "colorHex", e.target.value)}
              />
              <div
                className="color-preview"
                style={{ backgroundColor: item.colorHex }}
              ></div>
            </div>

            <h4 className="detalle-subtitle">Talles</h4>

            <div className="talles-grid">
              {ORDEN_TALLES.map(talle => (
                <div key={talle} className="talle-item">
                  <label>{talle}</label>
                  <input
                    type="number"
                    className="input-field-talle"
                    value={item.talles[talle]}
                    onChange={e =>
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
