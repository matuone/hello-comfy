// src/views/PaymentFailure.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function PaymentFailure() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("El pago fue rechazado. Por favor, intenta nuevamente.");

    // Redirigir al checkout después de 3 segundos
    const timer = setTimeout(() => {
      navigate("/checkout");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-result-container">
      <div className="payment-result-box failure">
        <div className="payment-result-icon">❌</div>
        <h1>Pago rechazado</h1>
        <p>Lo sentimos, tu pago no pudo ser procesado.</p>
        <p className="redirect-text">Serás redirigido al checkout en unos momentos.</p>
      </div>
    </div>
  );
}
