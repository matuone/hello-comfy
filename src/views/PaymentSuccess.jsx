// src/views/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { procesarPagoConfirmado } from "../services/mercadopagoService";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processingOrder, setProcessingOrder] = useState(true);
  const [orderCode, setOrderCode] = useState(null);

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
        const pendingOrderStr = localStorage.getItem("pendingOrder");
        let pendingOrderData = null;

        if (pendingOrderStr) {
          try {
            pendingOrderData = JSON.parse(pendingOrderStr);
          } catch (err) {
            console.error("Error parsing pending order:", err);
          }
        }

        // Procesar el pago en el backend
        if (paymentId && pendingOrderData) {
          const response = await procesarPagoConfirmado(paymentId, pendingOrderData);
          
          if (response.success && response.order) {
            setOrderCode(response.order.code);
            toast.success(`✅ ¡Pago procesado! Orden: ${response.order.code}`);
          }
        }

        // Limpiar localStorage
        localStorage.removeItem("pendingOrder");

        setProcessingOrder(false);

        // Redirigir al detalle de la orden después de 3 segundos
        setTimeout(() => {
          if (orderCode) {
            navigate("/");
          } else {
            navigate("/");
          }
        }, 3000);
      } catch (error) {
        console.error("Error procesando pago:", error);
        toast.error("Error al procesar el pago");
        setProcessingOrder(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, orderCode]);

  return (
    <div className="payment-result-container">
      <div className="payment-result-box success">
        <div className="payment-result-icon">✅</div>
        <h1>¡Pago exitoso!</h1>
        <p>Tu pago ha sido procesado correctamente.</p>
        {processingOrder && <p className="processing-text">Creando orden...</p>}
        {!processingOrder && (
          <>
            {orderCode && (
              <p className="processing-text">
                Orden creada: <strong>{orderCode}</strong>
              </p>
            )}
            <p className="redirect-text">Serás redirigido al inicio en unos momentos.</p>
          </>
        )}
      </div>
    </div>
  );
}
