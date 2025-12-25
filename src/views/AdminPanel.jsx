import { useState } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState("general");

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
  // POPUP TRACKING
  // ============================
  const [trackingPopup, setTrackingPopup] = useState(false);
  const [trackingVenta, setTrackingVenta] = useState(null);
  const [trackingInput, setTrackingInput] = useState("");

  function abrirTracking(venta) {
    setTrackingVenta(venta);
    setTrackingInput(venta.tracking || "");
    setTrackingPopup(true);
  }

  function guardarTracking() {
    setVentas(prev =>
      prev.map(v =>
        v.id === trackingVenta.id ? { ...v, tracking: trackingInput } : v
      )
    );
    setTrackingPopup(false);
  }

  // ============================
  // POPUP ETIQUETA
  // ============================
  const [etiquetaPopup, setEtiquetaPopup] = useState(false);
  const [etiquetaVenta, setEtiquetaVenta] = useState(null);

  function abrirEtiqueta(venta) {
    setEtiquetaVenta(venta);
    setEtiquetaPopup(true);
  }

  // ============================
  // DATOS DE VENTAS
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
      tracking: "",
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
      tracking: "",
      productos: [{ nombre: "Buzo HelloComfy", cantidad: 1 }],
    },
  ]);

  // ============================
  // ACCIONES
  // ============================
  function togglePago(id) {
    setVentas(prev =>
      prev.map(v =>
        v.id === id ? { ...v, pagoRecibido: !v.pagoRecibido } : v
      )
    );
  }

  function cancelarPedido(venta) {
    alert(`Se enviará email a ${venta.nombre} para cancelar el pedido.`);
    // Aquí conectás tu backend para enviar email
  }

  function borrarPedido(id) {
    if (confirm("¿Seguro que querés borrar este pedido?")) {
      setVentas(prev => prev.filter(v => v.id !== id));
    }
  }

  // ============================
  // GRÁFICOS
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
            {["general", "indumentaria", "cute-items", "merch", "accesorios", "hogar"].map(cat => (
              <li
                key={cat}
                className={`sidebar-item ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        {/* CONTENIDO */}
        <main className="admin-dashboard-content">

          <div className="admin-header">
            <h1 className="admin-title">Panel de Control</h1>
            <p className="admin-welcome">Bienvenido al panel administrativo</p>
          </div>

          {/* GRÁFICOS */}
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

          {/* VENTAS */}
          <section className="admin-section">
            <h2 className="section-title">Últimas ventas</h2>

            <div className="ventas-lista">
              {ventas.map(venta => (
                <div key={venta.id} className="venta-item">

                  <div className="venta-info">
                    <p><strong>ID:</strong> {venta.id}</p>
                    <p><strong>Cliente:</strong> {venta.nombre}</p>
                    <p><strong>Medio de pago:</strong> {venta.medioPago}</p>
                    <p><strong>Envío:</strong> {venta.envio}</p>
                    <p><strong>Fecha:</strong> {venta.fecha}</p>
                    <p><strong>Regalo:</strong> {venta.regalo ? "Sí 🎁" : "No"}</p>

                    {/* ESTADO DEL PAGO */}
                    <div className={`estado-pago ${venta.pagoRecibido ? "pago-ok" : "pago-pendiente"}`}>
                      {venta.pagoRecibido ? "Pago recibido" : "Pago pendiente"}
                    </div>

                    {/* PRODUCTOS */}
                    <div className="venta-productos">
                      <strong>Productos:</strong>
                      <ul>
                        {venta.productos.map((prod, i) => (
                          <li key={i}>{prod.nombre} — x{prod.cantidad}</li>
                        ))}
                      </ul>
                    </div>

                    {/* TRACKING */}
                    {venta.tracking && (
                      <p className="tracking-info">
                        <strong>Tracking:</strong> {venta.tracking}
                      </p>
                    )}
                  </div>

                  {/* BOTONES */}
                  <div className="venta-botones">

                    {venta.medioPago === "transferencia" && (
                      <button
                        className={`pago-btn ${venta.pagoRecibido ? "pagado" : ""}`}
                        onClick={() => togglePago(venta.id)}
                      >
                        {venta.pagoRecibido ? "Pago recibido ✔" : "Marcar pago recibido"}
                      </button>
                    )}

                    <button className="btn-cancelar" onClick={() => cancelarPedido(venta)}>
                      Cancelar pedido
                    </button>

                    <button className="btn-etiqueta" onClick={() => abrirEtiqueta(venta)}>
                      Generar etiqueta
                    </button>

                    <button className="btn-tracking" onClick={() => abrirTracking(venta)}>
                      Ingresar tracking
                    </button>

                    <button className="btn-borrar" onClick={() => borrarPedido(venta.id)}>
                      Borrar pedido
                    </button>

                  </div>

                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* POPUP GRÁFICOS */}
      {popupOpen && (
        <div className="popup-overlay" onClick={cerrarPopup}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
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

      {/* POPUP TRACKING */}
      {trackingPopup && (
        <div className="popup-overlay" onClick={() => setTrackingPopup(false)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setTrackingPopup(false)}>✖</button>

            <h2>Ingresar número de seguimiento</h2>

            <input
              type="text"
              className="tracking-input"
              placeholder="Ej: AND123456789"
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
            />

            <button className="btn-guardar" onClick={guardarTracking}>
              Guardar tracking
            </button>
          </div>
        </div>
      )}

      {/* POPUP ETIQUETA */}
      {etiquetaPopup && (
        <div className="popup-overlay" onClick={() => setEtiquetaPopup(false)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setEtiquetaPopup(false)}>✖</button>

            <h2>Generar etiqueta de envío</h2>
            <p>Acá podés generar la etiqueta PDF o conectarlo con Andreani / Correo.</p>

            <button className="btn-guardar">Generar PDF</button>
          </div>
        </div>
      )}

    </div>
  );
}
