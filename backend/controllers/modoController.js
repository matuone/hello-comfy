// backend/controllers/modoController.js
import axios from "axios";
import {
  crearOrdenDesdePago,
  actualizarEstadoPago,
  obtenerOrdenPorCodigo,
} from "../services/orderService.js";

/**
 * POST /api/modo/create-payment-intent
 * Crea una intención de pago en Modo
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { items, totalPrice, customerData, shippingCost = 0, metadata = {} } = req.body;

    // Validar que tenemos las credenciales de test
    const MODO_STORE_ID = process.env.MODO_STORE_ID || "TEST_STORE_ID";
    const MODO_API_KEY = process.env.MODO_API_KEY || "TEST_API_KEY";
    
    console.log("🟢 Creando intención de pago con Modo (Modo Test)");
    console.log("  Store ID:", MODO_STORE_ID);

    // Validar items
    if (!items || items.length === 0) {
      console.error("❌ Items vacíos o no proporcionados");
      return res.status(400).json({
        error: "Items requeridos",
      });
    }

    // Validar customerData
    if (!customerData || !customerData.email) {
      console.error("❌ Customer data incompleto:", customerData);
      return res.status(400).json({
        error: "Datos del cliente incompletos (email requerido)",
      });
    }

    // Calcular total
    const total = parseFloat(totalPrice) + parseFloat(shippingCost);
    const externalReference = `order_${Date.now()}`;

    // Crear orden en la base de datos
    const orderData = {
      codigo: externalReference,
      paymentMethod: "modo",
      paymentStatus: "pending",
      items: items.map(item => ({
        productId: item.productId,
        productName: item.title,
        quantity: item.quantity,
        price: item.unit_price,
        size: item.size || "Único",
        color: item.color || "Default"
      })),
      subtotal: parseFloat(totalPrice),
      shippingCost: parseFloat(shippingCost),
      total: total,
      customer: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        postalCode: customerData.postalCode,
        province: customerData.province
      },
      metadata: metadata
    };

    const order = await crearOrdenDesdePago(orderData);
    console.log("📦 Orden creada en BD:", order.codigo);

    // URLs de callback
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const backendUrl = process.env.API_URL || "http://localhost:5000";

    // Preparar payload para Modo
    const modoPayload = {
      store_id: MODO_STORE_ID,
      external_reference: externalReference,
      amount: Math.round(total * 100), // Modo espera el monto en centavos
      currency: "ARS",
      description: `Compra en Hello-Comfy - ${items.length} producto(s)`,
      customer: {
        email: customerData.email,
        name: customerData.name,
        identification: {
          type: "DNI",
          number: customerData.dni || ""
        }
      },
      callback_url: `${backendUrl}/api/modo/webhook`,
      return_url: `${frontendUrl}/payment/modo-return?reference=${externalReference}`,
      items: items.map(item => ({
        title: item.title,
        description: item.description || "",
        quantity: item.quantity,
        unit_price: Math.round(parseFloat(item.unit_price) * 100)
      }))
    };

    console.log("📤 Enviando request a Modo:", JSON.stringify(modoPayload, null, 2));

    // En modo test, simulamos una respuesta de Modo
    // Cuando tengas credenciales reales, descomenta el código real
    
    // MODO TEST - Simular respuesta
    const testResponse = {
      id: `modo_test_${Date.now()}`,
      qr: `https://chart.googleapis.com/chart?cht=qr&chl=modo://test/${externalReference}&chs=300x300`,
      deeplink: `modo://test/${externalReference}`,
      checkout_url: `${frontendUrl}/payment/modo-checkout?id=${externalReference}`,
      status: "pending",
      external_reference: externalReference
    };

    console.log("✅ Respuesta de Modo (TEST):", testResponse);

    /* MODO PRODUCCIÓN - Código real (comentado por ahora)
    const response = await axios.post(
      'https://api.modo.com.ar/v1/payment-intents',
      modoPayload,
      {
        headers: {
          'Authorization': `Bearer ${MODO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Respuesta de Modo:", response.data);
    */

    res.json({
      success: true,
      paymentIntent: testResponse, // En producción: response.data
      orderId: order._id,
      orderCode: order.codigo
    });

  } catch (error) {
    console.error("❌ Error creando intención de pago con Modo:", error);
    res.status(500).json({
      error: "Error al crear intención de pago",
      details: error.message,
    });
  }
};

/**
 * POST /api/modo/webhook
 * Webhook para notificaciones de Modo
 */
export const handleWebhook = async (req, res) => {
  try {
    console.log("🔔 Webhook de Modo recibido:");
    console.log(JSON.stringify(req.body, null, 2));

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

    console.log(`📝 Actualizando orden ${external_reference} a estado: ${paymentStatus}`);

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

    console.log("🔍 Consultando estado de pago:", paymentId);

    // En modo test, simulamos una respuesta
    const testStatus = {
      id: paymentId,
      status: "pending",
      external_reference: paymentId.replace("modo_test_", "order_")
    };

    /* MODO PRODUCCIÓN - Código real
    const MODO_API_KEY = process.env.MODO_API_KEY;
    const response = await axios.get(
      `https://api.modo.com.ar/v1/payment-intents/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MODO_API_KEY}`
        }
      }
    );

    res.json(response.data);
    */

    res.json(testStatus);
  } catch (error) {
    console.error("❌ Error consultando pago:", error);
    res.status(500).json({ error: "Error consultando pago" });
  }
};

export default {
  createPaymentIntent,
  handleWebhook,
  getPaymentStatus
};
