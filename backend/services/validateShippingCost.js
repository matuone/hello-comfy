// backend/services/validateShippingCost.js
import { cotizarCorreoArgentino } from "./shipping/correoArgentinoApi.js";
import { cotizarCorreo } from "./shipping/correo.js";

/**
 * Valida y recalcula el costo de envío contra la API de Correo Argentino.
 * NUNCA confiar en el shippingCost enviado desde el frontend.
 *
 * @param {Object} params
 * @param {String} params.shippingMethod - "correo-home", "correo-branch", "pickup", etc.
 * @param {String} params.postalCode - Código postal de destino
 * @param {Array}  params.items - Items validados del carrito (con weight y dimensions)
 * @param {Number} params.clientShippingCost - El costo que dice el frontend (solo para logging)
 * @returns {Object} { shippingCost, source, method }
 */
export async function validateShippingCost({ shippingMethod, postalCode, items, clientShippingCost = 0, hasFreeShipping = false }) {
  // Envío gratis por regla de descuento — validado contra la BD
  if (hasFreeShipping) {
    console.log("✅ validateShippingCost: envío gratis por regla de descuento");
    return { shippingCost: 0, source: "free_shipping_rule", method: shippingMethod || "free" };
  }

  // Pickup / retiro en punto = envío gratis
  if (!shippingMethod || shippingMethod === "pickup" || shippingMethod.startsWith("retiro")) {
    return { shippingCost: 0, source: "free", method: shippingMethod || "pickup" };
  }

  // Para correo argentino necesitamos CP
  if (!postalCode) {
    console.warn("⚠️ validateShippingCost: sin código postal, envío $0");
    return { shippingCost: 0, source: "missing-cp", method: shippingMethod };
  }

  // Preparar productos para cotización
  const products = items.map(item => ({
    quantity: item.quantity || 1,
    weight: item.weight || 0.3,
    dimensions: item.dimensions || { width: 20, height: 5, length: 30 },
  }));

  // Intentar cotizar con API real
  const apiResult = await cotizarCorreoArgentino({ postalCode, products });

  // Si la API no está configurada o falló, usar tarifas locales
  let rates = apiResult;
  let source = "api";

  if (apiResult.pendingCredentials || apiResult.apiError) {
    rates = cotizarCorreo({ postalCode, products });
    source = "local-fallback";
  }

  // Determinar el costo según el método elegido
  let shippingCost = 0;

  if (shippingMethod === "correo-home" || shippingMethod === "home") {
    if (rates.home?.available) {
      shippingCost = rates.home.price;
    } else {
      console.warn(`⚠️ Envío a domicilio no disponible para CP ${postalCode}`);
    }
  } else if (shippingMethod === "correo-branch" || shippingMethod === "branch") {
    if (rates.branch?.available) {
      shippingCost = rates.branch.price;
    } else {
      console.warn(`⚠️ Envío a sucursal no disponible para CP ${postalCode}`);
    }
  }

  // Log si el frontend mandó un costo distinto (posible manipulación)
  if (clientShippingCost > 0 && Math.abs(clientShippingCost - shippingCost) > 1) {
    console.warn(
      `⚠️ SHIPPING COST MISMATCH: cliente envió $${clientShippingCost}, ` +
      `servidor calculó $${shippingCost} (método: ${shippingMethod}, CP: ${postalCode})`
    );
  }

  return { shippingCost, source, method: shippingMethod };
}
