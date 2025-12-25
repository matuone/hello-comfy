import { useState } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/adminpanel.css";

export default function AdminOrders() {
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

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="admin-header">
        <h1 className="admin-title">Ventas</h1>
        <p className="admin-welcome">Gestión completa de pedidos</p>
      </div>

      {/* ============================
          LISTA DE VENTAS
      ============================ */}
      <section className="admin-section">
        <h2 className="section-title">Pedidos</h2>

        <div className="ventas-lista">
          {ventas.map((venta) => (
            <div key={venta.id} className="venta-item">

              {/* INFO */}
              <div className="venta-info">
                <p><strong>ID:</strong> {venta.id}</p>
                <p><strong>Cliente:</strong> {venta.nombre}</p>
                <p><strong>Medio de pago:</strong> {venta.medioPago}</p>
                <p><strong>Envío:</strong> {venta.envio}</p>
                <p><strong>Fecha:</strong> {venta.fecha}</p>
                <p><strong>Regalo:</strong> {venta.regalo ? "Sí 🎁" : "No"}</p>

                {/* ESTADO DEL PAGO */}
                <div
                  className={`estado-pago ${venta.pagoRecibido ? "pago-ok" : "pago-pendiente"
                    }`}
                >
                  {venta.pagoRecibido ? "Pago recibido" : "Pago pendiente"}
                </div>

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
                    className={`pago-btn ${venta.pagoRecibido ? "pagado" : ""
                      }`}
                    onClick={() => togglePago(venta.id)}
                  >
                    {venta.pagoRecibido
                      ? "Pago recibido ✔"
                      : "Marcar pago recibido"}
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

      {/* ============================
          POPUP TRACKING
      ============================ */}
      {trackingPopup && (
        <div className="popup-overlay" onClick={() => setTrackingPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setTrackingPopup(false)}>✖</button>

            <h2>Ingresar número de seguimiento</h2>

            <input
              type="text"
              className="tracking-input"
              placeholder="Ej: AND123456789"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
            />

            <button className="btn-guardar" onClick={guardarTracking}>
              Guardar tracking
            </button>
          </div>
        </div>
      )}

      {/* ============================
          POPUP ETIQUETA
      ============================ */}
      {etiquetaPopup && (
        <div className="popup-overlay" onClick={() => setEtiquetaPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setEtiquetaPopup(false)}>✖</button>

            <h2>Generar etiqueta de envío</h2>
            <p>Acá podés generar la etiqueta PDF o conectarlo con Andreani / Correo.</p>

            <button className="btn-guardar">Generar PDF</button>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
