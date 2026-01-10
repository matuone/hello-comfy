import express from "express";
const router = express.Router();
import Order from "../models/Order.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

/* ============================================================
   ⭐ Lista todas las ventas
   GET /api/admin/orders
============================================================ */
router.get("/admin/orders", adminMiddleware, async (req, res) => {
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
router.get("/admin/orders/:id", adminMiddleware, async (req, res) => {
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

export default router;
