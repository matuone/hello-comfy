import { useState } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function AdminPanel() {
  // ============================
  // POPUP GRÁFICOS
  // ============================
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupChart, setPopupChart] = useState(null);

  function abrirPopup(tipo) {
    setPopupChart(tipo);
    setPopupOpen(true);
  }

  function cerrarPopup() {
    setPopupOpen(false);
    setPopupChart(null);
  }

  // ============================
  // DATOS DE EJEMPLO (VENTAS)
  // ============================
  const ventas = [
    {
      id: "A001",
      nombre: "María López",
      fecha: "2025-01-24",
      total: 12500,
    },
    {
      id: "A002",
      nombre: "Juan Pérez",
      fecha: "2025-01-24",
      total: 8900,
    },
    {
      id: "A003",
      nombre: "Lucía Fernández",
      fecha: "2025-01-23",
      total: 15200,
    },
  ];

  // ============================
  // GRÁFICO SEMANAL
  // ============================
  const dataSemanal = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [
      {
        label: "Ventas ($)",
        data: [12000, 15000, 11000, 18000, 17000, 14000, 16000],
        borderColor: "#d94f7a",
        backgroundColor: "rgba(217, 79, 122, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // ============================
  // GRÁFICO MENSUAL
  // ============================
  const dataMensual = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Ventas ($)",
        data: [80000, 120000, 95000, 150000, 170000, 200000],
        backgroundColor: "#d94f7a",
      },
    ],
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="admin-header">
        <h1 className="admin-title">Panel General</h1>
        <p className="admin-welcome">Resumen general del negocio</p>
      </div>

      {/* ============================
          GRÁFICOS
      ============================ */}
      <section className="admin-graphs">
        <div className="graph-card" onClick={() => abrirPopup("semanal")}>
          <h3>Ventas semanales</h3>
          <Line data={dataSemanal} />
        </div>

        <div className="graph-card" onClick={() => abrirPopup("mensual")}>
          <h3>Ventas mensuales</h3>
          <Bar data={dataMensual} />
        </div>
      </section>

      {/* ============================
          ÚLTIMAS VENTAS
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Últimas ventas</h2>

        <div className="ventas-lista">
          {ventas.map((venta) => (
            <div key={venta.id} className="venta-item">
              <div className="venta-info">
                <p><strong>ID:</strong> {venta.id}</p>
                <p><strong>Cliente:</strong> {venta.nombre}</p>
                <p><strong>Fecha:</strong> {venta.fecha}</p>
                <p><strong>Total:</strong> ${venta.total}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================
          POPUP GRÁFICOS
      ============================ */}
      {popupOpen && (
        <div className="popup-overlay" onClick={cerrarPopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={cerrarPopup}>✖</button>

            {popupChart === "semanal" && (
              <>
                <h2>Ventas semanales</h2>
                <Line data={dataSemanal} height={200} />
              </>
            )}

            {popupChart === "mensual" && (
              <>
                <h2>Ventas mensuales</h2>
                <Bar data={dataMensual} height={200} />
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
