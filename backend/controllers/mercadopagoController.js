// backend/controllers/mercadopagoController.js
import axios from "axios";
import {
  crearOrdenDesdePago,
  actualizarEstadoPago,
  obtenerOrdenPorCodigo,
} from "../services/orderService.js";
import { validateCartPrices } from "../services/validateCartPrices.js";
import { validateShippingCost } from "../services/validateShippingCost.js";
import { assertValidCheckoutShipping } from "../services/validateCheckoutShipping.js";
import PendingOrder from "../models/PendingOrder.js";
import Order from "../models/Order.js";
/**
 * POST /api/mercadopago/create-preference
 * Crea una preferencia de pago en Mercado Pago
 */
export const createPreference = async (req, res) => {
  try {
    const { items, totalPrice, customerData, shippingCost = 0, metadata = {} } = req.body;
    const shippingMethod = metadata?.shippingMethod;

    const normalizedEnvFrontendUrl = (process.env.FRONTEND_URL || "").trim().replace(/\/$/, "");
    const normalizedOrigin = (req.headers.origin || "").trim().replace(/\/$/, "");
    const frontendBaseUrl =
      normalizedEnvFrontendUrl ||
      (/^https?:\/\//i.test(normalizedOrigin) ? normalizedOrigin : "") ||
      "https://hellocomfy.com.ar";

    const normalizedEnvApiUrl = (process.env.API_URL || "").trim().replace(/\/$/, "");
    const apiBaseUrl = normalizedEnvApiUrl || "https://hellocomfy.com.ar";
    const includePayerInPreference = String(process.env.MERCADOPAGO_INCLUDE_PAYER || "false").toLowerCase() === "true";

    const rawPhone = String(customerData?.phone || "");
    const phoneDigits = rawPhone.replace(/\D/g, "");
    const rawPostalCode = String(customerData?.postalCode || "").trim();
    const validPostalCode = rawPostalCode.length >= 3 && rawPostalCode.length <= 12;

    // Mercado Pago mobile puede fallar con payer forzado: por defecto enviamos preferencia mínima.
    let payer = null;
    if (includePayerInPreference) {
      payer = {
        email: customerData.email,
        name: customerData.name || "Cliente",
      };

      if (phoneDigits.length >= 6 && phoneDigits.length <= 15) {
        payer.phone = { number: phoneDigits };
      }

      if (validPostalCode) {
        payer.address = { zip_code: rawPostalCode };
      }
    }

    // Validar que tenemos la access token
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("MERCADOPAGO_ACCESS_TOKEN no configurado");
      return res.status(500).json({
        error: "MERCADOPAGO_ACCESS_TOKEN no configurado",
      });
    }

    // DEBUG: Verificar variables de entorno
    // console.log("🔍 Variables de entorno:");
    // console.log("  FRONTEND_URL:", process.env.FRONTEND_URL);
    // console.log("  API_URL:", process.env.API_URL); // No exponer variables en producción

    // Validar items
    if (!items || items.length === 0) {
      console.error("Items vacíos o no proporcionados");
      return res.status(400).json({
        error: "Items requeridos",
      });
    }

    // Validar customerData
    if (!customerData || !customerData.email) {
      console.error("Customer data incompleto");
      return res.status(400).json({
        error: "Datos del cliente incompletos (email requerido)",
      });
    }

    assertValidCheckoutShipping({
      shippingMethod,
      pickPoint: customerData?.pickPoint,
      selectedAgency: customerData?.selectedAgency,
    });

    // Si es envío a domicilio, exigir dirección mínima para evitar órdenes incompletas
    if (
      (shippingMethod === "correo-home" || shippingMethod === "home") &&
      (!customerData.address || !customerData.province || !customerData.localidad || !customerData.postalCode)
    ) {
      return res.status(400).json({
        error: "Faltan datos de envío a domicilio (dirección, provincia, localidad o CP)",
      });
    }

    // ⭐ VALIDAR PRECIOS CONTRA LA BD — nunca confiar en el frontend
    let validatedItems, totals, warnings, cartValidation;
    try {
      cartValidation = await validateCartPrices(items, {
        promoCode: metadata?.promoCode || null,
      });
      validatedItems = cartValidation.validatedItems;
      totals = cartValidation.totals;
      warnings = cartValidation.warnings;

      if (warnings.length > 0) {
        console.warn("⚠️ Advertencias de validación de carrito (MP create-preference):", warnings);
      }
    } catch (validationError) {
      console.error("❌ Error validando precios del carrito:", validationError.message);
      return res.status(400).json({ error: "Error validando productos del carrito" });
    }

    // Construir items para Mercado Pago con PRECIOS VALIDADOS de la BD
    const mercadopagoItems = validatedItems.map((item) => {
      return {
        title: item.name || "Producto",
        description: `${Array.isArray(item.category) ? item.category.join(", ") : (item.category || "")}${item.subcategory ? " - " + (Array.isArray(item.subcategory) ? item.subcategory.join(", ") : item.subcategory) : ""}`,
        picture_url: item.image || "",
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "ARS",
      };
    });

    // Aplicar descuentos globales (cupón promo, 3x2) proporcionalmente a cada item
    // para que el total de items de MP coincida con el total validado
    const globalDiscount = (totals.promoDiscount || 0) + (totals.promo3x2Discount || 0) + (totals.transferDiscount || 0);
    if (globalDiscount > 0) {
      const itemsSubtotal = mercadopagoItems.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
      if (itemsSubtotal > 0) {
        const ratio = (itemsSubtotal - globalDiscount) / itemsSubtotal;
        mercadopagoItems.forEach((item) => {
          item.unit_price = Math.round(item.unit_price * ratio * 100) / 100;
        });
        // Ajustar centavos de redondeo en el último item para que el total sea exacto
        const newTotal = mercadopagoItems.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
        const diff = Math.round((totals.total - newTotal) * 100) / 100;
        if (Math.abs(diff) > 0 && mercadopagoItems.length > 0) {
          mercadopagoItems[mercadopagoItems.length - 1].unit_price =
            Math.round((mercadopagoItems[mercadopagoItems.length - 1].unit_price + diff / mercadopagoItems[mercadopagoItems.length - 1].quantity) * 100) / 100;
        }
      }
    }

    // Agregar envío como item si corresponde — RECALCULADO desde la API
    const { shippingCost: validatedShipping } = await validateShippingCost({
      shippingMethod: metadata?.shippingMethod,
      postalCode: customerData?.postalCode,
      items: validatedItems,
      clientShippingCost: shippingCost,
      hasFreeShipping: cartValidation.hasFreeShipping,
    });

    if (validatedShipping > 0) {
      mercadopagoItems.push({
        title: "Costo de envío",
        description: "Envío",
        quantity: 1,
        unit_price: validatedShipping,
        currency_id: "ARS",
      });
    }

    // Crear la preferencia con precios validados
    const preference = {
      items: mercadopagoItems,
      back_urls: {
        success: `${frontendBaseUrl}/payment/success`,
        failure: `${frontendBaseUrl}/payment/failure`,
        pending: `${frontendBaseUrl}/payment/pending`,
      },
      notification_url: `${apiBaseUrl}/api/mercadopago/webhook`,
      external_reference: `order_${Date.now()}`,
      metadata: metadata,
      auto_return: "approved",
    };

    if (payer) {
      preference.payer = payer;
    }

    // ⭐ Guardar datos del pedido en MongoDB para recuperarlos si el frontend los pierde
    try {
      await PendingOrder.create({
        checkoutId: preference.external_reference,
        paymentMethod: "mercadopago",
        orderReference: preference.external_reference,
        customerData: {
          ...customerData,
          address: customerData.address || "",
          province: customerData.province || "",
          localidad: customerData.localidad || "",
          selectedAgency: customerData.selectedAgency || null,
          pickPoint: customerData.pickPoint || "",
        },
        items: validatedItems,
        totalPrice: totals.total,
        shippingCost: validatedShipping,
        shippingMethod: metadata?.shippingMethod,
        postalCode: customerData?.postalCode,
        metadata: {
          ...metadata,
          totalsBreakdown: {
            ...totals,
            shipping: validatedShipping,
            total: Math.round((totals.total + validatedShipping) * 100) / 100,
          },
        },
      });
    } catch (saveErr) {
      // No bloquear el flujo si falla el guardado en DB
      console.error("⚠️ No se pudo guardar PendingOrder para MP:", saveErr.message);
    }

    // console.log("🔄 Enviando preferencia a Mercado Pago:", JSON.stringify(preference, null, 2)); // No loggear payloads completos en producción

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

    // console.log("✅ Preferencia creada en Mercado Pago:", response.data.id);

    res.json({
      id: response.data.id,
      init_point: response.data.init_point,
      sandbox_init_point: response.data.sandbox_init_point,
    });
  } catch (error) {
    console.error("❌ Error creando preferencia Mercado Pago:", error.response?.data || error.message);
    res.status(error.statusCode || 500).json({
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
    // MercadoPago puede enviar datos por query params (IPN) o por body (Webhooks v2)
    const type = req.query.type || req.body?.type || req.body?.action;
    const paymentId = req.query?.data?.id || req.body?.data?.id;

    // Verificar que sea una notificación de pago válida
    if ((type === "payment" || type === "payment.created" || type === "payment.updated") && paymentId) {

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

      // Idempotencia: si la orden ya existe para este paymentId, no recrear.
      const existingOrder = await Order.findOne({ paymentId: String(paymentData.id) }).lean();
      if (existingOrder) {
        return res.sendStatus(200);
      }

      // console.log("📊 Detalles del pago:", {
      //   id: paymentData.id,
      //   status: paymentData.status,
      //   reference: externalReference,
      //   amount: paymentData.transaction_amount,
      // });

      // Actualizar estado de pago en BD
      if (externalReference) {
        await actualizarEstadoPago(externalReference, paymentData.status);

        // Si no existe orden previa y el pago está aprobado/pendiente,
        // crear la orden desde PendingOrder para cubrir fallas de retorno mobile.
        if (["approved", "pending"].includes(paymentData.status)) {
          const savedPending = await PendingOrder.findOne({ orderReference: externalReference }).lean();
          if (savedPending) {
            let recoveredPendingData = {
              formData: {
                ...savedPending.customerData,
                shippingMethod: savedPending.shippingMethod || savedPending.metadata?.shippingMethod,
                promoCode: savedPending.metadata?.promoCode || null,
                paymentMethod: "mercadopago",
                address: savedPending.customerData?.address || "",
                province: savedPending.customerData?.province || "",
                localidad: savedPending.customerData?.localidad || "",
                selectedAgency: savedPending.customerData?.selectedAgency || null,
                pickPoint: savedPending.customerData?.pickPoint || "",
              },
              items: savedPending.items,
              totalPrice: savedPending.totalPrice,
              shippingCost: savedPending.shippingCost,
              totalsBreakdown: savedPending.metadata?.totalsBreakdown || null,
              userId: savedPending.metadata?.userId || null,
            };

            try {
              const cartValidation = await validateCartPrices(
                recoveredPendingData.items,
                { promoCode: recoveredPendingData.formData?.promoCode || null }
              );
              recoveredPendingData.items = cartValidation.validatedItems;
              recoveredPendingData.totalPrice = cartValidation.totals.total;
            } catch (validationError) {
              console.error("❌ Error re-validando carrito recuperado en webhook:", validationError.message);
              return res.sendStatus(200);
            }

            const montoPagado = paymentData.transaction_amount;
            const totalItemsValidado = recoveredPendingData.totalPrice;
            if (montoPagado >= totalItemsValidado - 1) {
              recoveredPendingData.shippingCost = Math.max(0, Math.round((montoPagado - totalItemsValidado) * 100) / 100);
              await crearOrdenDesdePago(paymentData, recoveredPendingData);
            }
          }
        }
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

    // console.log("💳 Procesando pago confirmado con paymentId:", paymentId);
    // console.log("📋 PendingOrderData recibido:", !!pendingOrderData);
    // if (pendingOrderData) {
    //   console.log("   - Email:", pendingOrderData.formData?.email);
    //   console.log("   - Items:", pendingOrderData.items?.length || 0);
    // }

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

    // Idempotencia: si ya existe orden para este pago, devolverla.
    const existingOrder = await Order.findOne({ paymentId: String(paymentData.id) });
    if (existingOrder) {
      return res.json({
        success: true,
        message: "Pago ya procesado",
        order: {
          code: existingOrder.code,
          email: existingOrder.customer?.email,
          status: existingOrder.pagoEstado,
          total: existingOrder.totals?.total,
        },
      });
    }

    // console.log("💳 Procesando pago confirmado:", {
    //   id: paymentData.id,
    //   status: paymentData.status,
    //   amount: paymentData.transaction_amount,
    // });

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
      // ⭐ VALIDAR PRECIOS EN LA BD — nunca confiar en el frontend
      let validatedItems, cartValidation;
      try {
        cartValidation = await validateCartPrices(
          pendingOrderData.items,
          { promoCode: pendingOrderData.formData?.promoCode || null }
        );
        validatedItems = cartValidation.validatedItems;
        if (cartValidation.warnings.length > 0) {
          console.warn("⚠️ Advertencias de validación de carrito (MP):", cartValidation.warnings);
        }
        pendingOrderData.items = validatedItems;
        pendingOrderData.totalPrice = cartValidation.totals.total;
      } catch (validationError) {
        console.error("❌ Error validando precios del carrito:", validationError.message);
        return res.status(400).json({ error: "Error validando productos del carrito" });
      }

      // ⭐ VERIFICAR que el monto pagado cubre al menos el total de ítems validado
      // El envío se DERIVA del monto real cobrado por MP (no se re-llama a la API de Correo
      // ni se confía en localStorage, ambos podrían ser inconsistentes o manipulados).
      const montoPagado = paymentData.transaction_amount;
      const totalItemsValidado = pendingOrderData.totalPrice; // ya re-validado desde la BD

      if (montoPagado < totalItemsValidado - 1) {
        // El monto pagado es menor al costo de los productos → rechazo real
        console.error(
          `❌ MONTO INSUFICIENTE: pagado $${montoPagado}, valor de ítems validado $${totalItemsValidado}`
        );
        return res.status(400).json({
          error: "El monto pagado no cubre el precio real de los productos",
        });
      }

      // El envío es lo que MP cobró por encima del subtotal de ítems (fuente de verdad: MP API)
      const validatedShipping = Math.max(0, Math.round((montoPagado - totalItemsValidado) * 100) / 100);
      pendingOrderData.shippingCost = validatedShipping;
      console.log(`✅ Envío derivado del cobro de MP: $${validatedShipping} (pagado $${montoPagado} - ítems $${totalItemsValidado})`);

      order = await crearOrdenDesdePago(paymentData, pendingOrderData);
    } else {
      // ⭐ Intentar recuperar datos del pedido desde MongoDB (guardados al crear la preferencia)
      const externalReference = paymentData.external_reference;
      const savedPending = externalReference
        ? await PendingOrder.findOne({ orderReference: externalReference }).lean()
        : null;

      if (savedPending) {
        console.log("✅ PendingOrder recuperado desde MongoDB para:", externalReference);
        // Reconstruir pendingOrderData desde el registro guardado
        let recoveredPendingData = {
          formData: {
            ...savedPending.customerData,
            shippingMethod: savedPending.shippingMethod || savedPending.metadata?.shippingMethod,
            promoCode: savedPending.metadata?.promoCode || null,
            paymentMethod: "mercadopago",
            address: savedPending.customerData?.address || "",
            province: savedPending.customerData?.province || "",
            localidad: savedPending.customerData?.localidad || "",
            selectedAgency: savedPending.customerData?.selectedAgency || null,
            pickPoint: savedPending.customerData?.pickPoint || "",
          },
          items: savedPending.items,
          totalPrice: savedPending.totalPrice,
          shippingCost: savedPending.shippingCost,
          totalsBreakdown: savedPending.metadata?.totalsBreakdown || null,
          userId: savedPending.metadata?.userId || null,
        };

        // Re-validar precios contra BD (siempre)
        try {
          const cartValidation = await validateCartPrices(
            recoveredPendingData.items,
            { promoCode: recoveredPendingData.formData?.promoCode || null }
          );
          recoveredPendingData.items = cartValidation.validatedItems;
          recoveredPendingData.totalPrice = cartValidation.totals.total;
        } catch (validationError) {
          console.error("❌ Error re-validando carrito recuperado:", validationError.message);
          return res.status(400).json({ error: "Error validando productos del carrito" });
        }

        const montoPagado = paymentData.transaction_amount;
        const totalItemsValidado = recoveredPendingData.totalPrice;
        if (montoPagado < totalItemsValidado - 1) {
          console.error(`❌ MONTO INSUFICIENTE (recovered): pagado $${montoPagado}, ítems $${totalItemsValidado}`);
          return res.status(400).json({ error: "El monto pagado no cubre el precio real de los productos" });
        }
        recoveredPendingData.shippingCost = Math.max(0, Math.round((montoPagado - totalItemsValidado) * 100) / 100);

        order = await crearOrdenDesdePago(paymentData, recoveredPendingData);
      } else {
        console.warn("⚠️ No hay pendingOrderData ni registro en DB, actualizando estado existente");
        if (externalReference) {
          order = await actualizarEstadoPago(externalReference, paymentData.status);
        } else {
          console.error("❌ No hay external_reference y no hay pendingOrderData");
        }
      }
    }

    // console.log("📦 Orden procesada:", order ? order.code : "NO CREADA");

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
