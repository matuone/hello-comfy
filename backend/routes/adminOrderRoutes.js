import express from "express";
const router = express.Router();

import Order from "../models/Order.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

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

    res.json(order);
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
