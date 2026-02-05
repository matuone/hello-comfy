import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "../styles/orderdetails.css";
import OrderTimeline from "../components/OrderTimeline";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function OrderDetails() {
  const { id, code } = useParams();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email"); // para pedidos sin cuenta
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPublic = Boolean(code); // /orden/:code
  const isPrivate = Boolean(id);  // /mi-cuenta/orden/:id

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        let url = "";

        if (isPublic) {
          if (!email) {
            setError("Email requerido para ver este pedido.");
            setLoading(false);
            return;
          }
          url = apiPath(`/orders/${code}?email=${email}`);
        }

        if (isPrivate) {
          url = apiPath(`/orders/private/${id}`);
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Error obteniendo pedido");
          setLoading(false);
          return;
        }

        setOrder(data);
      } catch (err) {
        setError("Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [code, id, email, isPublic, isPrivate]);

  if (loading) {
    return (
      <div className="od-container">
        <div className="od-card">Cargando pedido...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="od-container">
        <div className="od-card od-error">{error}</div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="od-container">
      <div className="od-card">
        <h1 className="od-title">Detalle del pedido</h1>
        <p className="od-code">Orden: {order.code}</p>

        <OrderTimeline status={order.status} />

        <div className="od-section">
          <h2>Estado</h2>
          <p className="od-status">{order.status}</p>
          <p><strong>Fecha:</strong> {order.date}</p>
          <p><strong>Entrega estimada:</strong> {order.eta}</p>
        </div>

        <div className="od-section">
          <h2>Envío</h2>
          {order.shippingMethod === "home" && (
            <p><strong>Envío a domicilio</strong></p>
          )}

          {order.shippingMethod === "pickup" && (
            <p>
              <strong>Pick Up Point:</strong>{" "}
              {order.pickPoint === "aquelarre"
                ? "Aquelarre — CABA"
                : order.pickPoint === "temperley"
                  ? "Temperley — ZS-GBA"
                  : order.pickPoint}
            </p>
          )}
        </div>

        <div className="od-section">
          <h2>Productos</h2>
          <ul className="od-items">
            {order.items.map((item, idx) => (
              <li key={idx} className="od-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p className="od-item-name">{item.name}</p>
                  <p>Cantidad: {item.quantity}</p>
                  <p>Precio: ${item.price.toLocaleString("es-AR")}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="od-section">
          <h2>Totales</h2>
          <p><strong>Subtotal:</strong> ${order.totals.subtotal.toLocaleString("es-AR")}</p>
          <p><strong>Envío:</strong> ${order.totals.shipping.toLocaleString("es-AR")}</p>
          {order.totals.discount > 0 && (
            <p><strong>Descuento:</strong> -${order.totals.discount.toLocaleString("es-AR")}</p>
          )}
          <p className="od-total">
            <strong>Total:</strong> ${order.totals.total.toLocaleString("es-AR")}
          </p>
        </div>
      </div>
    </div>
  );
}
