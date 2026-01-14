import express from "express";
const router = express.Router();
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

/* ============================================================
   ⭐ RUTA PRIVADA — Obtener todas las órdenes del usuario logueado
   GET /api/orders/my-orders (DEBE IR ANTES QUE /:code)
============================================================ */
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ "customer.email": req.user.email }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Error obteniendo órdenes del usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ RUTA PÚBLICA — Pedidos sin cuenta
============================================================ */
router.get("/orders/:code", async (req, res) => {
  const { code } = req.params;
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email requerido" });
  }

  try {
    const order = await Order.findOne({ code });

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const publicData = {
      code: order.code,
      status: order.status,
      date: order.date,
      eta: order.shipping.eta,
      shippingMethod: order.shipping.method,
      pickPoint: order.shipping.pickPoint,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      })),
      totals: order.totals,
      timeline: order.timeline,
    };

    res.json(publicData);
  } catch (err) {
    console.error("Error obteniendo pedido:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ============================================================
   ⭐ RUTA PRIVADA — Pedidos con cuenta
   GET /api/orders/private/:id
============================================================ */
router.get("/orders/private/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Solo el dueño del pedido puede verlo
    if (order.customer.email !== req.user.email) {
      return res.status(403).json({ error: "No autorizado" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error obteniendo pedido privado:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
