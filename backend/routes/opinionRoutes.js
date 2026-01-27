import express from 'express';
import Opinion from '../models/Opinion.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Crear opinión
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product, stars, text } = req.body;
    if (!product || !stars || !text) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const opinion = await Opinion.create({
      product,
      user: req.user._id,
      stars,
      text
    });
    res.json({ opinion });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar opinión' });
  }
});

// Obtener opiniones de un producto
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const opinions = await Opinion.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ opinions });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener opiniones' });
  }
});

export default router;
