// src/services/modoService.js
const API_URL = import.meta.env.VITE_API_URL;
const apiPath = (path) => `${API_URL}${path}`;

/**
 * Crea una intención de pago con Modo
 */
export async function crearIntencionPagoModo({
  items,
  totalPrice,
  customerData,
  shippingCost = 0,
  metadata = {},
}) {
  try {
    const response = await fetch(apiPath("/modo/create-payment-intent"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        totalPrice,
        customerData,
        shippingCost,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear intención de pago");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("❌ Error en modoService:", error);
    throw error;
  }
}

/**
 * Consulta el estado de un pago en Modo
 */
export async function consultarEstadoPago(paymentId) {
  try {
    const response = await fetch(apiPath(`/modo/payment/${paymentId}`));

    if (!response.ok) {
      throw new Error("Error al consultar estado del pago");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error consultando pago:", error);
    throw error;
  }
}

/**
 * Abre la app de Modo o muestra el QR
 */
export function abrirModo(paymentIntent) {
  if (!paymentIntent) {
    console.error("❌ No hay intención de pago");
    return;
  }

  // Si el usuario está en mobile, intentar abrir deeplink
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = paymentIntent.deeplink;
  } else {
    // En desktop, mostrar QR o redirigir a checkout
    window.open(paymentIntent.checkout_url, '_blank');
  }
}

export default {
  crearIntencionPagoModo,
  consultarEstadoPago,
  abrirModo
};
