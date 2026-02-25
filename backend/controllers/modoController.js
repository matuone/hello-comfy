// backend/controllers/modoController.js
import axios from "axios";
import {
  crearOrdenDesdePago,
  actualizarEstadoPago,
  obtenerOrdenPorCodigo,
} from "../services/orderService.js";
import { validateCartPrices } from "../services/validateCartPrices.js";
import { validateShippingCost } from "../services/validateShippingCost.js";

// URL de la API de Modo (PlayDigital)
const MODO_API_URL = "https://merchants.playdigital.com.ar/merchants/ecommerce/payment-intention";

/**
 * POST /api/modo/create-payment-intent
 * Crea una intención de pago en Modo (producción)
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { items, totalPrice, customerData, shippingCost = 0, metadata = {} } = req.body;

    const MODO_STORE_ID = process.env.MODO_STORE_ID;
    const MODO_API_KEY = process.env.MODO_API_KEY;
    const MODO_TEMPLATE_ID = process.env.MODO_TEMPLATE_ID;

    if (!MODO_STORE_ID || !MODO_API_KEY) {
      console.error("❌ Credenciales de Modo no configuradas");
      return res.status(500).json({ error: "Modo no configurado correctamente" });
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

    // Referencia externa única
    const externalReference = `hc_modo_${Date.now()}`;

    // URLs de callback
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const backendUrl = process.env.API_URL || "http://localhost:5000";

    // Payload para la API de Modo
    const modoPayload = {
      store_id: MODO_STORE_ID,
      template_id: MODO_TEMPLATE_ID,
      external_intention_id: externalReference,
      amount: Math.round(total * 100), // centavos
      currency: "ARS",
      description: `Compra en Hello Comfy - ${validatedItems.length} producto(s)`,
      callback_url: `${backendUrl}/api/modo/webhook`,
      return_url: `${frontendUrl}/checkout/success`,
    };

    // Llamada real a la API de Modo
    const response = await axios.post(MODO_API_URL, modoPayload, {
      headers: {
        "apikey": MODO_API_KEY,
        "Content-Type": "application/json",
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
    console.error("❌ Error creando intención de pago con Modo:", error?.response?.data || error.message);
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
        name: pendingOrderData.formData.name
      },
      payment_method_id: "modo",
      payment_type_id: "digital_wallet"
    };

    // Crear orden en la base de datos
    const order = await crearOrdenDesdePago(paymentData, pendingOrderData);

    return res.json({
      success: true,
      order: {
        code: order.code,
        _id: order._id
      }
    });
  } catch (error) {
    console.error("❌ Error confirmando pago de Modo:", error);
    res.status(500).json({
      success: false,
      error: "Error al confirmar pago",
      details: error.message
    });
  }
};

/**
 * POST /api/modo/webhook
 * Webhook para notificaciones de Modo
 */
export const handleWebhook = async (req, res) => {
  try {
    // console.log("🔔 Webhook de Modo recibido:");
    // console.log(JSON.stringify(req.body, null, 2)); // No loggear payloads completos en producción

    const { external_reference, status, payment_id } = req.body;

    if (!external_reference) {
      return res.status(400).json({ error: "external_reference requerido" });
    }

    // Obtener la orden
    const order = await obtenerOrdenPorCodigo(external_reference);
    if (!order) {
      console.error("❌ Orden no encontrada:", external_reference);
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Mapear estado de Modo a nuestro sistema
    let paymentStatus = "pending";
    if (status === "approved" || status === "success") {
      paymentStatus = "approved";
    } else if (status === "rejected" || status === "failed") {
      paymentStatus = "failed";
    }

    // console.log(`📝 Actualizando orden ${external_reference} a estado: ${paymentStatus}`);

    // Actualizar orden
    await actualizarEstadoPago(external_reference, {
      status: paymentStatus,
      paymentId: payment_id,
      paymentMethod: "modo",
      paymentDetails: req.body
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error procesando webhook de Modo:", error);
    res.status(500).json({ error: "Error procesando webhook" });
  }
};

/**
 * GET /api/modo/payment/:paymentId
 * Consultar estado de un pago en Modo
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const MODO_API_KEY = process.env.MODO_API_KEY;

    const response = await axios.get(
      `${MODO_API_URL}/${paymentId}`,
      {
        headers: {
          "apikey": MODO_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error consultando pago Modo:", error?.response?.data || error.message);
    res.status(500).json({ error: "Error consultando pago" });
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentStatus
};
