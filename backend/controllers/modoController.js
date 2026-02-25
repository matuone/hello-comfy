// backend/controllers/modoController.js
import axios from "axios";

import {
  crearOrdenDesdePago,
  actualizarEstadoPago,
  obtenerOrdenPorCodigo,
} from "../services/orderService.js";
import { validateCartPrices } from "../services/validateCartPrices.js";
import { validateShippingCost } from "../services/validateShippingCost.js";

// ============================================================
// Modo API v2 (PlayDigital) - OAuth2 Token + Payment Requests
// ============================================================

// Base URL configurable: producción o preproducción (test)
const MODO_BASE_URL = process.env.MODO_BASE_URL || "https://merchants.playdigital.com.ar";
const MODO_TOKEN_URL = `${MODO_BASE_URL}/v2/stores/companies/token`;
const MODO_PAYMENT_URL = `${MODO_BASE_URL}/v2/payment-requests/`;
const MODO_MERCHANT_NAME = process.env.MODO_MERCHANT_NAME || "HelloComfy";

// Cache del token en memoria (dura 1 semana según docs)
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Obtiene un token de acceso de Modo, reutilizando el cache si no expiró.
 * Rate limit del endpoint: 10 requests cada 10 minutos.
 */
async function getModoToken() {
  const now = Date.now();

  // Si el token cacheado aún es válido (con 5 min de margen), reutilizar
  if (cachedToken && tokenExpiresAt > now + 5 * 60 * 1000) {
    return cachedToken;
  }

  const username = process.env.MODO_USERNAME;
  const password = process.env.MODO_PASSWORD;

  if (!username || !password) {
    throw new Error("Credenciales de Modo (MODO_USERNAME / MODO_PASSWORD) no configuradas");
  }

  // ...existing code...

  const response = await axios.post(
    MODO_TOKEN_URL,
    { username, password },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": MODO_MERCHANT_NAME,
      },
    }
  );

  const { access_token, expires_in } = response.data;
  cachedToken = access_token;
  // expires_in está en segundos
  tokenExpiresAt = now + expires_in * 1000;

  // ...existing code...
  return cachedToken;
}

/**
 * POST /api/modo/create-payment-intent
 * Crea un Payment Request en Modo v2
 */
