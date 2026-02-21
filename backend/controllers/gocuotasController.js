// backend/controllers/gocuotasController.js
import axios from "axios";
import {
  crearOrdenDesdePago,
  actualizarEstadoPago,
  obtenerOrdenPorCodigo,
} from "../services/orderService.js";
import { validateCartPrices } from "../services/validateCartPrices.js";

// ============================
// CONFIG
// ============================
const GOCUOTAS_BASE_URL = process.env.GOCUOTAS_BASE_URL || "https://sandbox.gocuotas.com/api_redirect/v1";

// Si usas email/password se usará token; si usas API key no se usa token
let GOCUOTAS_TOKEN = null;
let TOKEN_EXPIRY = null;

const getGocuotasToken = async () => {
  // Si hay API key configurada, no usamos token
  if (process.env.GOCUOTAS_API_KEY_SANDBOX) return null;

  if (GOCUOTAS_TOKEN && TOKEN_EXPIRY && Date.now() < TOKEN_EXPIRY) return GOCUOTAS_TOKEN;

  const email = process.env.GOCUOTAS_SANDBOX_EMAIL;
  const password = process.env.GOCUOTAS_SANDBOX_PASSWORD;
  if (!email || !password) {
    throw new Error("Credenciales de Go Cuotas sandbox no configuradas");
  }

  const response = await axios.post(
    `${GOCUOTAS_BASE_URL}/authentication`,
    { email, password },
    { headers: { "Content-Type": "application/json" } }
  );

  GOCUOTAS_TOKEN = response.data.token;
  TOKEN_EXPIRY = Date.now() + 55 * 60 * 1000; // 55 minutos
  return GOCUOTAS_TOKEN;
};

