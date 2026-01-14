import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/account/accountpurchases.css";

export default function AccountPurchases() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================
  // CARGAR ÓRDENES DEL USUARIO
  // ============================
  useEffect(() => {
    async function fetchOrders() {
      try {
        // Verificar que hay token
        if (!token) {
          setError("Token no disponible");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Si la respuesta no es OK, intenta parsear como JSON
        if (!res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            setError(data.error || `Error: ${res.status}`);
          } catch {
            setError(`Error ${res.status}: ${text.substring(0, 100)}`);
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setOrders(data.orders || []);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(`Error al conectar: ${err.message}`);
        setLoading(false);
      }
    }

    fetchOrders();
  }, [token]);

  // ============================
  // RENDER ESTADOS
  // ============================
  if (loading) {
    return (
      <div className="account-purchases">
        <h2>Mis Compras</h2>
        <p className="loading">Cargando compras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-purchases">
        <h2>Mis Compras</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="account-purchases">
        <h2>Mis Compras</h2>
        <p className="empty">No tienes compras aún</p>
      </div>
    );
  }

  // ============================
  // OBTENER COLOR DE ESTADO
  // ============================
  function getStatusColor(status) {
    const colors = {
      recibido: "#ffa500",
      preparando: "#4169e1",
      en_camino: "#32cd32",
      listo_retirar: "#9370db",
      entregado: "#228b22",
      cancelado: "#ff0000",
    };
    return colors[status] || "#999";
  }

  // ============================
  // OBTENER ICONO DE ESTADO
  // ============================
  function getStatusIcon(status) {
    const icons = {
      recibido: "📦",
      preparando: "⚙️",
      en_camino: "🚚",
      listo_retirar: "🏪",
      entregado: "✅",
      cancelado: "❌",
    };
    return icons[status] || "📦";
  }

  return (
    <div className="account-purchases">
      <h2>Mis Compras</h2>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            {/* ENCABEZADO */}
            <div className="order-header">
              <div>
                <h3>Pedido #{order.code}</h3>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="order-status">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusIcon(order.status)} {order.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* ITEMS */}
            <div className="order-items">
              <h4>Productos</h4>
              {order.items.map((item, idx) => (
                <div key={idx} className="item-row">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="item-image" />
                  )}
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-quantity">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="item-price">${item.price.toLocaleString("es-AR")}</p>
                </div>
              ))}
            </div>

            {/* TOTALES */}
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${order.totals.subtotal.toLocaleString("es-AR")}</span>
              </div>
              {order.totals.shipping > 0 && (
                <div className="total-row">
                  <span>Envío:</span>
                  <span>${order.totals.shipping.toLocaleString("es-AR")}</span>
                </div>
              )}
              {order.totals.discount > 0 && (
                <div className="total-row">
                  <span>Descuento:</span>
                  <span>-${order.totals.discount.toLocaleString("es-AR")}</span>
                </div>
              )}
              <div className="total-row total">
                <span>Total:</span>
                <span>${order.totals.total.toLocaleString("es-AR")}</span>
              </div>
            </div>

            {/* ENVÍO */}
            <div className="order-shipping">
              <h4>Envío</h4>
              <p>
                <strong>Método:</strong>{" "}
                {order.shipping.method === "home" ? "Envío a domicilio" : "Retiro en punto"}
              </p>
              {order.shipping.address && (
                <p>
                  <strong>Dirección:</strong> {order.shipping.address}
                </p>
              )}
              {order.shipping.pickPoint && (
                <p>
                  <strong>Punto de retiro:</strong> {order.shipping.pickPoint}
                </p>
              )}
              {order.shipping.tracking && (
                <p>
                  <strong>Código de seguimiento:</strong> {order.shipping.tracking}
                </p>
              )}
            </div>

            {/* PAGO */}
            <div className="order-payment">
              <h4>Pago</h4>
              <p>
                <strong>Estado:</strong>{" "}
                <span
                  className={`payment-status ${
                    order.pagoEstado === "recibido" ? "paid" : "pending"
                  }`}
                >
                  {order.pagoEstado === "recibido" ? "✅ Recibido" : "⏳ Pendiente"}
                </span>
              </p>
            </div>

            {/* COMENTARIOS */}
            {order.comentarios && (
              <div className="order-comments">
                <h4>Comentarios</h4>
                <p>{order.comentarios}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
