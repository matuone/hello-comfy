// EJEMPLO DE USO: Integración de Go Cuotas en el checkout
// Agregar esto en tu componente de checkout

import { createGocuotasCheckout, processGocuotasPayment } from "../services/gocuotasService";

/**
 * Ejemplo para pagar con Go Cuotas
 */
async function handlePaymentWithGocuotas() {
  try {
    // 1. Preparar datos de la orden
    const checkoutData = {
      items: [
        {
          title: "Remera Oversize",
          description: "Remera de algodón",
          unit_price: 75.00,
          quantity: 2,
          picture_url: "https://...", // URL de la imagen del producto
        },
      ],
      totalPrice: 150.00, // Total en ARS
      customerData: {
        email: "cliente@example.com",
        name: "Juan Pérez",
        phone: "1123456789", // Números sin guiones
        dni: "40123456", // DNI del cliente
        postalCode: "1636",
      },
      shippingCost: 0,
      metadata: {
        // Datos adicionales que quieras guardar
        orderId: "ORDER-123",
      },
    };

    // 2. Crear el checkout en Go Cuotas
    const checkout = await createGocuotasCheckout(checkoutData);

    console.log("✅ Checkout creado. Redirigiendo a Go Cuotas...");

    // 3. Redirigir al cliente a Go Cuotas
    window.location.href = checkout.url_init;
  } catch (err) {
    console.error("❌ Error:", err);
    alert("Error al crear el checkout. Intenta nuevamente.");
  }
}

/**
 * Ejemplo para procesar el pago cuando el cliente regresa
 * (Se ejecuta en la página de success/cancel)
 */
async function handlePaymentReturn() {
  try {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const checkoutId = params.get("checkout_id");
    const orderReference = params.get("order_reference");
    const status = params.get("status");

    if (!checkoutId || !orderReference) {
      console.error("❌ Faltan parámetros en la URL");
      return;
    }

    // 4. Procesar el pago en el backend
    const result = await processGocuotasPayment(checkoutId, orderReference);

    if (result.success) {
      console.log("✅ Pago procesado exitosamente");
      console.log("Orden creada:", result.orderId);
      // Redirigir a página de confirmación
      window.location.href = `/order-confirmation/${result.orderId}`;
    } else {
      console.error("❌ El pago no fue aprobado");
      // Redirigir a página de error
      window.location.href = "/payment-failed";
    }
  } catch (err) {
    console.error("❌ Error procesando pago:", err);
    alert("Error procesando el pago. Contacta al soporte.");
  }
}
