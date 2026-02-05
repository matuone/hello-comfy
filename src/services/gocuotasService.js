// frontend/services/gocuotasService.js
// Servicio para integración con Go Cuotas

const API_URL = import.meta.env.VITE_API_URL;
const apiPath = (path) => `${API_URL}${path}`;

/**
 * Crea un checkout en Go Cuotas
 */
export const createGocuotasCheckout = async (checkoutData) => {
  try {
    const response = await fetch(apiPath("/gocuotas/create-checkout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      let detail = "Error creando checkout";
      try {
        const errData = await response.json();
        detail = errData?.detail || errData?.error || detail;
      } catch (e) {
        // ignore parse errors
      }
      throw new Error(detail);
    }

    const data = await response.json();
    console.log("✅ Checkout creado:", data);

    return data;
  } catch (err) {
    console.error("❌ Error en createGocuotasCheckout:", err);
    throw err;
  }
};

/**
 * Obtiene el estado de un checkout
 */
export const getGocuotasCheckoutStatus = async (checkoutId) => {
  try {
    const response = await fetch(apiPath(`/gocuotas/checkout/${checkoutId}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error obteniendo estado");
    }

    const data = await response.json();
    console.log("✅ Estado del checkout:", data);

    return data;
  } catch (err) {
    console.error("❌ Error en getGocuotasCheckoutStatus:", err);
    throw err;
  }
};

/**
 * Procesa el pago después de la redirección desde Go Cuotas
 */
export const processGocuotasPayment = async (checkoutId, orderReference) => {
  try {
    const response = await fetch(apiPath("/gocuotas/process-payment"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkoutId,
        orderReference,
      }),
    });

    if (!response.ok) {
      throw new Error("Error procesando pago");
    }

    const data = await response.json();
    console.log("✅ Pago procesado:", data);

    return data;
  } catch (err) {
    console.error("❌ Error en processGocuotasPayment:", err);
    throw err;
  }
};
