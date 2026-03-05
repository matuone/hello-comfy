// backend/services/orderService.js
import Order from "../models/Order.js";
import StockColor from "../models/StockColor.js";
import { enviarEmailConfirmacionOrden, enviarEmailAlAdmin } from "./emailService.js";

/**
 * Generar el siguiente código de orden secuencial
 * @returns {Promise<String>} Código de orden (ej: "01", "02", "10", "100")
 */
async function generarCodigoOrden() {
  try {
    // Buscar el mayor código numérico existente (no el más reciente por fecha,
    // ya que órdenes recuperadas o de test pueden tener createdAt desincronizado)
    const result = await Order.aggregate([
      { $match: { code: { $regex: /^\d+$/ } } },
      { $project: { codeNum: { $toInt: "$code" } } },
      { $sort: { codeNum: -1 } },
      { $limit: 1 },
    ]);

    if (result.length === 0) return "01";

    const nextNumber = result[0].codeNum + 1;
    return String(nextNumber).padStart(2, "0");
  } catch (error) {
    console.error("Error generando código de orden:", error);
    return `ORD-${Date.now()}`;
  }
}

/**
 * Crear una orden desde un pago confirmado de Mercado Pago
 * @param {Object} paymentData - Datos del pago de Mercado Pago
 * @param {Object} pendingOrderData - Datos de la orden pendiente (del localStorage del cliente)
 * @returns {Promise<Object>} La orden creada
 */
export async function crearOrdenDesdePago(paymentData, pendingOrderData) {
  try {
    // console.log("🔄 Iniciando crearOrdenDesdePago");
    // console.log("📋 PaymentData:", { id: paymentData.id, status: paymentData.status, email: paymentData.payer?.email });
    // console.log("📋 PendingOrderData:", { email: pendingOrderData?.formData?.email, itemsCount: pendingOrderData?.items?.length });

    // Preparar datos de la orden (el código se genera dentro del bloque de save con retry)
    const orderData = {
      code: null, // se asigna en el retry loop
      userId: pendingOrderData.userId || null, // Vincular usuario si está autenticado
      paymentId: paymentData.id || paymentData.paymentId || null, // ID del pago del proveedor (para reembolsos)
      customer: {
        email: paymentData.payer?.email || pendingOrderData.formData?.email,
        name: paymentData.payer?.name || pendingOrderData.formData?.name,
        phone: pendingOrderData.formData?.phone || null,
        dni: pendingOrderData.formData?.dni || null,
      },
      status: "recibido",
      pagoEstado: paymentData.status === "approved" ? "recibido" : "pendiente",
      paymentMethod: pendingOrderData.formData?.paymentMethod || "mercadopago",
      paymentProof: pendingOrderData.paymentProof || null,
      paymentProofName: pendingOrderData.paymentProofName || null,
      envioEstado: "pendiente",
      shipping: {
        method: pendingOrderData.formData?.shippingMethod || "home",
        address: pendingOrderData.formData?.address,
        postalCode: pendingOrderData.formData?.postalCode || null,
        province: pendingOrderData.formData?.province || null,
        localidad: pendingOrderData.formData?.localidad || null,
        pickPoint: pendingOrderData.formData?.pickPoint,
        branchCode: pendingOrderData.formData?.selectedAgency?.code || null,
        branchName: pendingOrderData.formData?.selectedAgency?.name || null,
        branchAddress: pendingOrderData.formData?.selectedAgency
          ? `${pendingOrderData.formData.selectedAgency.address || ''}, ${pendingOrderData.formData.selectedAgency.locality || ''}`
          : null,
      },
      isGift: pendingOrderData.formData?.isGift || false,
      giftMessage: pendingOrderData.formData?.giftMessage || "",
      promoCode: pendingOrderData.formData?.promoCode || null,
      items: pendingOrderData.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        size: item.size || null,
        color: item.color || null,
      })),
      totals: (() => {
        const tb = pendingOrderData.totalsBreakdown;
        if (tb) {
          return {
            subtotal: tb.subtotal,
            shipping: tb.shipping || 0,
            promo3x2Discount: tb.promo3x2Discount || 0,
            promoDiscount: tb.promoDiscount || 0,
            transferDiscount: tb.transferDiscount || 0,
            discount: (tb.promo3x2Discount || 0) + (tb.promoDiscount || 0) + (tb.transferDiscount || 0),
            total: tb.total,
          };
        }
        const shippingFallback = pendingOrderData.shippingCost || 0;
        return {
          subtotal: pendingOrderData.totalPrice,
          shipping: shippingFallback,
          promo3x2Discount: 0,
          promoDiscount: 0,
          transferDiscount: 0,
          discount: 0,
          total: paymentData.transaction_amount || (pendingOrderData.totalPrice + shippingFallback),
        };
      })(),
      date: new Date().toLocaleString("es-AR"),
      timeline: (() => {
        const paymentMethodLabels = {
          mercadopago: "Mercado Pago",
          gocuotas: "Go Cuotas",
          modo: "MODO",
          transfer: "Transferencia bancaria",
          cuentadni: "Cuenta DNI",
        };
        const paymentStatusLabels = {
          approved: "Pago aprobado",
          pending: "Pago pendiente",
          rejected: "Pago rechazado",
          cancelled: "Pago cancelado",
          refunded: "Pago reembolsado",
          in_process: "Pago en proceso",
        };
        const methodLabel = paymentMethodLabels[pendingOrderData.formData?.paymentMethod] || pendingOrderData.formData?.paymentMethod || "Pago";
        const statusLabel = paymentStatusLabels[paymentData.status] || (paymentData.status === "pending" ? "Pago pendiente de confirmación" : "Pago recibido");
        return [
          {
            status: `${statusLabel} - ${methodLabel}`,
            date: new Date().toLocaleString("es-AR"),
          },
          {
            status: "Orden recibida",
            date: new Date().toLocaleString("es-AR"),
          },
        ];
      })(),
    };

    // Crear la orden en BD (con retry en caso de colisión de código)
    let order;
    let intentos = 3;
    while (intentos > 0) {
      try {
        orderData.code = await generarCodigoOrden();
        order = new Order(orderData);
        await order.save();
        break;
      } catch (err) {
        if (err.code === 11000 && intentos > 1) {
          // Código duplicado por race condition — reintentar con el siguiente
          console.warn(`⚠️ Código de orden duplicado (${orderData.code}), reintentando...`);
          intentos--;
          continue;
        }
        throw err;
      }
    }

    // ⭐ DESCONTAR STOCK al crear la orden
    // Soporta dos estilos de llamada:
    //   1) crearOrdenDesdePago(paymentData, pendingOrderData)  → MP, transferencia
    //   2) crearOrdenDesdePago({ items, ... })                 → GoCuotas (1 arg)
    const itemsSource = pendingOrderData?.items ?? paymentData.items ?? [];
    const stockDecrements = itemsSource.filter(
      (item) => item.stockColorId && item.size && item.quantity > 0
    );
    await Promise.all(
      stockDecrements.map((item) =>
        StockColor.findByIdAndUpdate(
          item.stockColorId,
          { $inc: { [`talles.${item.size}`]: -item.quantity } }
        ).catch((err) =>
          console.error(`❌ Error descontando stock para ${item.name} talle ${item.size}:`, err.message)
        )
      )
    );
    if (stockDecrements.length > 0) {
      console.log(`✅ Stock descontado para orden ${order.code}:`, stockDecrements.map(i => `${i.name} ${i.size} x${i.quantity}`));
    }

    // console.log("✅ Orden creada exitosamente:", { code: order.code, email: order.customer.email, paymentId: paymentData.id });

    // Enviar email de confirmación al cliente
    // console.log("📧 Iniciando envío de email a:", order.customer.email);
    const emailSent = await enviarEmailConfirmacionOrden(order);
    // console.log("📧 Email enviado:", emailSent ? "SÍ ✅" : "NO ❌");

    // Enviar email al admin
    // console.log("📧 Iniciando envío de email al admin");
    try {
      const adminEmailSent = await enviarEmailAlAdmin(order);
      // console.log("📧 Email al admin enviado:", adminEmailSent ? "SÍ ✅" : "NO ❌");
    } catch (adminEmailError) {
      console.error("❌ Error enviando email al admin (no falla la orden):", adminEmailError.message);
    }

    return order;
  } catch (error) {
    console.error("❌ Error creando orden desde pago:", error);
    throw error;
  }
}

