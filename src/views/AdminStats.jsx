import "../styles/adminstats.css";
import { salesData } from "../data/salesData";

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
} from "chart.js";

import { Line, Pie, Bar } from "react-chartjs-2";

// Registrar componentes de Chart.js
ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

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

  // ============================
  // VENTAS POR MES (GRÁFICO LÍNEA)
  // ============================
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  const ventasPorMes = new Array(12).fill(0);

  salesData.forEach(v => {
    const fecha = new Date(v.fecha);
    const mes = fecha.getMonth();
    const monto = Number(String(v.total).replace(/[^0-9.-]+/g, ""));
    ventasPorMes[mes] += monto;
  });

  const lineData = {
    labels: meses,
    datasets: [
      {
        label: "Facturación mensual",
        data: ventasPorMes,
        borderColor: "#d94f7a",
        backgroundColor: "rgba(217, 79, 122, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // ============================
  // MÉTODOS DE ENVÍO (GRÁFICO TORTA)
  // ============================
  const metodos = {
    andreani: 0,
    correo: 0,
    retiro_temperley: 0,
    retiro_aquelarre: 0,
    nextday_moto: 0,
  };

  salesData.forEach(v => {
    if (metodos[v.shippingMethod] !== undefined) {
      metodos[v.shippingMethod]++;
    }
  });

  const pieData = {
    labels: [
      "Andreani",
      "Correo Argentino",
      "Retiro Temperley",
      "Retiro Aquelarre",
      "Next Day Moto"
    ],
    datasets: [
      {
        data: Object.values(metodos),
        backgroundColor: [
          "#d94f7a",
          "#ffb74d",
          "#81c784",
          "#64b5f6",
          "#ba68c8",
        ],
      },
    ],
  };

  // ============================
  // PRODUCTOS MÁS VENDIDOS (GRÁFICO BARRAS)
  // ============================
  const productos = {};

  salesData.forEach(v => {
    v.items.forEach(item => {
      if (!productos[item.nombre]) {
        productos[item.nombre] = 0;
      }
      productos[item.nombre] += item.cantidad;
    });
  });

  const topProductos = Object.entries(productos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const barData = {
    labels: topProductos.map(p => p[0]),
    datasets: [
      {
        label: "Unidades vendidas",
        data: topProductos.map(p => p[1]),
        backgroundColor: "#d94f7a",
      },
    ],
  };

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
          GRÁFICOS EN GRID
      ============================ */}
      <div className="stats-graphs-grid">

        <div className="graph-box">
          <h3>Facturación por mes</h3>
          <Line data={lineData} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="graph-box">
          <h3>Métodos de envío</h3>
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="graph-box">
          <h3>Productos más vendidos</h3>
          <Bar data={barData} options={{ maintainAspectRatio: false }} />
        </div>

      </div>
    </div>
  );
}
