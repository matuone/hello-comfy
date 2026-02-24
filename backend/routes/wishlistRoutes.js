import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/wishlist — obtener IDs de la wishlist del usuario
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("wishlist");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ wishlist: user.wishlist || [] });
  } catch (err) {
    console.error("Error obteniendo wishlist:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// POST /api/wishlist/toggle — agregar o quitar un producto
router.post("/toggle", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "productId requerido" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const index = user.wishlist.indexOf(productId);
    let added;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();
    res.json({ wishlist: user.wishlist, added });
  } catch (err) {
    console.error("Error toggle wishlist:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// POST /api/wishlist/sync — merge localStorage IDs con la DB al loguearse
router.post("/sync", authMiddleware, async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) return res.status(400).json({ error: "productIds debe ser un array" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Merge: agregar IDs que no estén ya en la wishlist
    const currentIds = user.wishlist.map((id) => id.toString());
    for (const id of productIds) {
      if (!currentIds.includes(id)) {
        user.wishlist.push(id);
      }
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error("Error sync wishlist:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// POST /api/wishlist/products — obtener datos frescos de productos por IDs
// (público, no requiere auth — para guests que tienen IDs en localStorage)
router.post("/products", async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.json({ products: [] });
    }

    // Limitar a 50 productos max
    const ids = productIds.slice(0, 50);

    const products = await Product.find({ _id: { $in: ids } })
      .select("name price discount images category subcategory stockColorId")
      .populate("stockColorId", "color colorHex talles paused talleUnico");

    res.json({ products });
  } catch (err) {
    console.error("Error obteniendo productos wishlist:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
