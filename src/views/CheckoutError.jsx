import { Link } from "react-router-dom";
import "../styles/checkouterror.css";

export default function CheckoutError() {
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon">!</div>

        <h1 className="error-title">Algo salió mal</h1>
        <p className="error-subtitle">
          No pudimos procesar tu compra en este momento.
        </p>

        <div className="error-info">
          <p>Puede haber sido un problema de conexión o un error del sistema.</p>
          <p>No te preocupes, tu carrito sigue intacto.</p>
          <p>Podés intentar nuevamente en unos segundos.</p>
        </div>

        <div className="error-actions">
          <Link to="/checkout" className="error-btn">
            Reintentar compra
          </Link>

          <Link to="/products" className="error-btn-secondary">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
