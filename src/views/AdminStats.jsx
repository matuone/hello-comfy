// src/views/AdminStats.jsx
import "../styles/adminstats.css";
import { salesData } from "../data/salesData";

export default function AdminStats() {
  // ============================
  // CÁLCULOS BASE
  // ============================
  const totalVentas = salesData.length;

  const totalFacturado = salesData.reduce((acc, v) => {
    const num = Number(String(v.total).replace(/[^0-9.-]+/g, ""));
    return acc + num;
  }, 0);

  const ventasEnviadas = salesData.filter(v => v.envioEstado === "enviado").length;

  const ventasPendientes = totalVentas - ventasEnviadas;

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Estadísticas</h2>
      <p className="admin-section-text">
        Resumen general del rendimiento del emprendimiento.
      </p>

      {/* ============================
          KPIs PRINCIPALES
      ============================ */}
      <div className="stats-kpi-grid">
        <div className="kpi-box">
          <span className="kpi-label">Total de ventas</span>
          <span className="kpi-value">{totalVentas}</span>
        </div>

        <div className="kpi-box">
          <span className="kpi-label">Facturado total</span>
          <span className="kpi-value">
            ${totalFacturado.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="kpi-box">
          <span className="kpi-label">Ventas enviadas</span>
          <span className="kpi-value">{ventasEnviadas}</span>
        </div>

        <div className="kpi-box">
          <span className="kpi-label">Pendientes de envío</span>
          <span className="kpi-value">{ventasPendientes}</span>
        </div>
      </div>

      {/* ============================
          GRÁFICOS (placeholder)
      ============================ */}
      <div className="stats-graphs">
        <div className="graph-box">
          <h3>Ventas por mes</h3>
          <p>Acá vamos a poner un gráfico de líneas.</p>
        </div>

        <div className="graph-box">
          <h3>Métodos de envío</h3>
          <p>Acá vamos a poner un gráfico de torta.</p>
        </div>

        <div className="graph-box">
          <h3>Productos más vendidos</h3>
          <p>Acá vamos a poner un gráfico de barras.</p>
        </div>
      </div>
    </div>
  );
}
