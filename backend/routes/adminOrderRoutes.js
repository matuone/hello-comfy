

import express from "express";
const router = express.Router();
import axios from "axios";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import { enviarEmailRetiroPickup, enviarEmailPagoRecibido, enviarEmailSeguimiento, enviarEmailCancelacion, enviarEmailDevolucion } from "../services/emailService.js";

/* ============================================================
   ⭐ Notificar retiro listo (Pick Up)
   PATCH /api/admin/orders/:id/pickup-notify
============================================================ */
router.patch("/admin/orders/:id/pickup-notify", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { fechaRetiro } = req.body;
  if (!fechaRetiro) {
    return res.status(400).json({ error: "fechaRetiro requerida" });
  }
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
    if (order.pickupNotificado) {
      return res.status(400).json({ error: "El cliente ya fue notificado para retiro" });
    }
    if (order.shipping.method !== "pickup") {
      return res.status(400).json({ error: "El pedido no es para retiro en punto de pick up" });
    }

    // Enviar email de notificación de retiro
    const emailOk = await enviarEmailRetiroPickup(order, fechaRetiro);
    if (!emailOk) {
      return res.status(500).json({ error: "No se pudo enviar el email de notificación" });
    }

    order.pickupNotificado = true;
    order.timeline.push({
      status: `Cliente notificado para retiro (${fechaRetiro})`,
      date: new Date().toLocaleString("es-AR"),
    });
    await order.save();
    res.json({ message: "Cliente notificado para retiro", order });
  } catch (err) {
    console.error("Error notificando retiro:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});



/* ============================================================
   ⭐ Editar comentario del cliente
   PATCH /api/admin/orders/:id/comentario
============================================================ */
router.patch("/admin/orders/:id/comentario", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body;
  if (typeof comentario !== "string") {
    return res.status(400).json({ error: "comentario requerido" });
  }
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
    order.comentarios = comentario;
    order.timeline.push({
      status: `Comentario del cliente editado`,
      date: new Date().toLocaleString("es-AR"),
    });
    await order.save();
    res.json({ message: "Comentario actualizado", order });
  } catch (err) {
    console.error("Error actualizando comentario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Lista todas las ventas
   GET /api/admin/orders
============================================================ */
router.get("/admin/orders", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error obteniendo ventas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Detalle de una venta
   GET /api/admin/orders/:id
============================================================ */
router.get("/admin/orders/:id", verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Enriquecer con whatsapp del Customer si la orden no tiene phone
    const orderObj = order.toObject();
    if (!orderObj.customer?.phone && orderObj.customer?.email) {
      const customer = await Customer.findOne({ email: orderObj.customer.email });
      if (customer?.whatsapp) {
        orderObj.customer.whatsapp = customer.whatsapp;
      }
    }

    res.json(orderObj);
  } catch (err) {
    console.error("Error obteniendo detalle de venta:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Actualizar estado de pago
   PATCH /api/admin/orders/:id/payment
============================================================ */
router.patch("/admin/orders/:id/payment", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { pagoEstado } = req.body;

  if (!pagoEstado) {
    return res.status(400).json({ error: "pagoEstado requerido" });
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    order.pagoEstado = pagoEstado;

    order.timeline.push({
      status: `Pago marcado como ${pagoEstado}`,
      date: new Date().toLocaleString("es-AR"),
    });

    await order.save();

    // Si se marca como recibido, enviar email al cliente
    if (pagoEstado === "recibido") {
      enviarEmailPagoRecibido(order).catch((err) =>
        console.error("Error enviando email pago recibido:", err.message)
      );
    }

    res.json({ message: "Estado de pago actualizado", order });
  } catch (err) {
    console.error("Error actualizando pago:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Agregar tracking + marcar como enviado
   PATCH /api/admin/orders/:id/shipping
============================================================ */
router.patch("/admin/orders/:id/shipping", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { envioEstado, seguimiento } = req.body;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (envioEstado) {
      order.envioEstado = envioEstado;

      order.timeline.push({
        status: `Envío marcado como ${envioEstado}`,
        date: new Date().toLocaleString("es-AR"),
      });
    }

    if (seguimiento) {
      order.shipping.tracking = seguimiento;

      order.timeline.push({
        status: `Código de seguimiento agregado (${seguimiento})`,
        date: new Date().toLocaleString("es-AR"),
      });
    }

    await order.save();

    // Si se agregó seguimiento, enviar email al cliente
    if (seguimiento) {
      enviarEmailSeguimiento(order, seguimiento).catch((err) =>
        console.error("Error enviando email seguimiento:", err.message)
      );
    }

    res.json({
      message: "Datos de envío actualizados",
      order,
    });
  } catch (err) {
    console.error("Error actualizando envío:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Actualizar estado del pedido (compatible con Facturante)
   PATCH /api/admin/orders/:id/status
============================================================ */
router.patch("/admin/orders/:id/status", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, facturar } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status requerido" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    // Actualizar estado
    order.status = status;

    order.timeline.push({
      status: `Estado actualizado a: ${status}`,
      date: new Date().toLocaleString("es-AR"),
    });



    await order.save();

    res.json({ message: "Estado actualizado correctamente", order });
  } catch (err) {
    console.error("Error actualizando estado:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Cancelar venta
   PATCH /api/admin/orders/:id/cancel
============================================================ */
router.patch("/admin/orders/:id/cancel", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    if (order.status === "cancelado") {
      return res.status(400).json({ error: "La venta ya está cancelada" });
    }

    order.status = "cancelado";
    order.timeline.push({
      status: "Venta cancelada",
      date: new Date().toLocaleString("es-AR"),
    });

    await order.save();

    // Enviar email de cancelación al cliente
    enviarEmailCancelacion(order).catch((err) =>
      console.error("Error enviando email de cancelación:", err.message)
    );

    res.json({ message: "Venta cancelada correctamente", order });
  } catch (err) {
    console.error("Error cancelando venta:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Devolver dinero (reembolso)
   PATCH /api/admin/orders/:id/refund
   Solo funcional para mercadopago, gocuotas y modo.
   Para transfer/cuentadni no se procesa (devolución manual).
============================================================ */
router.patch("/admin/orders/:id/refund", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    if (order.reembolsado) {
      return res.status(400).json({ error: "Esta venta ya fue reembolsada" });
    }

    const metodo = order.paymentMethod;
    const paymentId = order.paymentId;

    // Solo métodos digitales soportan reembolso automático
    if (!["mercadopago", "gocuotas", "modo"].includes(metodo)) {
      return res.status(400).json({
        error: `El método de pago "${metodo}" no soporta devolución automática. Realizá la devolución de forma manual.`,
      });
    }

    if (!paymentId) {
      return res.status(400).json({
        error: "No se encontró el ID de pago del proveedor. No se puede procesar la devolución automática.",
      });
    }

    let refundResult = null;

    // ── MercadoPago ──
    if (metodo === "mercadopago") {
      const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!mpToken) {
        return res.status(500).json({ error: "MERCADOPAGO_ACCESS_TOKEN no configurado en el servidor" });
      }
      const mpRes = await axios.post(
        `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
        {},
        { headers: { Authorization: `Bearer ${mpToken}`, "Content-Type": "application/json", "X-Idempotency-Key": `refund-${paymentId}-${Date.now()}` } }
      );
      refundResult = { provider: "mercadopago", refundId: mpRes.data?.id, status: mpRes.data?.status };
    }

    // ── GoCuotas ──
    if (metodo === "gocuotas") {
      const gcBaseUrl = process.env.GOCUOTAS_BASE_URL || "https://www.gocuotas.com/api_redirect/v1";
      const gcApiKey = process.env.GOCUOTAS_API_KEY;
      if (!gcApiKey) {
        return res.status(500).json({ error: "GOCUOTAS_API_KEY no configurada en el servidor" });
      }
      const gcRes = await axios.post(
        `${gcBaseUrl}/checkouts/${paymentId}/refund`,
        {},
        { headers: { Authorization: `Bearer ${gcApiKey}`, "Content-Type": "application/json" } }
      );
      refundResult = { provider: "gocuotas", data: gcRes.data };
    }

    // ── MODO ──
    if (metodo === "modo") {
      // Obtener token de MODO
      const modoBaseUrl = process.env.MODO_BASE_URL || "https://merchants.playdigital.com.ar";
      const modoUser = process.env.MODO_USERNAME;
      const modoPass = process.env.MODO_PASSWORD;
      if (!modoUser || !modoPass) {
        return res.status(500).json({ error: "Credenciales de MODO no configuradas en el servidor" });
      }
      const tokenRes = await axios.post(
        `${modoBaseUrl}/v2/stores/companies/token`,
        { username: modoUser, password: modoPass },
        { headers: { "Content-Type": "application/json" } }
      );
      const modoToken = tokenRes.data?.token || tokenRes.data?.access_token;
      const merchantName = process.env.MODO_MERCHANT_NAME || "HelloComfy";

      const modoRes = await axios.post(
        `${modoBaseUrl}/v2/payment-requests/${paymentId}/refunds`,
        {},
        {
          headers: {
            Authorization: `Bearer ${modoToken}`,
            "User-Agent": merchantName,
            "Content-Type": "application/json",
          },
        }
      );
      refundResult = { provider: "modo", data: modoRes.data };
    }

    // Marcar orden como reembolsada
    order.reembolsado = true;
    order.pagoEstado = "reembolsado";
    order.timeline.push({
      status: `Dinero devuelto vía ${metodo}`,
      date: new Date().toLocaleString("es-AR"),
    });
    await order.save();

    // Enviar email de devolución al cliente
    enviarEmailDevolucion(order).catch((err) =>
      console.error("Error enviando email de devolución:", err.message)
    );

    res.json({ message: "Devolución procesada correctamente", order, refundResult });
  } catch (err) {
    // Capturar errores de API del proveedor
    const apiError = err?.response?.data;
    console.error("Error procesando devolución:", apiError || err.message);
    res.status(500).json({
      error: "Error al procesar la devolución con el proveedor de pagos",
      details: apiError?.message || apiError?.error || err.message,
    });
  }
});

/* ============================================================
   ⭐ Actualización batch de estado (multi-selección)
   PATCH /api/admin/orders/status/batch
============================================================ */
router.patch("/admin/orders/status/batch", verifyAdmin, async (req, res) => {
  const { ids, status, facturar } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids requerido" });
  }

  if (!status) {
    return res.status(400).json({ error: "status requerido" });
  }

  const resultados = [];

  for (const id of ids) {
    try {
      const order = await Order.findById(id);
      if (!order) continue;

      order.status = status;

      order.timeline.push({
        status: `Estado actualizado a: ${status}`,
        date: new Date().toLocaleString("es-AR"),
      });

      await order.save();
      resultados.push({ id, ok: true });
    } catch (err) {
      resultados.push({ id, ok: false, error: err.message });
    }
  }

  res.json({
    message: "Batch procesado",
    resultados,
  });
});

export default router;
