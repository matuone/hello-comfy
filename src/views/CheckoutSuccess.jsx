import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/checkoutsuccess.css";

export default function CheckoutSuccess() {
  const [orderCode, setOrderCode] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const { clearCart } = useCart();

  useEffect(() => {
    // Obtener código de orden desde localStorage
    const lastOrder = localStorage.getItem("lastOrderCode");
    if (lastOrder) {
      setOrderCode(lastOrder);
    }

    // Obtener nombre del cliente desde pendingOrder antes de limpiarlo
    const pendingOrder = localStorage.getItem("pendingOrder");
    if (pendingOrder) {
      try {
        const orderData = JSON.parse(pendingOrder);
        const name = orderData?.formData?.name || "";
        setCustomerName(name);
      } catch (err) {
        console.error("Error parsing pendingOrder:", err);
      }
    }

    // Limpiar carrito
    clearCart();

    // Limpiar checkout del localStorage al llegar a la página de éxito
    localStorage.removeItem("checkoutStep");
    localStorage.removeItem("checkoutFormData");
    localStorage.removeItem("pendingOrder");
    localStorage.removeItem("lastOrderCode");
  }, [clearCart]);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>

        {customerName && (
          <h2 className="customer-name">{customerName}</h2>
        )}

        <h1 className="success-title">¡Muchas gracias por tu compra!</h1>
        
        {orderCode && (
          <p className="order-number">
            Tu número de orden es: <strong>#{orderCode}</strong>
          </p>
        )}
        
        <p className="success-subtitle">
          Tu pedido fue recibido y está siendo procesado.
        </p>

        <div className="success-info">
          <p>En breve vas a recibir un email con todos los detalles.</p>
          <p>Si elegiste Pick Up Point, te avisamos cuando esté listo para retirar.</p>
          <p>Si elegiste envío a domicilio, te notificamos cuando salga en camino.</p>
        </div>

        <Link to="/products" className="success-btn">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
