

import express from "express";
const router = express.Router();
import axios from "axios";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import VisitDaily from "../models/VisitDaily.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import {
  enviarEmailRetiroPickup,
  enviarEmailPagoRecibido,
  enviarEmailSeguimiento,
  enviarEmailCancelacion,
  enviarEmailDevolucion,
  enviarEmailConfirmacionOrden,
} from "../services/emailService.js";

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
   ⭐ Marcar notificación de retiro por WhatsApp
   PATCH /api/admin/orders/:id/pickup-whatsapp-notify
============================================================ */
router.patch("/admin/orders/:id/pickup-whatsapp-notify", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { fechaRetiro } = req.body || {};

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    if (order.shipping.method !== "pickup") {
      return res.status(400).json({ error: "El pedido no es para retiro en punto de pick up" });
    }

    if (!order.pickupNotificado) {
      const detalleFecha = typeof fechaRetiro === "string" && fechaRetiro.trim() ? ` (${fechaRetiro.trim()})` : "";
      order.pickupNotificado = true;
      order.timeline.push({
        status: `Cliente notificado para retiro por WhatsApp${detalleFecha}`,
        date: new Date().toLocaleString("es-AR"),
      });
      await order.save();
    }

    res.json({ message: "Notificación por WhatsApp registrada", order });
  } catch (err) {
    console.error("Error registrando notificación de WhatsApp:", err);
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
   ⭐ Editar datos del cliente
   PATCH /api/admin/orders/:id/customer
============================================================ */
router.patch("/admin/orders/:id/customer", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, dni } = req.body || {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email requerido" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    order.customer = {
      ...order.customer,
      name: typeof name === "string" ? name.trim() : order.customer?.name,
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() : order.customer?.phone,
      dni: typeof dni === "string" ? dni.trim() : order.customer?.dni,
    };

    order.timeline.push({
      status: "Datos del cliente editados por admin",
      date: new Date().toLocaleString("es-AR"),
    });

    await order.save();
    res.json({ message: "Datos del cliente actualizados", order });
  } catch (err) {
    console.error("Error actualizando datos del cliente:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Editar datos de dirección
   PATCH /api/admin/orders/:id/address
============================================================ */
router.patch("/admin/orders/:id/address", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    address,
    localidad,
    province,
    postalCode,
    pickPoint,
    branchName,
    branchAddress,
  } = req.body || {};

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    order.shipping = {
      ...order.shipping,
      address: typeof address === "string" ? address.trim() : order.shipping?.address,
      localidad: typeof localidad === "string" ? localidad.trim() : order.shipping?.localidad,
      province: typeof province === "string" ? province.trim() : order.shipping?.province,
      postalCode: typeof postalCode === "string" ? postalCode.trim() : order.shipping?.postalCode,
      pickPoint: typeof pickPoint === "string" ? pickPoint.trim() : order.shipping?.pickPoint,
      branchName: typeof branchName === "string" ? branchName.trim() : order.shipping?.branchName,
      branchAddress: typeof branchAddress === "string" ? branchAddress.trim() : order.shipping?.branchAddress,
    };

    order.timeline.push({
      status: "Datos de dirección editados por admin",
      date: new Date().toLocaleString("es-AR"),
    });

    await order.save();
    res.json({ message: "Datos de dirección actualizados", order });
  } catch (err) {
    console.error("Error actualizando dirección:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Lista todas las ventas
   GET /api/admin/orders
============================================================ */
router.get("/admin/orders", verifyAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const query = search
      ? {
        $or: [
          { "customer.name": { $regex: search, $options: "i" } },
          { "customer.email": { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-paymentProof -paymentProofName")
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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
    // Evita enviar payloads pesados al abrir el detalle (ej. comprobante base64)
    const orderObj = await Order.findById(req.params.id)
      .select("-paymentProof -paymentProofName")
      .lean();

    if (!orderObj) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Enriquecer con whatsapp del Customer si la orden no tiene phone
    if (!orderObj.customer?.phone && orderObj.customer?.email) {
      const customer = await Customer.findOne({ email: orderObj.customer.email })
        .select("whatsapp")
        .lean();
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
   ⭐ Obtener comprobante de pago de una venta
   GET /api/admin/orders/:id/payment-proof
============================================================ */
router.get("/admin/orders/:id/payment-proof", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .select("paymentProof paymentProofName paymentMethod")
      .lean();

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (!order.paymentProof) {
      return res.status(404).json({ error: "Esta venta no tiene comprobante adjunto" });
    }

    res.json({
      paymentProof: order.paymentProof,
      paymentProofName: order.paymentProofName || null,
      paymentMethod: order.paymentMethod || null,
    });
  } catch (err) {
    console.error("Error obteniendo comprobante de pago:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ Reenviar email de confirmación de compra
   PATCH /api/admin/orders/:id/resend-confirmation-email
============================================================ */
router.patch("/admin/orders/:id/resend-confirmation-email", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (!order.customer?.email) {
      return res.status(400).json({ error: "La orden no tiene email de cliente" });
    }

    const emailOk = await enviarEmailConfirmacionOrden(order);
    if (!emailOk) {
      return res.status(500).json({ error: "No se pudo reenviar el email de confirmación" });
    }

    order.timeline.push({
      status: `Email de confirmación reenviado a ${order.customer.email}`,
      date: new Date().toLocaleString("es-AR"),
    });
    await order.save();

    res.json({ message: "Email de confirmación reenviado", order });
  } catch (err) {
    console.error("Error reenviando email de confirmación:", err);
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
    const apiMessage = apiError?.message || apiError?.error || err.message;
    console.error("Error procesando devolución:", apiError || err.message);

    // Detectar si el pago ya fue reembolsado
    if (apiMessage?.includes("not valid for the current payment state") || apiMessage?.includes("already refunded")) {
      return res.status(400).json({
        error: "El pago ya fue reembolsado previamente desde el proveedor de pagos. Marcá la orden como reembolsada manualmente.",
        details: apiMessage,
      });
    }

    res.status(500).json({
      error: "Error al procesar la devolución con el proveedor de pagos",
      details: apiMessage,
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

/* ============================================================
   ⭐ Estadísticas reales del negocio
   GET /api/admin/stats
============================================================ */
router.get("/admin/stats", verifyAdmin, async (req, res) => {
  try {
    const allOrders = await Order.find(
      {},
      "totals envioEstado customer shipping items paymentMethod pagoEstado _id"
    ).lean();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [visitaHoyDoc, visitasMesAgg, visitasTotalAgg] = await Promise.all([
      VisitDaily.findOne({ day: startOfToday }).lean(),
      VisitDaily.aggregate([
        { $match: { day: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$count" } } },
      ]),
      VisitDaily.aggregate([
        { $group: { _id: null, total: { $sum: "$count" } } },
      ]),
    ]);

    // KPIs básicos
    const totalVentas = allOrders.length;
    const totalFacturado = allOrders.reduce((acc, o) => acc + (o.totals?.total || 0), 0);
    const ventasEnviadas = allOrders.filter((o) => o.envioEstado === "enviado").length;
    const ventasPendientes = allOrders.filter((o) => o.envioEstado === "pendiente").length;

    // Facturado este mes
    const ordenesMes = allOrders.filter((o) => {
      const t = o._id.getTimestamp();
      return t >= startOfMonth;
    });
    const facturadoMes = ordenesMes.reduce((acc, o) => acc + (o.totals?.total || 0), 0);

    // Cliente top del mes
    const clienteTotals = {};
    ordenesMes.forEach((o) => {
      const email = o.customer?.email;
      if (!email) return;
      if (!clienteTotals[email]) {
        clienteTotals[email] = { nombre: o.customer?.name || email, email, total: 0, ordenes: 0 };
      }
      clienteTotals[email].total += o.totals?.total || 0;
      clienteTotals[email].ordenes++;
    });
    const topClienteMes =
      Object.values(clienteTotals).sort((a, b) => b.total - a.total)[0] || null;

    // Ventas por mes del año actual (facturación + cantidad de órdenes)
    const ventasPorMes = new Array(12).fill(0);
    const ordenesPorMes = new Array(12).fill(0);
    allOrders.forEach((o) => {
      const t = o._id.getTimestamp();
      if (t >= startOfYear) {
        const mes = t.getMonth();
        ventasPorMes[mes] += o.totals?.total || 0;
        ordenesPorMes[mes]++;
      }
    });

    // Métodos de envío
    const envioMetodos = {};
    allOrders.forEach((o) => {
      const method = o.shipping?.method || "desconocido";
      const labels = {
        "home": "A domicilio",
        "correo-home": "Correo (domicilio)",
        "correo-branch": "Correo (sucursal)",
        "pickup": "Pick Up Point",
      };
      const label = labels[method] || method;
      envioMetodos[label] = (envioMetodos[label] || 0) + 1;
    });

    // Métodos de pago
    const pagoMetodos = {};
    allOrders.forEach((o) => {
      const labels = {
        mercadopago: "Mercado Pago",
        gocuotas: "Go Cuotas",
        modo: "MODO",
        transfer: "Transferencia",
        cuentadni: "Cuenta DNI",
      };
      const label = labels[o.paymentMethod] || o.paymentMethod || "Otro";
      pagoMetodos[label] = (pagoMetodos[label] || 0) + 1;
    });

    // Productos más vendidos
    const productosCounts = {};
    allOrders.forEach((o) => {
      o.items?.forEach((item) => {
        if (!item.name) return;
        productosCounts[item.name] = (productosCounts[item.name] || 0) + (item.quantity || 1);
      });
    });
    const topProductos = Object.entries(productosCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    const visitasHoy = visitaHoyDoc?.count || 0;
    const visitasMes = visitasMesAgg[0]?.total || 0;
    const visitasTotal = visitasTotalAgg[0]?.total || 0;

    res.json({
      totalVentas,
      totalFacturado,
      facturadoMes,
      ventasEnviadas,
      ventasPendientes,
      visitasHoy,
      visitasMes,
      visitasTotal,
      topClienteMes,
      ventasPorMes,
      ordenesPorMes,
      envioMetodos,
      pagoMetodos,
      topProductos,
    });
  } catch (err) {
    console.error("Error en stats:", err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

export default router;
