// src/components/SizeGuide.jsx
import { useState, useEffect } from "react";
import "../styles/sizeguide.css";
import bearPointer from "../assets/bear-pointer.png"; // tu osito señalador

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function SizeGuide() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiPath("/sizetables"))
      .then((res) => res.json())
      .then((data) => {
        setTables(data.filter((t) => t.active));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando tablas:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="size-guide">
      <div className="size-guide-wrap">
        {/* Tablas centradas */}
        <div className="tables-side">
          <h2>Guía de Talles</h2>

          {loading ? (
            <p className="loading-text">Cargando tablas de talles...</p>
          ) : (
            <>
              {tables.map((table) => (
                <div key={table._id} className="size-table">
                  <h3>{table.displayName}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th></th>
                        {table.sizes.map((size) => (
                          <th key={size}>{size}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.measurements.map((measurement) => (
                        <tr key={measurement.name}>
                          <td>{measurement.name}</td>
                          {table.sizes.map((size) => (
                            <td key={size}>{measurement.values[size] || "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}

          <p className="note">
            * Las medidas pueden variar +/- 1 a 2cm<br />
            * Para obtener la circunferencia total del pecho multiplicar esta medida x2
          </p>
        </div>

        {/* Oso independiente a la izquierda del bloque centrado */}
        <aside className="bear-side">
          <div className="bear-wrapper">
            <div className="bear-comment">
              Recordá que las medidas pueden variar +/- 1 a 2cm
            </div>
            <img src={bearPointer} alt="Osito señalando talles" />
          </div>
        </aside>
      </div>
    </section>
  );
}
