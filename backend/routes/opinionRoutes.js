
import express from 'express';
import Opinion from '../models/Opinion.js';
import authMiddleware from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Opiniones propias del usuario autenticado
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    let userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    const opinions = await Opinion.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ opinions });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tus opiniones' });
  }
});

// Crear opinión
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product, stars, text } = req.body;
    if (!product || !stars || !text) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    // Permitir tanto string como ObjectId
    let productId = product;
    if (typeof product === 'string' && mongoose.Types.ObjectId.isValid(product)) {
      productId = new mongoose.Types.ObjectId(product);
    }
    let userId = req.user && (req.user._id || req.user.id);
    if (!userId) {
      return res.status(401).json({ error: 'No se pudo identificar el usuario' });
    }
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    // Validar que el usuario no haya dejado ya una opinión para este producto
    const existing = await Opinion.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(400).json({ error: 'Ya dejaste una opinión para este producto.' });
    }
    const opinion = await Opinion.create({
      product: productId,
      user: userId,
      stars,
      text
    });
    res.json({ opinion });
  } catch (err) {
    console.error("Error al guardar opinión:", err);
    res.status(500).json({ error: 'Error al guardar opinión', details: err.message });
  }
});

// Obtener opiniones de un producto
router.get('/product/:productId', async (req, res) => {
  try {
    let { productId } = req.params;
    // console.log removido por seguridad
    // Permitir tanto string como ObjectId
    let queryId = productId;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      queryId = new mongoose.Types.ObjectId(productId);
    }
    // console.log removido por seguridad
    const opinions = await Opinion.find({ product: queryId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    // console.log removido por seguridad
    res.json({ opinions });
  } catch (err) {
    console.error("[Opinions] Error al obtener opiniones:", err);
    res.status(500).json({ error: 'Error al obtener opiniones' });
  }
});

export default router;
