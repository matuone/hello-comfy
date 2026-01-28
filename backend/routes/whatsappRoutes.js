// backend/routes/whatsappRoutes.js
import express from 'express';
import { sendWhatsapp } from '../services/whatsappService.js';
const router = express.Router();

// POST /api/whatsapp/send
router.post('/send', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) return res.status(400).json({ error: 'Faltan datos' });
  try {
    await sendWhatsapp(to, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
