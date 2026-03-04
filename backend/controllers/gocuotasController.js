// backend/controllers/gocuotasController.js
import axios from "axios";
import {
  crearOrdenDesdePago,
  actualizarEstadoPago,
  obtenerOrdenPorCodigo,
} from "../services/orderService.js";
import { validateCartPrices } from "../services/validateCartPrices.js";
import { validateShippingCost } from "../services/validateShippingCost.js";
import PendingOrder from "../models/PendingOrder.js";

// ============================
// CONFIG
// ============================
const GOCUOTAS_BASE_URL = process.env.GOCUOTAS_BASE_URL || "https://www.gocuotas.com/api_redirect/v1";

// Si usas email/password se usará token; si usas API key no se usa token
let GOCUOTAS_TOKEN = null;
let TOKEN_EXPIRY = null;

const getGocuotasToken = async () => {
  // Si hay API key configurada, no usamos token
  if (process.env.GOCUOTAS_API_KEY) return null;

  if (GOCUOTAS_TOKEN && TOKEN_EXPIRY && Date.now() < TOKEN_EXPIRY) return GOCUOTAS_TOKEN;

  const email = process.env.GOCUOTAS_EMAIL;
  const password = process.env.GOCUOTAS_PASSWORD;
  if (!email || !password) {
    throw new Error("Credenciales de Go Cuotas no configuradas");
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

    const hasApiKey = !!process.env.GOCUOTAS_API_KEY;
    const hasUserPass = !!(process.env.GOCUOTAS_EMAIL && process.env.GOCUOTAS_PASSWORD);
    if (!hasApiKey && !hasUserPass) {
      return res.status(500).json({ error: "Go Cuotas no está configurado" });
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

    // Parsear teléfono: stripear código de país 54 y prefijo móvil 9 si están presentes
    // Ej: "5491125025895" → areaCode="11", telephoneNumber="25025895"
    let phoneNumber = (customerData.phone || "").replace(/[^0-9]/g, "");
    if (phoneNumber.startsWith("549")) phoneNumber = phoneNumber.slice(3);
    else if (phoneNumber.startsWith("54")) phoneNumber = phoneNumber.slice(2);
    if (phoneNumber.startsWith("9") && phoneNumber.length > 10) phoneNumber = phoneNumber.slice(1);
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

    console.log("📦 GoCuotas checkout payload:", JSON.stringify(checkoutData, null, 2));
    const response = await axios.post(
      `${GOCUOTAS_BASE_URL}/checkouts`,
      checkoutData,
      {
        headers: {
          Authorization: hasApiKey
            ? `Bearer ${process.env.GOCUOTAS_API_KEY}`
            : `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ GoCuotas checkout creado:", JSON.stringify(response.data, null, 2));

    // GoCuotas Redirect V1 no devuelve un campo 'id' directo — extraerlo de url_init
    // Ej: "https://www.gocuotas.com/checkouts/7429118" → "7429118"
    const urlInit = response.data.url_init || "";
    const checkoutId = response.data.id
      || urlInit.split("/checkouts/").pop()
      || null;

    // Guardar datos de la orden pendiente en MongoDB (sobrevive reinicios del servidor)
    await PendingOrder.findOneAndUpdate(
      { orderReference },
      {
        checkoutId,
        paymentMethod: "gocuotas",
        orderReference,
        customerData,
        items: validatedItems,
        totalPrice: totals.total,
        shippingMethod: metadata?.shippingMethod || null,
        postalCode: customerData?.postalCode || null,
        metadata,
      },
      { upsert: true, new: true }
    );

    res.json({
      id: checkoutId,
      url_init: urlInit,
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
    const hasApiKey = !!process.env.GOCUOTAS_API_KEY;
    const token = hasApiKey ? null : await getGocuotasToken();

    const response = await axios.get(
      `${GOCUOTAS_BASE_URL}/checkouts/${req.params.id}`,
      {
        headers: {
          Authorization: hasApiKey
            ? `Bearer ${process.env.GOCUOTAS_API_KEY}`
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
    console.log("🔔 GoCuotas webhook recibido:", JSON.stringify(req.body, null, 2));
    const { checkout_id, order_reference_id, status, amount_in_cents, installments } = req.body;

    const orderData = await PendingOrder.findOne({ checkoutId: checkout_id });
    if (!orderData) {
      console.warn("⚠️ No se encontraron datos de la orden en BD:", checkout_id);
      return res.status(200).json({ received: true });
    }

    if (status === "approved") {
      try {
        // ⭐ VALIDAR PRECIOS EN LA BD — nunca confiar en el frontend
        let validatedItems, validatedTotal, gcValidation;
        try {
          gcValidation = await validateCartPrices(orderData.items);
          validatedItems = gcValidation.validatedItems;
          validatedTotal = gcValidation.totals.total;
          if (gcValidation.warnings.length > 0) {
            console.warn("⚠️ Advertencias de validación de carrito (GoCuotas webhook):", gcValidation.warnings);
          }
        } catch (valErr) {
          console.error("❌ Error validando precios (GoCuotas webhook):", valErr.message);
          return res.status(200).json({ received: true, error: "Validación de precios falló" });
        }

        // ⭐ VERIFICAR que el monto cobrado coincida con el validado
        const { shippingCost: validatedShipping } = await validateShippingCost({
          shippingMethod: orderData.shippingMethod || orderData.metadata?.shippingMethod,
          postalCode: orderData.postalCode || orderData.customerData?.postalCode,
          items: validatedItems,
          hasFreeShipping: gcValidation.hasFreeShipping,
        });
        const montoValidadoCents = Math.round((validatedTotal + validatedShipping) * 100);
        const toleranciaCents = 100; // $1 de tolerancia
        if (amount_in_cents && Math.abs(amount_in_cents - montoValidadoCents) > toleranciaCents) {
          console.error(
            `❌ MONTO MANIPULADO (GoCuotas webhook): cobrado ${amount_in_cents}¢, validado ${montoValidadoCents}¢`
          );
          return res.status(200).json({ received: true, error: "Monto no coincide" });
        }

        const wcd = orderData.customerData || {};
        const newOrder = await crearOrdenDesdePago(
          {
            id: checkout_id,
            status: "approved",
            payer: { email: wcd.email, name: wcd.name },
            transaction_amount: validatedTotal + validatedShipping,
          },
          {
            userId: orderData.metadata?.userId || null,
            formData: {
              email: wcd.email,
              name: wcd.name,
              phone: wcd.phone || null,
              dni: wcd.dni || null,
              postalCode: wcd.postalCode || orderData.postalCode || null,
              address: wcd.address || null,
              province: wcd.province || null,
              localidad: wcd.localidad || null,
              selectedAgency: wcd.selectedAgency || null,
              shippingMethod: orderData.shippingMethod || orderData.metadata?.shippingMethod || null,
              paymentMethod: "gocuotas",
              promoCode: orderData.metadata?.promoCode || null,
            },
            items: validatedItems,
            totalPrice: validatedTotal,
            totalsBreakdown: {
              subtotal: validatedTotal,
              shipping: validatedShipping,
              promo3x2Discount: 0,
              promoDiscount: 0,
              transferDiscount: 0,
              total: validatedTotal + validatedShipping,
            },
          }
        );
        await PendingOrder.deleteOne({ checkoutId: checkout_id });
        // console.log("✅ Orden creada:", newOrder._id);
      } catch (err) {
        console.error("Error creando orden");
      }
    } else if (["rejected", "cancelled", "expired"].includes(status)) {
      console.log(`❌ GoCuotas pago ${status} para checkout ${checkout_id}. Body completo:`, JSON.stringify(req.body, null, 2));
      await PendingOrder.deleteOne({ checkoutId: checkout_id });
    } else {
      console.log(`⚠️ GoCuotas status desconocido '${status}' para checkout ${checkout_id}:`, JSON.stringify(req.body, null, 2));
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

    if (!checkoutId && !orderReference) {
      return res.status(400).json({ error: "checkoutId o orderReference requerido" });
    }

    // Buscar la PendingOrder por orderReference (preferido) o checkoutId
    const orderData = await PendingOrder.findOne(
      orderReference ? { orderReference } : { checkoutId }
    );
    if (!orderData) {
      // Puede que ya se procesó antes — verificar si la orden ya existe
      const { default: Order } = await import("../models/Order.js");
      const existingOrder = orderReference
        ? await Order.findOne({ "metadata.gocuotasOrderReference": orderReference })
        : null;
      if (existingOrder) {
        console.log(`⚠️ Orden GoCuotas ya procesada: ${existingOrder.code}`);
        return res.json({ success: true, orderId: existingOrder._id, alreadyProcessed: true });
      }
      return res.status(404).json({ error: "No se encontró la orden pendiente" });
    }

    // NOTA: No consultamos GoCuotas para verificar el status porque GoCuotas
    // elimina el checkout inmediatamente después del pago exitoso.
    // La garantía es que GoCuotas SOLO redirige a url_success cuando el pago fue aprobado.
    // Los precios siempre se revalidan contra nuestra BD.
    console.log(`✅ GoCuotas process-payment: orderReference=${orderData.orderReference}, checkoutId=${orderData.checkoutId}`);

    // ⭐ VALIDAR PRECIOS EN LA BD — nunca confiar en el frontend
    let validatedItems, validatedTotal, gcValidation;
    try {
      gcValidation = await validateCartPrices(orderData.items);
      validatedItems = gcValidation.validatedItems;
      validatedTotal = gcValidation.totals.total;
      if (gcValidation.warnings.length > 0) {
        console.warn("⚠️ Advertencias de validación de carrito (GoCuotas):", gcValidation.warnings);
      }
    } catch (valErr) {
      console.error("❌ Error validando precios (GoCuotas process-payment):", valErr.message);
      return res.status(400).json({ error: "Error validando productos del carrito" });
    }

    const { shippingCost: validatedShippingProc } = await validateShippingCost({
      shippingMethod: orderData.shippingMethod || orderData.metadata?.shippingMethod,
      postalCode: orderData.postalCode || orderData.customerData?.postalCode,
      items: validatedItems,
      hasFreeShipping: gcValidation.hasFreeShipping,
    });

    const cd = orderData.customerData || {};
    const newOrder = await crearOrdenDesdePago(
      // paymentData (formato compatible con crearOrdenDesdePago)
      {
        id: checkoutId,
        status: "approved", // GoCuotas confirmado = aprobado
        payer: { email: cd.email, name: cd.name },
        transaction_amount: validatedTotal + validatedShippingProc,
      },
      // pendingOrderData
      {
        userId: orderData.metadata?.userId || null,
        formData: {
          email: cd.email,
          name: cd.name,
          phone: cd.phone || null,
          dni: cd.dni || null,
          postalCode: cd.postalCode || orderData.postalCode || null,
          address: cd.address || null,
          province: cd.province || null,
          localidad: cd.localidad || null,
          selectedAgency: cd.selectedAgency || null,
          shippingMethod: orderData.shippingMethod || orderData.metadata?.shippingMethod || null,
          paymentMethod: "gocuotas",
          promoCode: orderData.metadata?.promoCode || null,
        },
        items: validatedItems,
        totalPrice: validatedTotal,
        totalsBreakdown: {
          subtotal: validatedTotal,
          shipping: validatedShippingProc,
          promo3x2Discount: 0,
          promoDiscount: 0,
          transferDiscount: 0,
          total: validatedTotal + validatedShippingProc,
        },
        metadata: {
          ...orderData.metadata,
          gocuotasOrderReference: orderData.orderReference,
          gocuotasCheckoutId: orderData.checkoutId,
        },
      }
    );

    await PendingOrder.deleteOne(
      orderData.orderReference ? { orderReference: orderData.orderReference } : { checkoutId: orderData.checkoutId }
    );
    console.log(`✅ Orden GoCuotas creada: ${newOrder.code}`);

    res.json({ success: true, orderId: newOrder._id, message: "Pago procesado correctamente" });
  } catch (err) {
    console.error("Error procesando pago");
    res.status(500).json({ error: "Error al procesar pago: " + err.message });
  }
};
