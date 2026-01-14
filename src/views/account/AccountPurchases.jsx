import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/account/accountpurchases.css";

export default function AccountPurchases() {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================
  // FETCH DE ÓRDENES
  // ============================
  useEffect(() => {
    if (!user || !token) return;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders/my-orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Error al cargar las órdenes");
          setLoading(false);
          return;
        }

        setOrders(data.orders || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Error de conexión al cargar las órdenes");
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, token]);

  // ============================
  // FUNCIONES AUXILIARES
  // ============================
  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#FFC107"; // Amarillo
      case "processing":
      case "preparing":
        return "#FF9800"; // Naranja
      case "shipped":
        return "#2196F3"; // Azul
      case "delivered":
        return "#4CAF50"; // Verde
      default:
        return "#757575"; // Gris oscuro
    }
  }

  function getStatusLabel(status) {
    const labels = {
      pending: "Pendiente",
      processing: "Preparando",
      preparing: "Preparando",
      shipped: "Enviado",
      delivered: "Entregado",
    };
    return labels[status?.toLowerCase()] || status;
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);
  }

  if (loading) {
    return (
      <div className="purchases-container">
        <div className="purchases-card">
          <p className="loading">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="purchases-container">
      <div className="purchases-card">
        <h1>Mis Compras</h1>

        {error && <div className="purchases-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="purchases-empty">
            <p>No tienes órdenes aún</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-item">
                {/* ENCABEZADO DE LA ORDEN */}
                <div className="order-header">
                  <div className="order-info">
                    <h3>Orden #{order.orderNumber || order._id.slice(-8).toUpperCase()}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* ITEMS DE LA ORDEN */}
                <div className="order-items">
                  <h4>Productos:</h4>
                  {order.items && order.items.length > 0 ? (
                    <div className="items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <div className="item-details">
                            <p className="item-name">{item.productName || "Producto"}</p>
                            <p className="item-meta">
                              Cantidad: {item.quantity} | Talla: {item.size || "N/A"}
                            </p>
                          </div>
                          <div className="item-price">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-items">Sin detalles de items</p>
                  )}
                </div>

                {/* RESUMEN DE COSTOS */}
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.totals?.subtotal)}</span>
                  </div>

                  {order.totals?.shipping > 0 && (
                    <div className="summary-row">
                      <span>Envío:</span>
                      <span>{formatCurrency(order.totals.shipping)}</span>
                    </div>
                  )}

                  {order.totals?.discount > 0 && (
                    <div className="summary-row discount">
                      <span>Descuento:</span>
                      <span>-{formatCurrency(order.totals.discount)}</span>
                    </div>
                  )}

                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>{formatCurrency(order.totals?.total)}</span>
                  </div>
                </div>

                {/* INFORMACIÓN DE ENVÍO */}
                {order.shipping && (
                  <div className="order-shipping">
                    <h4>📦 Información de Envío</h4>
                    <p className="shipping-method">
                      {order.shipping.method === "home" && "🏠 Envío a domicilio"}
                      {order.shipping.method === "pickup" && "📍 Retiro en sucursal"}
                      {order.shipping.method !== "home" && order.shipping.method !== "pickup" && order.shipping.method}
                    </p>
                    {order.shipping.tracking && (
                      <p className="tracking">
                        📦 Número de seguimiento: <code>{order.shipping.tracking}</code>
                      </p>
                    )}
                    {order.shipping.address && (
                      <p className="delivery-address">
                        📍 Dirección: {order.shipping.address}
                      </p>
                    )}
                    {order.shipping.pickPoint && (
                      <p className="delivery-address">
                        📍 Punto de retiro: {order.shipping.pickPoint}
                      </p>
                    )}
                    {order.shipping.eta && (
                      <p className="delivery-date">
                        📅 Entrega estimada: {formatDate(order.shipping.eta)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
