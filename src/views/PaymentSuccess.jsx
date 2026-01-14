// src/views/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processingOrder, setProcessingOrder] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentId = searchParams.get("payment_id");
        const preferenceId = searchParams.get("preference_id");
        const externalReference = searchParams.get("external_reference");

        console.log("✅ Pago exitoso:", {
          paymentId,
          preferenceId,
          externalReference,
        });

        // Recuperar datos de la orden pendiente del localStorage
        const pendingOrder = localStorage.getItem("pendingOrder");
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          
          // Aquí iría la lógica para crear la orden en el backend
          // con los datos del pago confirmado
          console.log("Orden a procesar:", orderData);

          // Limpiar localStorage
          localStorage.removeItem("pendingOrder");
        }

        setProcessingOrder(false);
        toast.success("¡Pago procesado correctamente!");

        // Redirigir al detalle de la orden después de 3 segundos
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        console.error("Error procesando pago:", error);
        toast.error("Error al procesar el pago");
        setProcessingOrder(false);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return (
    <div className="payment-result-container">
      <div className="payment-result-box success">
        <div className="payment-result-icon">✅</div>
        <h1>¡Pago exitoso!</h1>
        <p>Tu pago ha sido procesado correctamente.</p>
        {processingOrder && <p className="processing-text">Creando orden...</p>}
        {!processingOrder && (
          <p className="redirect-text">Serás redirigido al inicio en unos momentos.</p>
        )}
      </div>
    </div>
  );
}
