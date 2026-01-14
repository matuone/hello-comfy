// src/views/PaymentPending.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function PaymentPending() {
  const navigate = useNavigate();

  useEffect(() => {
    toast("Tu pago está siendo verificado...", { icon: "⏳" });

    // Redirigir después de 5 segundos
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-result-container">
      <div className="payment-result-box pending">
        <div className="payment-result-icon">⏳</div>
        <h1>Pago pendiente</h1>
        <p>Tu pago está siendo verificado.</p>
        <p>Te notificaremos por email cuando se confirme.</p>
        <p className="redirect-text">Serás redirigido al inicio en unos momentos.</p>
      </div>
    </div>
  );
}
