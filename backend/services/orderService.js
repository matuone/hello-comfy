// backend/services/orderService.js
import Order from "../models/Order.js";
import { enviarEmailConfirmacionOrden } from "./emailService.js";

/**
 * Generar el siguiente código de orden secuencial
 * @returns {Promise<String>} Código de orden (ej: "01", "02", "10", "100")
 */
async function generarCodigoOrden() {
  try {
    // Obtener la última orden creada
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    
    if (!lastOrder || !lastOrder.code) {
      // Primera orden
      return "01";
    }

    // Extraer el número de la última orden
    const lastNumber = parseInt(lastOrder.code, 10);
    
    if (isNaN(lastNumber)) {
      // Si el código anterior no era numérico, empezar desde 01
      const count = await Order.countDocuments();
      return String(count + 1).padStart(2, '0');
    }

    // Incrementar y formatear con mínimo 2 dígitos
    const nextNumber = lastNumber + 1;
    return String(nextNumber).padStart(2, '0');
  } catch (error) {
    console.error("Error generando código de orden:", error);
    // Fallback: usar timestamp
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
    // Generar código único de orden secuencial
    const code = await generarCodigoOrden();

    // Preparar datos de la orden
    const orderData = {
      code,
      customer: {
        email: paymentData.payer?.email || pendingOrderData.formData?.email,
        name: paymentData.payer?.name || pendingOrderData.formData?.name,
      },
      status: "recibido",
      pagoEstado: paymentData.status === "approved" ? "recibido" : "pendiente",
      envioEstado: "pendiente",
      shipping: {
        method: pendingOrderData.formData?.shippingMethod || "home",
        address: pendingOrderData.formData?.address,
        pickPoint: pendingOrderData.formData?.pickPoint,
      },
      items: pendingOrderData.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      totals: {
        subtotal: pendingOrderData.totalPrice,
        shipping: 0,
        discount: 0,
        total: paymentData.transaction_amount || pendingOrderData.totalPrice,
      },
      date: new Date().toLocaleString("es-AR"),
      timeline: [
        {
          status: `Pago confirmado - Mercado Pago (${paymentData.status})`,
          date: new Date().toLocaleString("es-AR"),
        },
        {
          status: "Orden recibida",
          date: new Date().toLocaleString("es-AR"),
        },
      ],
    };

    // Crear la orden en BD
    const order = new Order(orderData);
    await order.save();

    console.log("✅ Orden creada desde Mercado Pago:", {
      code: order.code,
      email: order.customer.email,
      paymentId: paymentData.id,
    });

    // Enviar email de confirmación al cliente
    await enviarEmailConfirmacionOrden(order);

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

    console.log("✅ Estado de pago actualizado:", {
      code: order.code,
      pagoEstado: order.pagoEstado,
    });

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
