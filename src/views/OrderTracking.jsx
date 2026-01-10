import { useState } from "react";
import "../styles/ordertracking.css";
import OrderTimeline from "../components/OrderTimeline";

export default function OrderTracking() {
  const [orderCode, setOrderCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    setError("");
    setOrderData(null);

    if (!orderCode.trim() || !email.trim()) {
      setError("Ingresá el código de pedido y tu email.");
      return;
    }

    setLoading(true);

    // 🔧 Simulación temporal (después lo conectamos al backend real)
    setTimeout(() => {
      setOrderData({
        code: orderCode.toUpperCase(),
        status: "preparando",
        statusLabel: "Preparando tu pedido",
        date: "10/01/2026",
        shippingMethod: "pickup",
        pickPoint: "aquelarre",
        eta: "3 a 5 días hábiles",
        items: [
          { name: "Remera Comfy Sakura", quantity: 2 },
          { name: "Tote Bag Aquelarre", quantity: 1 },
        ],
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="ot-container">
      <div className="ot-card">
        <h1 className="ot-title">Seguimiento de pedido</h1>
        <p className="ot-subtitle">
          Ingresá tu código de pedido y el email con el que realizaste la compra.
        </p>

        <div className="ot-form">
          <div className="ot-form-group">
            <label>Código de pedido</label>
            <input
              type="text"
              placeholder="Ej: HC-12345"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
            />
          </div>

          <div className="ot-form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="ot-error">{error}</p>}

          <button
            className="ot-btn"
            onClick={handleTrack}
            disabled={loading}
          >
            {loading ? "Buscando pedido..." : "Ver estado"}
          </button>
        </div>

        {orderData && (
          <div className="ot-result">
            <h2>Estado de tu pedido</h2>

            <OrderTimeline status={orderData.status} />

            <div className="ot-result-header">
              <p><strong>Código:</strong> {orderData.code}</p>
            </div>

            <p><strong>Fecha de compra:</strong> {orderData.date}</p>

            <p>
              <strong>Método de envío:</strong>{" "}
              {orderData.shippingMethod === "pickup"
                ? "Retiro en Pick Up Point"
                : "Envío a domicilio"}
            </p>

            {orderData.shippingMethod === "pickup" && (
              <p>
                <strong>Punto de retiro:</strong>{" "}
                {orderData.pickPoint === "aquelarre"
                  ? "Aquelarre — CABA"
                  : orderData.pickPoint === "temperley"
                    ? "Temperley — ZS-GBA"
                    : orderData.pickPoint}
              </p>
            )}

            <p><strong>Entrega estimada:</strong> {orderData.eta}</p>

            <h3>Productos</h3>
            <ul className="ot-items">
              {orderData.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} x{item.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
