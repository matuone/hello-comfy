// backend/controllers/mercadopagoController.js
import axios from "axios";

/**
 * POST /api/mercadopago/create-preference
 * Crea una preferencia de pago en Mercado Pago
 */
export const createPreference = async (req, res) => {
  try {
    const { items, totalPrice, customerData, shippingCost = 0, metadata = {} } = req.body;

    // Validar que tenemos la access token
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({
        error: "MERCADOPAGO_ACCESS_TOKEN no configurado",
      });
    }

    // Construir items para Mercado Pago
    const mercadopagoItems = items.map((item) => ({
      title: item.title,
      description: item.description || "",
      picture_url: item.picture_url,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: "ARS",
    }));

    // Crear la preferencia
    const preference = {
      items: mercadopagoItems,
      payer: {
        email: customerData.email,
        name: customerData.name,
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

    res.json({
      id: response.data.id,
      init_point: response.data.init_point,
      sandbox_init_point: response.data.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creando preferencia Mercado Pago:", error);
    res.status(500).json({
      error: "Error al crear preferencia de pago",
      message: error.message,
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
      // Aquí iría la lógica para actualizar el estado de la orden

      // Ejemplo: obtener detalles del pago
      const paymentId = data.id;

      const paymentDetails = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      console.log("Detalles del pago:", paymentDetails.data.status);

      // Actualizar orden según el estado del pago
      // (Esto se conectaría a tu modelo de Order en la DB)
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error procesando webhook Mercado Pago:", error);
    res.status(500).json({ error: "Error procesando webhook" });
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
