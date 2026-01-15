import express from "express";
const router = express.Router();
import Order from "../models/Order.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { crearOrdenDesdePago } from "../services/orderService.js";

/* ============================================================
   ⭐ RUTA PRIVADA — Mis órdenes (usuario autenticado)
   GET /api/orders/my-orders
============================================================ */
router.get("/orders/my-orders", authMiddleware, async (req, res) => {
  try {
    // Obtener usuario autenticado
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Buscar órdenes por userId O por email del usuario (para órdenes previas)
    const orders = await Order.find({ 
      $or: [
        { userId: user._id },
        { "customer.email": user.email.toLowerCase() }
      ]
    }).sort({
      createdAt: -1,
    });

    res.json({
      orders: orders.map((order) => ({
        _id: order._id,
        code: order.code,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items || [],
        totals: order.totals || {
          subtotal: 0,
          shipping: 0,
          discount: 0,
          total: 0,
        },
        shipping: {
          method: order.shipping?.method || "N/A",
          address: order.shipping?.address || null,
          pickPoint: order.shipping?.pickPoint || null,
          tracking: order.shipping?.tracking || null,
          eta: order.shipping?.eta || null,
        },
      })),
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

/* ============================================================
   POST /api/orders/create-transfer
   Crear orden por transferencia bancaria o Cuenta DNI
============================================================ */
router.post("/orders/create-transfer", async (req, res) => {
  try {
    const { userId, formData, items, totalPrice, paymentProof, paymentProofName } = req.body;

    const paymentMethod = formData?.paymentMethod || "transfer";
    console.log("📝 create-payment request recibido");
    console.log("📋 Payment Method:", paymentMethod);
    console.log("📋 FormData email:", formData?.email);
    console.log("📋 UserId:", userId || "invitado");
    console.log("📋 Items count:", items?.length);
    console.log("📋 PaymentProof length:", paymentProof?.length || 0);

    if (!formData || !items || !totalPrice) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    if (!formData.email || !formData.name) {
      return res.status(400).json({ error: "Email y nombre requeridos" });
    }

    // Crear datos simulados de pago para crearOrdenDesdePago
    const paymentData = {
      id: `${paymentMethod}_${Date.now()}`,
      status: "pending", // Para transferencias/cuentadni es pending hasta que admin confirme
      transaction_amount: totalPrice,
      payer: {
        email: formData.email,
        name: formData.name,
      },
    };

    const pendingOrderData = {
      userId: userId || null,
      formData,
      items,
      totalPrice,
      paymentProof: paymentProof || null,
      paymentProofName: paymentProofName || null,
    };

    console.log("📝 Iniciando crearOrdenDesdePago");
    // Crear orden usando el servicio existente
    const order = await crearOrdenDesdePago(paymentData, pendingOrderData);
    console.log("✅ Orden creada:", order.code);

    res.json({
      success: true,
      message: "Orden creada exitosamente",
      order: {
        code: order.code,
        email: order.customer.email,
        status: order.pagoEstado,
        total: order.totals.total,
      },
    });
  } catch (error) {
    console.error("Error creando orden por transferencia:", error);
    res.status(500).json({
      error: "Error al crear la orden",
      message: error.message,
    });
  }
});

export default router;
