import { useEffect, useState } from "react";
import "../styles/adminstats.css";

// Chart.js
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const PIE_COLORS = ["#d94f7a", "#ffb74d", "#81c784", "#64b5f6", "#ba68c8", "#ff7043", "#26c6da"];

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch(apiPath("/admin/stats"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar estadísticas");
        return res.json();
      })
      .then((data) => { setStats(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="admin-section">
      <h2 className="admin-section-title">Estadísticas</h2>
      <p style={{ color: "#888" }}>Cargando datos reales...</p>
    </div>
  );

  if (error) return (
    <div className="admin-section">
      <h2 className="admin-section-title">Estadísticas</h2>
      <p style={{ color: "#d94f7a" }}>Error: {error}</p>
    </div>
  );

  // Gráfico de línea: facturación + órdenes por mes
  const lineData = {
    labels: MESES,
    datasets: [
      {
        label: "Facturación ($)",
        data: stats.ventasPorMes,
        borderColor: "#d94f7a",
        backgroundColor: "rgba(217,79,122,0.13)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        yAxisID: "y",
      },
      {
        label: "Órdenes",
        data: stats.ordenesPorMes,
        borderColor: "#64b5f6",
        backgroundColor: "rgba(100,181,246,0.08)",
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        yAxisID: "y2",
      },
    ],
  };
  const lineOptions = {
    maintainAspectRatio: false,
    scales: {
      y: { ticks: { callback: (v) => `$${v.toLocaleString("es-AR")}` } },
      y2: { position: "right", grid: { drawOnChartArea: false }, ticks: { stepSize: 1 } },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => ctx.datasetIndex === 0
            ? `$${ctx.raw.toLocaleString("es-AR")}`
            : `${ctx.raw} órdenes`,
        },
      },
    },
  };

  // Torta envíos
  const envioLabels = Object.keys(stats.envioMetodos);
  const pieEnvioData = {
    labels: envioLabels,
    datasets: [{ data: Object.values(stats.envioMetodos), backgroundColor: PIE_COLORS }],
  };

  // Torta pagos
  const pagoLabels = Object.keys(stats.pagoMetodos);
  const piePagoData = {
    labels: pagoLabels,
    datasets: [{ data: Object.values(stats.pagoMetodos), backgroundColor: [...PIE_COLORS].reverse() }],
  };

  const pieOptions = { maintainAspectRatio: false };

  // Barras horizontales: productos más vendidos
  const barData = {
    labels: stats.topProductos.map((p) => p.nombre.length > 28 ? p.nombre.slice(0, 26) + "…" : p.nombre),
    datasets: [{ label: "Unidades", data: stats.topProductos.map((p) => p.cantidad), backgroundColor: "#d94f7a", borderRadius: 6 }],
  };
  const barOptions = {
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { stepSize: 1 } } },
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Estadísticas</h2>
      <p className="admin-section-text">
        Datos reales del negocio — año {new Date().getFullYear()}.
      </p>

      {/* KPIs */}
      <div className="stats-kpi-grid">
        <div className="kpi-box">
          <span className="kpi-label">Total de ventas</span>
          <span className="kpi-value">{stats.totalVentas}</span>
        </div>
        <div className="kpi-box">
          <span className="kpi-label">Facturado total</span>
          <span className="kpi-value">${stats.totalFacturado.toLocaleString("es-AR")}</span>
        </div>
        <div className="kpi-box">
          <span className="kpi-label">Facturado este mes</span>
          <span className="kpi-value">${stats.facturadoMes.toLocaleString("es-AR")}</span>
        </div>
        <div className="kpi-box">
          <span className="kpi-label">Enviadas</span>
          <span className="kpi-value">{stats.ventasEnviadas}</span>
        </div>
        <div className="kpi-box">
          <span className="kpi-label">Pendientes de envío</span>
          <span className="kpi-value">{stats.ventasPendientes}</span>
        </div>
        <div className="kpi-box">
          <span className="kpi-label">Cliente del mes</span>
          <span className="kpi-value" style={{ fontSize: "1rem" }}>
            {stats.topClienteMes ? stats.topClienteMes.nombre : "—"}
          </span>
          {stats.topClienteMes && (
            <span className="kpi-sub">
              ${stats.topClienteMes.total.toLocaleString("es-AR")} &middot;{" "}
              {stats.topClienteMes.ordenes}{" "}
              {stats.topClienteMes.ordenes === 1 ? "orden" : "órdenes"}
            </span>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <div className="stats-graphs-grid">
        <div className="graph-box" style={{ gridColumn: "1 / -1" }}>
          <h3>Facturación y órdenes por mes ({new Date().getFullYear()})</h3>
          <Line data={lineData} options={lineOptions} />
        </div>

        <div className="graph-box">
          <h3>Productos más vendidos</h3>
          <Bar data={barData} options={barOptions} />
        </div>

        <div className="graph-box">
          <h3>Métodos de pago</h3>
          {pagoLabels.length > 0
            ? <Pie data={piePagoData} options={pieOptions} />
            : <p style={{ color: "#aaa", marginTop: 20 }}>Sin datos</p>}
        </div>

        <div className="graph-box">
          <h3>Métodos de envío</h3>
          {envioLabels.length > 0
            ? <Pie data={pieEnvioData} options={pieOptions} />
            : <p style={{ color: "#aaa", marginTop: 20 }}>Sin datos</p>}
        </div>
      </div>
    </div>
  );
}
