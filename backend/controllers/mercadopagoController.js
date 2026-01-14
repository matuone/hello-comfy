// backend/controllers/mercadopagoController.js
import axios from "axios";
import {
  crearOrdenDesdePago,
  actualizarEstadoPago,
  obtenerOrdenPorCodigo,
} from "../services/orderService.js";

/**
 * POST /api/mercadopago/create-preference
 * Crea una preferencia de pago en Mercado Pago
 */
export const createPreference = async (req, res) => {
  try {
    const { items, totalPrice, customerData, shippingCost = 0, metadata = {} } = req.body;

    // Validar que tenemos la access token
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("❌ MERCADOPAGO_ACCESS_TOKEN no configurado");
      return res.status(500).json({
        error: "MERCADOPAGO_ACCESS_TOKEN no configurado",
      });
    }

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

    // Construir items para Mercado Pago
    const mercadopagoItems = items.map((item) => ({
      title: item.title || "Producto",
      description: item.description || "",
      picture_url: item.picture_url || "",
      quantity: parseInt(item.quantity) || 1,
      unit_price: parseFloat(item.unit_price) || 0,
      currency_id: "ARS",
    }));

    console.log("📦 Items para Mercado Pago:", mercadopagoItems);

    // Crear la preferencia
    const preference = {
      items: mercadopagoItems,
      payer: {
        email: customerData.email,
        name: customerData.name || "Cliente",
        phone: {
          area_code: customerData.phone?.substring(0, 3) || "11",
          number: customerData.phone?.substring(3) || "",
        },
        address: {
          zip_code: customerData.postalCode || "",
        },
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success`,
        failure: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/failure`,
        pending: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/pending`,
      },
      notification_url: `${process.env.API_URL || "http://localhost:5000"}/api/mercadopago/webhook`,
      external_reference: `order_${Date.now()}`,
      metadata: metadata,
      auto_return: "approved",
    };

    console.log("🔄 Enviando preferencia a Mercado Pago:", JSON.stringify(preference, null, 2));

    // Hacer request a Mercado Pago
    const response = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      preference,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Preferencia creada en Mercado Pago:", response.data.id);

    res.json({
      id: response.data.id,
      init_point: response.data.init_point,
      sandbox_init_point: response.data.sandbox_init_point,
    });
  } catch (error) {
    console.error("❌ Error creando preferencia Mercado Pago:", error.response?.data || error.message);
    res.status(500).json({
      error: "Error al crear preferencia de pago",
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null,
    });
  }
};

/**
 * POST /api/mercadopago/webhook
 * Webhook para recibir notificaciones de Mercado Pago
 */
export const webhookMercadoPago = async (req, res) => {
  try {
    const { type, data } = req.query;

    // Verificar que sea una notificación de Mercado Pago válida
    if (type === "payment") {
      console.log("✅ Notificación de pago recibida:", data.id);

      const paymentId = data.id;

      // Obtener detalles del pago
      const paymentDetails = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      const paymentData = paymentDetails.data;
      const externalReference = paymentData.external_reference;

      console.log("📊 Detalles del pago:", {
        id: paymentData.id,
        status: paymentData.status,
        reference: externalReference,
        amount: paymentData.transaction_amount,
      });

      // Actualizar estado de pago en BD
      if (externalReference) {
        await actualizarEstadoPago(externalReference, paymentData.status);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error procesando webhook Mercado Pago:", error);
    // Responder 200 igual para que Mercado Pago no reintente
    res.sendStatus(200);
  }
};

/**
 * GET /api/mercadopago/payment/:id
 * Obtiene detalles de un pago específico
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    res.json({
      id: response.data.id,
      status: response.data.status,
      status_detail: response.data.status_detail,
      external_reference: response.data.external_reference,
      transaction_amount: response.data.transaction_amount,
      payer: response.data.payer,
    });
  } catch (error) {
    console.error("Error obteniendo estado del pago:", error);
    res.status(500).json({
      error: "Error al obtener estado del pago",
    });
  }
};

/**
 * POST /api/mercadopago/process-payment
 * Procesa un pago confirmado y crea la orden en BD
 * Se ejecuta desde el frontend después de redirigir desde Mercado Pago
 */
export const processPayment = async (req, res) => {
  try {
    const { paymentId, pendingOrderData } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId requerido" });
    }

    // Obtener detalles del pago de Mercado Pago
    const paymentResponse = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const paymentData = paymentResponse.data;

    console.log("💳 Procesando pago confirmado:", {
      id: paymentData.id,
      status: paymentData.status,
      amount: paymentData.transaction_amount,
    });

    // Verificar que el pago fue aprobado o está pendiente
    if (!["approved", "pending"].includes(paymentData.status)) {
      return res.status(400).json({
        error: "El pago no fue aprobado",
        status: paymentData.status,
      });
    }

    // Crear orden en BD
    let order = null;
    if (pendingOrderData) {
      order = await crearOrdenDesdePago(paymentData, pendingOrderData);
    } else {
      // Si no hay datos de orden pendiente, solo actualizar estado
      const externalReference = paymentData.external_reference;
      if (externalReference) {
        order = await actualizarEstadoPago(externalReference, paymentData.status);
      }
    }

    res.json({
      success: true,
      message: "Pago procesado correctamente",
      order: order ? {
        code: order.code,
        email: order.customer.email,
        status: order.pagoEstado,
        total: order.totals.total,
      } : null,
    });
  } catch (error) {
    console.error("❌ Error procesando pago:", error);
    res.status(500).json({
      error: "Error al procesar el pago",
      message: error.message,
    });
  }
};