/**
 * Actualizar estado de pago de una orden
 * @param {String} externalReference - Referencia externa (código de Mercado Pago)
 * @param {String} paymentStatus - Estado del pago
 * @returns {Promise<Object>} La orden actualizada
 */
export async function actualizarEstadoPago(externalReference, paymentStatus) {
  try {
    const pagoEstado = paymentStatus === "approved" ? "recibido" : "pendiente";

    const order = await Order.findOneAndUpdate(
      { code: externalReference },
      {
        pagoEstado,
        $push: {
          timeline: {
            status: `Pago ${pagoEstado === "recibido" ? "confirmado" : "pendiente"}`,
            date: new Date().toLocaleString("es-AR"),
          },
        },
      },
      { new: true }
    );

    if (!order) {
      console.warn("⚠️ Orden no encontrada para actualizar:", externalReference);
      return null;
    }

    // console.log("✅ Estado de pago actualizado:", { code: order.code, pagoEstado: order.pagoEstado });

    return order;
  } catch (error) {
    console.error("❌ Error actualizando estado de pago:", error);
    throw error;
  }
}

/**
 * Obtener una orden por código
 * @param {String} code - Código de la orden
 * @returns {Promise<Object>} La orden
 */
export async function obtenerOrdenPorCodigo(code) {
  try {
    const order = await Order.findOne({ code });
    return order;
  } catch (error) {
    console.error("❌ Error obteniendo orden:", error);
    throw error;
  }
}

/**
 * Obtener órdenes por email del cliente
 * @param {String} email - Email del cliente
 * @returns {Promise<Array>} Array de órdenes
 */
export async function obtenerOrdenesPorEmail(email) {
  try {
    const orders = await Order.find({ "customer.email": email.toLowerCase() });
    return orders;
  } catch (error) {
    console.error("❌ Error obteniendo órdenes por email:", error);
    throw error;
  }
}
