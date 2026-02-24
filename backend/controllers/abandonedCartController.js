import AbandonedCart from "../models/AbandonedCart.js";
import sendEmail from "../services/emailService.js";

// ============================
// TRACKING: Registrar / actualizar carrito abandonado
// POST /api/abandoned-carts/track
// (llamado desde el frontend sin auth)
// ============================
export async function trackAbandonedCart(req, res) {
  try {
    const { email, name, phone, userId, items, checkoutStep, totalEstimado, type } = req.body;

    if (!email || !items || items.length === 0) {
      return res.status(400).json({ error: "Email e items son requeridos" });
    }

    const cartType = type || (userId ? "registered" : "guest");

    // Buscar si ya existe un carrito abandonado activo para este email
    let cart = await AbandonedCart.findOne({
      email: email.toLowerCase().trim(),
      recovered: false,
    });

    if (cart) {
      // Actualizar el existente
      cart.items = items;
      cart.checkoutStep = checkoutStep || cart.checkoutStep;
      cart.totalEstimado = totalEstimado || cart.totalEstimado;
      cart.name = name || cart.name;
      cart.phone = phone || cart.phone;
      cart.userId = userId || cart.userId;
      cart.type = cartType;
      cart.lastActivity = new Date();
      await cart.save();
    } else {
      // Crear nuevo
      cart = await AbandonedCart.create({
        type: cartType,
        email: email.toLowerCase().trim(),
        name: name || "",
        phone: phone || "",
        userId: userId || null,
        items,
        checkoutStep: checkoutStep || 0,
        totalEstimado: totalEstimado || 0,
        lastActivity: new Date(),
      });
    }

    return res.status(200).json({ ok: true, cartId: cart._id });
  } catch (err) {
    console.error("Error tracking abandoned cart:", err);
    return res.status(500).json({ error: "Error al registrar carrito abandonado" });
  }
}

// ============================
// MARCAR COMO RECUPERADO (cuando completa la compra)
// POST /api/abandoned-carts/recover
// ============================
export async function recoverCart(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const result = await AbandonedCart.updateMany(
      { email: email.toLowerCase().trim(), recovered: false },
      { $set: { recovered: true } }
    );

    return res.status(200).json({ ok: true, updated: result.modifiedCount });
  } catch (err) {
    console.error("Error recovering cart:", err);
    return res.status(500).json({ error: "Error al recuperar carrito" });
  }
}

// ============================
// ADMIN: Listar todos los carritos abandonados
// GET /api/abandoned-carts
// ============================
export async function getAllAbandonedCarts(req, res) {
  try {
    const { type, recovered } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (recovered !== undefined) filter.recovered = recovered === "true";

    const carts = await AbandonedCart.find(filter)
      .sort({ lastActivity: -1 })
      .limit(200)
      .lean();

    return res.status(200).json(carts);
  } catch (err) {
    console.error("Error fetching abandoned carts:", err);
    return res.status(500).json({ error: "Error al obtener carritos abandonados" });
  }
}

// ============================
// ADMIN: Obtener estadísticas
// GET /api/abandoned-carts/stats
// ============================
export async function getAbandonedCartStats(req, res) {
  try {
    const [totalActive, totalRecovered, byType] = await Promise.all([
      AbandonedCart.countDocuments({ recovered: false }),
      AbandonedCart.countDocuments({ recovered: true }),
      AbandonedCart.aggregate([
        { $match: { recovered: false } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalEstimado: { $sum: "$totalEstimado" },
          },
        },
      ]),
    ]);

    const registered = byType.find((b) => b._id === "registered") || { count: 0, totalEstimado: 0 };
    const guest = byType.find((b) => b._id === "guest") || { count: 0, totalEstimado: 0 };

    return res.status(200).json({
      totalActive,
      totalRecovered,
      registered: { count: registered.count, totalEstimado: registered.totalEstimado },
      guest: { count: guest.count, totalEstimado: guest.totalEstimado },
    });
  } catch (err) {
    console.error("Error fetching abandoned cart stats:", err);
    return res.status(500).json({ error: "Error al obtener estadísticas" });
  }
}

// ============================
// ADMIN: Enviar email de recuperación
// POST /api/abandoned-carts/:id/send-email
// ============================
export async function sendRecoveryEmail(req, res) {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Asunto y mensaje son requeridos" });
    }

    const cart = await AbandonedCart.findById(id);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Armar HTML del email
    const itemsHtml = cart.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" />
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 14px;">
            ${item.name}
            ${item.size ? `<br><small style="color: #888;">Talle: ${item.size}</small>` : ""}
            ${item.color ? `<br><small style="color: #888;">Color: ${item.color}</small>` : ""}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">
            x${item.quantity}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600;">
            $${(item.price * item.quantity).toLocaleString("es-AR")}
          </td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #d94f7a 0%, #e8799e 100%); padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Hello Comfy 🧸</h1>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            ${message.replace(/\n/g, "<br>")}
          </p>

          ${cart.items.length > 0 ? `
          <h3 style="color: #d94f7a; margin-top: 24px;">Tus productos esperándote:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          ` : ""}

          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.FRONTEND_URL || "http://200.58.98.98"}/cart"
               style="display: inline-block; background: #d94f7a; color: #fff; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Volver a mi carrito 🛒
            </a>
          </div>

          <p style="font-size: 13px; color: #999; margin-top: 24px; text-align: center;">
            Si ya completaste tu compra, ignorá este email.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: cart.email,
      subject,
      html,
    });

    // Registrar el envío
    cart.emailsSent.push({
      sentAt: new Date(),
      subject,
      message,
    });
    await cart.save();

    return res.status(200).json({ ok: true, message: "Email enviado correctamente" });
  } catch (err) {
    console.error("Error sending recovery email:", err);
    return res.status(500).json({ error: "Error al enviar email de recuperación" });
  }
}

// ============================
// ADMIN: Eliminar carrito abandonado
// DELETE /api/abandoned-carts/:id
// ============================
export async function deleteAbandonedCart(req, res) {
  try {
    const { id } = req.params;
    await AbandonedCart.findByIdAndDelete(id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error deleting abandoned cart:", err);
    return res.status(500).json({ error: "Error al eliminar carrito" });
  }
}