export const createPaymentIntent = async (req, res) => {
  try {
    // ...existing code...
    const { items, totalPrice, customerData, shippingCost = 0, metadata = {} } = req.body;

    const MODO_PROCESSOR_CODE = process.env.MODO_PROCESSOR_CODE;
    const MODO_CC_CODE = process.env.MODO_CC_CODE || "1CSI";

    if (!process.env.MODO_USERNAME || !process.env.MODO_PASSWORD) {
      console.error("❌ Credenciales de Modo no configuradas");
      return res.status(500).json({ error: "Modo no configurado correctamente" });
    }

    if (!MODO_PROCESSOR_CODE) {
      console.error("❌ MODO_PROCESSOR_CODE no configurado");
      return res.status(500).json({ error: "Modo: processor_code no configurado" });
    }

    // Validar items
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items requeridos" });
    }

    // Validar customerData
    if (!customerData || !customerData.email) {
      return res.status(400).json({ error: "Datos del cliente incompletos (email requerido)" });
    }

    // ⭐ VALIDAR PRECIOS CONTRA LA BD
    let validatedItems, totals, cartValidation;
    try {
      cartValidation = await validateCartPrices(items, {
        promoCode: metadata?.promoCode || null,
      });
      validatedItems = cartValidation.validatedItems;
      totals = cartValidation.totals;

      if (cartValidation.warnings.length > 0) {
        console.warn("⚠️ Advertencias validación carrito (Modo):", cartValidation.warnings);
      }
    } catch (validationError) {
      console.error("❌ Error validando precios del carrito:", validationError.message);
      return res.status(400).json({ error: "Error validando productos del carrito" });
    }

    // Calcular total con envío validado
    const { shippingCost: validatedShipping } = await validateShippingCost({
      shippingMethod: metadata?.shippingMethod,
      postalCode: customerData?.postalCode,
      items: validatedItems,
      clientShippingCost: shippingCost,
      hasFreeShipping: cartValidation.hasFreeShipping,
    });
    const total = totals.total + validatedShipping;

    // Referencia externa única (cambia en cada request, requerido por Modo)
    const externalReference = `hc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // URLs de callback
    const backendUrl = process.env.API_URL || "http://localhost:5000";

    // Descripción (máx 100 chars según docs)
    const description = `Hello Comfy - ${validatedItems.length} producto(s)`.slice(0, 100);

    // Payload v2 para Modo
    const modoPayload = {
      description,
      amount: parseFloat(total.toFixed(2)), // float, NO centavos
      currency: "ARS",
      cc_code: MODO_CC_CODE,
      processor_code: MODO_PROCESSOR_CODE,
      external_intention_id: externalReference,
      webhook_notification: `${backendUrl}/api/modo/webhook`,
      customer: {
        full_name: customerData.name || "Cliente",
        email: customerData.email,
        identification: customerData.dni || "",
      },
      items: validatedItems.map((item) => ({
        description: (item.name || item.title || "Producto").slice(0, 100),
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price || item.price) || 0,
        image: item.picture_url || item.image || "",
        sku: item.productId || "",
      })),
    };

    // Obtener token OAuth2
    const token = await getModoToken();

    // Llamada a la API v2 de Modo
    const response = await axios.post(MODO_PAYMENT_URL, modoPayload, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": MODO_MERCHANT_NAME,
      },
    });

    const modoData = response.data;

    res.json({
      success: true,
      paymentIntent: {
        id: modoData.id,
        qr: modoData.qr,
        deeplink: modoData.deeplink,
        externalReference,
        amount: total,
      },
    });

  } catch (error) {
    // Si el token expiró (401), invalidar cache para renovar en siguiente intento
    if (error?.response?.status === 401) {
      cachedToken = null;
      tokenExpiresAt = 0;
      console.warn("⚠️ Token de Modo expirado, se renovará en el próximo intento");
    }
    console.error("❌ Error creando Payment Request en Modo:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Error al crear intención de pago con Modo",
      details: error?.response?.data?.message || error.message,
    });
  }
};

/**
 * POST /api/modo/confirm-payment
 * Confirmar un pago de Modo y crear la orden
 */
export const confirmPayment = async (req, res) => {
  try {
    const { checkoutId, pendingOrderData } = req.body;

    if (!pendingOrderData) {
      return res.status(400).json({ error: "Datos de orden pendiente requeridos" });
    }

    // ⭐ VALIDAR PRECIOS EN LA BD
    let validatedItems, cartValidation;
    try {
      cartValidation = await validateCartPrices(
        pendingOrderData.items,
        { promoCode: pendingOrderData.formData?.promoCode || null }
      );
      validatedItems = cartValidation.validatedItems;
      if (cartValidation.warnings.length > 0) {
        console.warn("⚠️ Advertencias validación carrito (Modo confirm):", cartValidation.warnings);
      }
      pendingOrderData.items = validatedItems;
      pendingOrderData.totalPrice = cartValidation.totals.total;
    } catch (validationError) {
      console.error("❌ Error validando precios del carrito:", validationError.message);
      return res.status(400).json({ error: "Error validando productos del carrito" });
    }

    // ⭐ VALIDAR COSTO DE ENVÍO
    const { shippingCost: validatedShipping } = await validateShippingCost({
      shippingMethod: pendingOrderData.formData?.shippingMethod,
      postalCode: pendingOrderData.formData?.postalCode,
      items: validatedItems,
      clientShippingCost: pendingOrderData.shippingCost,
      hasFreeShipping: cartValidation.hasFreeShipping,
    });
    pendingOrderData.shippingCost = validatedShipping;

    // Crear datos de pago
    const paymentData = {
      id: checkoutId || `modo_${Date.now()}`,
      status: "approved",
      transaction_amount: pendingOrderData.totalPrice + validatedShipping,
      payer: {
        email: pendingOrderData.formData.email,
        name: pendingOrderData.formData.name,
      },
      payment_method_id: "modo",
      payment_type_id: "digital_wallet",
    };

    // Crear orden en la base de datos
    const order = await crearOrdenDesdePago(paymentData, pendingOrderData);

    return res.json({
      success: true,
      order: {
        code: order.code,
        _id: order._id,
      },
    });
  } catch (error) {
    console.error("❌ Error confirmando pago de Modo:", error);
    res.status(500).json({
      success: false,
      error: "Error al confirmar pago",
      details: error.message,
    });
  }
};

/**
 * POST /api/modo/webhook
 * Webhook para notificaciones de Modo v2
 */
export const handleWebhook = async (req, res) => {
  try {
    const { external_intention_id, status, payment_id } = req.body;

    // Modo v2 usa external_intention_id
    const reference = external_intention_id || req.body.external_reference;

    if (!reference) {
      return res.status(400).json({ error: "external_intention_id requerido" });
    }

    // Obtener la orden
    const order = await obtenerOrdenPorCodigo(reference);
    if (!order) {
      console.error("❌ Orden no encontrada:", reference);
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Mapear estado de Modo a nuestro sistema
    let paymentStatus = "pending";
    if (status === "approved" || status === "success" || status === "APPROVED") {
      paymentStatus = "approved";
    } else if (status === "rejected" || status === "failed" || status === "REJECTED") {
      paymentStatus = "failed";
    }

    // Actualizar orden
    await actualizarEstadoPago(reference, {
      status: paymentStatus,
      paymentId: payment_id,
      paymentMethod: "modo",
      paymentDetails: req.body,
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error procesando webhook de Modo:", error);
    res.status(500).json({ error: "Error procesando webhook" });
  }
};

/**
 * GET /api/modo/payment/:paymentId
 * Consultar estado de un pago en Modo v2
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const token = await getModoToken();

    const response = await axios.get(
      `${MODO_BASE_URL}/v2/payment-requests/${paymentId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "User-Agent": MODO_MERCHANT_NAME,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    // Si el token expiró, invalidar cache
    if (error?.response?.status === 401) {
      cachedToken = null;
      tokenExpiresAt = 0;
    }
    console.error("❌ Error consultando pago Modo:", error?.response?.data || error.message);
    res.status(500).json({ error: "Error consultando pago" });
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentStatus,
};
