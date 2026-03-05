// src/views/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { procesarPagoConfirmado } from "../services/mercadopagoService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processingOrder, setProcessingOrder] = useState(true);
  const [orderCode, setOrderCode] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const method = searchParams.get("method");
        const paymentId = searchParams.get("payment_id");
        const preferenceId = searchParams.get("preference_id");
        const externalReference = searchParams.get("external_reference");

        // ============================
        // ⭐ GO CUOTAS
        // ============================
        if (method === "gocuotas") {
          // GoCuotas Redirect V1 no agrega checkout_id a la URL de retorno,
          // pero sí viene el reference que pusimos en url_success.
          // El backend busca la PendingOrder por orderReference y resuelve el checkoutId.
          const checkoutId = searchParams.get("checkout_id") || null;
          const orderReference = searchParams.get("reference") || null;
          const successToken = searchParams.get("token") || null;

          const gcRes = await fetch(`${API_URL}/gocuotas/process-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checkoutId, orderReference, successToken }),
          });

          const gcData = await gcRes.json();

          if (gcRes.ok && gcData.success) {
            toast.success("✅ ¡Pago procesado con GoCuotas!");
          } else {
            console.error("❌ Error procesando orden GoCuotas:", gcData);
            // No mostrar error al usuario - igual la orden puede crearse por webhook
          }

          clearCart();
          localStorage.removeItem("pendingOrder");
          localStorage.removeItem("checkoutStep");
          localStorage.removeItem("checkoutFormData");
          setProcessingOrder(false);
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        // ============================
        // ⭐ MERCADO PAGO
        // ============================

        // Recuperar datos de la orden pendiente del localStorage
        const pendingOrderStr = localStorage.getItem("pendingOrder");
        let pendingOrderData = null;

        if (pendingOrderStr) {
          try {
            pendingOrderData = JSON.parse(pendingOrderStr);
          } catch (err) {
            console.error("Error parsing pending order:", err);
          }
        } else {
          console.warn("⚠️ No hay pendingOrder en localStorage");
        }

        // Procesar el pago en el backend
        if (paymentId) {
          const response = await procesarPagoConfirmado(paymentId, pendingOrderData);

          if (response.success && response.order) {
            setOrderCode(response.order.code);
            localStorage.setItem("lastOrderCode", response.order.code);
            toast.success(`✅ ¡Pago procesado! Orden: ${response.order.code}`);
          }
        }

        // Limpiar carrito
        clearCart();

        // Limpiar localStorage
        localStorage.removeItem("pendingOrder");
        localStorage.removeItem("checkoutStep");
        localStorage.removeItem("checkoutFormData");

        setProcessingOrder(false);

        // Redirigir al detalle de la orden después de 3 segundos
        setTimeout(() => navigate("/"), 3000);
      } catch (error) {
        console.error("Error procesando pago:", error);
        toast.error("Error al procesar el pago. Contactanos con tu comprobante de pago.");
        setProcessingOrder(false);
        // NO limpiar localStorage — el pendingOrder puede servir para recuperar la orden
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
