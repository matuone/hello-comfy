import { Link } from "react-router-dom";
import "../styles/checkoutsuccess.css";

export default function CheckoutSuccess() {
  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>

        <h1 className="success-title">¡Gracias por tu compra!</h1>
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
