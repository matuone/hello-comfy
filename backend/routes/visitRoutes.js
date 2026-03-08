import express from "express";
import VisitDaily from "../models/VisitDaily.js";

const router = express.Router();

// Registra una visita (rate-limited del lado cliente para evitar ruido excesivo).
router.post("/visits/track", async (req, res) => {
  try {
    const day = new Date();
    day.setHours(0, 0, 0, 0);

    await VisitDaily.findOneAndUpdate(
      { day },
      { $inc: { count: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Error registrando visita:", err);
    res.status(500).json({ error: "Error registrando visita" });
  }
});

export default router;
