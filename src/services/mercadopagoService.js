// src/services/mercadopagoService.js

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// Eliminar cualquier /api o / al final para evitar dobles rutas
API_URL = API_URL.replace(/\/+$/, "").replace(/\/api$/, "");

/**
 * Crea una preferencia de pago en Mercado Pago
 * @param {Object} items - Items a comprar
 * @param {Number} totalPrice - Precio total
 * @param {Object} customerData - Datos del cliente (email, name, phone)
 * @param {String} shippingCost - Costo de envío (opcional)
 * @returns {Promise<Object>} Datos de la preferencia con init_point
 */
export async function crearPreferenciaMercadoPago({
  items,
  totalPrice,
  customerData,
  shippingCost = 0,
  metadata = {},
}) {
  try {
    console.log("📤 Enviando preferencia:", {
      items,
      totalPrice,
      customerData,
      metadata,
    });

    const response = await fetch(`${API_URL}/api/mercadopago/create-preference`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        totalPrice,
        shippingCost,
        customerData,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error del servidor:", data);
      throw new Error(
        data.message || data.error || "Error creando preferencia de Mercado Pago"
      );
    }

    console.log("✅ Preferencia creada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en mercadopagoService:", error);
    throw error;
  }
}

/**
 * Redirige al usuario a Mercado Pago para pagar
 * @param {String} initPoint - URL de Mercado Pago
 */
export function redirigirAMercadoPago(initPoint) {
  if (initPoint) {
    window.location.href = initPoint;
  }
}

/**
 * Carga el script de Mercado Pago Checkout (MPv2)
 */
export function cargarScriptMercadoPago() {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Error cargando script de Mercado Pago"));

    document.head.appendChild(script);
  });
}

/**
 * Procesa un pago confirmado desde Mercado Pago
 * @param {String} paymentId - ID del pago
 * @param {Object} pendingOrderData - Datos de la orden pendiente
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function procesarPagoConfirmado(paymentId, pendingOrderData) {
  try {
    const response = await fetch(`${API_URL}/api/mercadopago/process-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId,
        pendingOrderData,
      }),
    });

    if (!response.ok) {
      throw new Error("Error procesando pago");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en procesarPagoConfirmado:", error);
    throw error;
  }
}