// ============================
// POST /api/gocuotas/create-checkout
// ============================
export const createCheckout = async (req, res) => {
  try {
    const { items, totalPrice, customerData, shippingCost = 0, metadata = {} } = req.body;

    const hasApiKey = !!process.env.GOCUOTAS_API_KEY_SANDBOX;
    const hasUserPass = !!(process.env.GOCUOTAS_SANDBOX_EMAIL && process.env.GOCUOTAS_SANDBOX_PASSWORD);
    if (!hasApiKey && !hasUserPass) {
      return res.status(500).json({ error: "Go Cuotas Sandbox no está configurado" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items requeridos" });
    }
    if (!customerData || !customerData.email) {
      return res.status(400).json({ error: "Email del cliente requerido" });
    }

    // ⭐ VALIDAR PRECIOS CONTRA LA BD — nunca confiar en el frontend
    let validatedItems, totals, validationWarnings;
    try {
      const validation = await validateCartPrices(items, {
        promoCode: metadata?.promoCode || null,
      });
      validatedItems = validation.validatedItems;
      totals = validation.totals;
      validationWarnings = validation.warnings;

      if (validationWarnings.length > 0) {
        console.warn("⚠️ Advertencias de validación de carrito (GoCuotas create-checkout):", validationWarnings);
      }
    } catch (validationError) {
      console.error("❌ Error validando precios del carrito:", validationError.message);
      return res.status(400).json({ error: "Error validando productos del carrito" });
    }

    const token = hasApiKey ? null : await getGocuotasToken();

    // Usar precios validados de la BD
    const totalPriceInCents = Math.round(totals.total * 100);
    const gocuotasItems = validatedItems.map((item) => {
      const base = item.price;
      const discountPercent = item.discount || 0;
      const finalPrice = discountPercent > 0
        ? Math.round((base - (base * discountPercent) / 100) * 100) / 100
        : base;

      return {
        title: item.name || "Producto",
        unit_price_in_cents: Math.round(finalPrice * 100),
        quantity: item.quantity,
      };
    });

    const phoneNumber = (customerData.phone || "").replace(/[^0-9]/g, "");
    const areaCode = phoneNumber.substring(0, 2) || "11";
    const telephoneNumber = phoneNumber.substring(2) || "0";

    const orderReference = `order_${Date.now()}`;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/payment/success?method=gocuotas&reference=${orderReference}`;
    const failureUrl = `${frontendUrl}/payment/cancel?method=gocuotas&reference=${orderReference}`;
    const notificationUrl = `${process.env.API_URL || "http://localhost:5000"}/api/gocuotas/webhook`;

    const checkoutData = {
      amount_in_cents: totalPriceInCents,
      order_reference_id: orderReference,
      customer: {
        email: customerData.email,
        dni: customerData.dni || "0000000",
        area_code: areaCode,
        telephone_number: telephoneNumber,
      },
      items: gocuotasItems,
      url_success: successUrl,
      url_failure: failureUrl,
      url_notification: notificationUrl,
    };

    const response = await axios.post(
      `${GOCUOTAS_BASE_URL}/checkouts`,
      checkoutData,
      {
        headers: {
          Authorization: hasApiKey
            ? `Bearer ${process.env.GOCUOTAS_API_KEY_SANDBOX}`
            : `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    global.gocuotasOrders = global.gocuotasOrders || {};
    global.gocuotasOrders[response.data.id] = {
      orderReference,
      customerData,
      items: validatedItems, // ← items con precios validados de BD
      totalPrice: totals.total, // ← total recalculado desde BD
      shippingCost,
      metadata,
      createdAt: new Date(),
    };

    res.json({
      id: response.data.id,
      url_init: response.data.url_init,
      status: response.data.status,
      orderReference,
    });
  } catch (err) {
    const apiStatus = err.response?.status;
    const apiData = err.response?.data;
    console.error("Error creando checkout Go Cuotas");

    res.status(apiStatus || 500).json({
      error: "Error al crear checkout",
      detail: apiData || err.message,
    });
  }
};

// ============================
// GET /api/gocuotas/checkout/:id
// ============================
export const getCheckoutStatus = async (req, res) => {
  try {
    const hasApiKey = !!process.env.GOCUOTAS_API_KEY_SANDBOX;
    const token = hasApiKey ? null : await getGocuotasToken();

    const response = await axios.get(
      `${GOCUOTAS_BASE_URL}/checkouts/${req.params.id}`,
      {
        headers: {
          Authorization: hasApiKey
            ? `Bearer ${process.env.GOCUOTAS_API_KEY_SANDBOX}`
            : `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error consultando checkout");
    res.status(500).json({ error: "Error al consultar checkout: " + err.message });
  }
};

// ============================
// POST /api/gocuotas/webhook
// ============================
export const webhookGocuotas = async (req, res) => {
  try {
    const { checkout_id, order_reference_id, status, amount_in_cents, installments } = req.body;

    const orderData = global.gocuotasOrders?.[checkout_id];
    if (!orderData) {
      // console.warn("⚠️ No se encontraron datos de la orden:", checkout_id);
      return res.status(200).json({ received: true });
    }

    if (status === "approved") {
      try {
        // ⭐ VALIDAR PRECIOS EN LA BD — nunca confiar en el frontend
        let validatedItems, validatedTotal;
        try {
          const validation = await validateCartPrices(orderData.items);
          validatedItems = validation.validatedItems;
          validatedTotal = validation.totals.total;
          if (validation.warnings.length > 0) {
            console.warn("⚠️ Advertencias de validación de carrito (GoCuotas webhook):", validation.warnings);
          }
        } catch (valErr) {
          console.error("❌ Error validando precios (GoCuotas webhook):", valErr.message);
          return res.status(200).json({ received: true, error: "Validación de precios falló" });
        }

        // ⭐ VERIFICAR que el monto cobrado coincida con el validado
        const montoValidadoCents = Math.round((validatedTotal + (orderData.shippingCost || 0)) * 100);
        const toleranciaCents = 100; // $1 de tolerancia
        if (amount_in_cents && Math.abs(amount_in_cents - montoValidadoCents) > toleranciaCents) {
          console.error(
            `❌ MONTO MANIPULADO (GoCuotas webhook): cobrado ${amount_in_cents}¢, validado ${montoValidadoCents}¢`
          );
          return res.status(200).json({ received: true, error: "Monto no coincide" });
        }

        const newOrder = await crearOrdenDesdePago({
          paymentMethod: "gocuotas",
          paymentId: checkout_id,
          orderReference: order_reference_id,
          customerData: orderData.customerData,
          items: validatedItems,
          totalPrice: validatedTotal,
          shippingCost: orderData.shippingCost,
          status: "completed",
          installments: installments || 1,
          metadata: {
            ...orderData.metadata,
            gocuotasCheckoutId: checkout_id,
            installments,
          },
        });
        delete global.gocuotasOrders[checkout_id];
        // console.log("✅ Orden creada:", newOrder._id);
      } catch (err) {
        console.error("Error creando orden");
      }
    } else if (["rejected", "cancelled", "expired"].includes(status)) {
      delete global.gocuotasOrders[checkout_id];
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error procesando webhook Go Cuotas");
    res.status(200).json({ received: true });
  }
};

// ============================
// POST /api/gocuotas/process-payment
// ============================
export const processPayment = async (req, res) => {
  try {
    const { checkoutId, orderReference } = req.body;
    const hasApiKey = !!process.env.GOCUOTAS_API_KEY_SANDBOX;
    const token = hasApiKey ? null : await getGocuotasToken();

    const response = await axios.get(
      `${GOCUOTAS_BASE_URL}/checkouts/${checkoutId}`,
      {
        headers: {
          Authorization: hasApiKey
            ? `Bearer ${process.env.GOCUOTAS_API_KEY_SANDBOX}`
            : `Bearer ${token}`,
        },
      }
    );

    const checkoutStatus = response.data;
    if (checkoutStatus.status !== "approved") {
      return res.status(400).json({ error: "Pago no aprobado", status: checkoutStatus.status });
    }

    const orderData = global.gocuotasOrders?.[checkoutId];
    if (!orderData) {
      return res.status(400).json({ error: "No se encontraron datos de la orden" });
    }

    // ⭐ VALIDAR PRECIOS EN LA BD — nunca confiar en el frontend
    let validatedItems, validatedTotal;
    try {
      const validation = await validateCartPrices(orderData.items);
      validatedItems = validation.validatedItems;
      validatedTotal = validation.totals.total;
      if (validation.warnings.length > 0) {
        console.warn("⚠️ Advertencias de validación de carrito (GoCuotas):", validation.warnings);
      }
    } catch (valErr) {
      console.error("❌ Error validando precios (GoCuotas process-payment):", valErr.message);
      return res.status(400).json({ error: "Error validando productos del carrito" });
    }

    // ⭐ VERIFICAR que el monto cobrado coincida con el validado
    const montoValidadoCents = Math.round((validatedTotal + (orderData.shippingCost || 0)) * 100);
    const montoCobradoCents = checkoutStatus.amount_in_cents;
    const toleranciaCents = 100; // $1 de tolerancia
    if (montoCobradoCents && Math.abs(montoCobradoCents - montoValidadoCents) > toleranciaCents) {
      console.error(
        `❌ MONTO MANIPULADO (GoCuotas): cobrado ${montoCobradoCents}¢, validado ${montoValidadoCents}¢`
      );
      return res.status(400).json({ error: "El monto cobrado no coincide con el precio real" });
    }

    const newOrder = await crearOrdenDesdePago({
      paymentMethod: "gocuotas",
      paymentId: checkoutId,
      orderReference,
      customerData: orderData.customerData,
      items: validatedItems,
      totalPrice: validatedTotal,
      shippingCost: orderData.shippingCost,
      status: "completed",
      installments: checkoutStatus.installments || 1,
      metadata: {
        ...orderData.metadata,
        gocuotasCheckoutId: checkoutId,
        installments: checkoutStatus.installments,
      },
    });

    delete global.gocuotasOrders[checkoutId];

    res.json({ success: true, orderId: newOrder._id, message: "Pago procesado correctamente" });
  } catch (err) {
    console.error("Error procesando pago");
    res.status(500).json({ error: "Error al procesar pago: " + err.message });
  }
};
