import { useState } from "react";
import "../styles/adminpanel.css"; // <--- IMPORTANTE

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

// Registrar componentes de Chart.js
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
  const [selectedCategory, setSelectedCategory] = useState("general");

  // ============================
  // DATOS DE VENTAS (ejemplo)
  // ============================
  const [ventas, setVentas] = useState([
    {
      id: "A001",
      nombre: "María López",
      medioPago: "mercadopago",
      envio: "Andreani",
      fecha: "2025-01-24",
      regalo: true,
      pagoRecibido: true,
      productos: [
        { nombre: "Remera Osito Rosa", cantidad: 1 },
        { nombre: "Sticker Pack Cute", cantidad: 2 },
      ],
    },
    {
      id: "A002",
      nombre: "Juan Pérez",
      medioPago: "transferencia",
      envio: "Pick up Temperley",
      fecha: "2025-01-24",
      regalo: false,
      pagoRecibido: false,
      productos: [{ nombre: "Buzo HelloComfy", cantidad: 1 }],
    },
    {
      id: "A003",
      nombre: "Lucía Fernández",
      medioPago: "cuenta dni",
      envio: "Correo Argentino",
      fecha: "2025-01-23",
      regalo: false,
      pagoRecibido: true,
      productos: [
        { nombre: "Taza Osito", cantidad: 1 },
        { nombre: "Almohadón Cute", cantidad: 1 },
      ],
    },
  ]);

  // ============================
  // TOGGLE PAGO RECIBIDO
  // ============================
  function togglePago(id) {
    setVentas((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, pagoRecibido: !v.pagoRecibido } : v
      )
    );
  }

  // ============================
  // CATEGORÍAS
  // ============================
  const categories = [
    { id: "general", name: "General" },
    { id: "indumentaria", name: "Indumentaria" },
    { id: "cute-items", name: "Cute Items" },
    { id: "merch", name: "Merch" },
    { id: "accesorios", name: "Accesorios" },
    { id: "hogar", name: "Hogar" },
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
    <div className="admin-dashboard">

      <div className="admin-dashboard-layout">

        {/* SIDEBAR */}
        <aside className="admin-categories-sidebar">
          <h3 className="sidebar-title">Categorías</h3>

          <ul className="sidebar-list">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className={`sidebar-item ${selectedCategory === cat.id ? "active" : ""
                  }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-dashboard-content">

          <div className="admin-header">
            <h1 className="admin-title">Panel de Control</h1>
            <p className="admin-welcome">Bienvenido al panel administrativo</p>
          </div>

          {/* ============================
              GRÁFICOS (PRIMERO)
          ============================ */}
          <section className="admin-graphs">
            <div className="graph-card">
              <h3>Ventas semanales</h3>
              <Line data={dataSemanal} />
            </div>

            <div className="graph-card">
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
                    <p><strong>Medio de pago:</strong> {venta.medioPago}</p>
                    <p><strong>Envío:</strong> {venta.envio}</p>
                    <p><strong>Fecha:</strong> {venta.fecha}</p>
                    <p>
                      <strong>Regalo:</strong>{" "}
                      {venta.regalo ? "Sí 🎁" : "No"}
                    </p>

                    {/* PRODUCTOS */}
                    <div className="venta-productos">
                      <strong>Productos:</strong>
                      <ul>
                        {venta.productos.map((prod, index) => (
                          <li key={index}>
                            {prod.nombre} — x{prod.cantidad}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* BOTÓN SOLO PARA TRANSFERENCIA */}
                  {venta.medioPago === "transferencia" && (
                    <button
                      className={`pago-btn ${venta.pagoRecibido ? "pagado" : ""
                        }`}
                      onClick={() => togglePago(venta.id)}
                    >
                      {venta.pagoRecibido
                        ? "Pago recibido ✔"
                        : "Marcar pago recibido"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ============================
              INFO POR CATEGORÍA
          ============================ */}
          <section className="admin-section">
            <h2 className="section-title">
              Información de: {selectedCategory}
            </h2>

            <div className="category-info-box">
              <p>
                Aquí se mostrará la información de la categoría seleccionada:
                <strong> {selectedCategory}</strong>
              </p>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
