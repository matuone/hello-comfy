import express from "express";
import StockColor from "../models/StockColor.js";

const router = express.Router();

// ============================
// OBTENER TODOS LOS COLORES
// ============================
router.get("/", async (req, res) => {
  try {
    const colores = await StockColor.find();
    res.json(colores);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener colores" });
  }
});

// ============================
// CREAR COLOR
// ============================
router.post("/", async (req, res) => {
  try {
    const nuevo = await StockColor.create(req.body);
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: "Error al crear color" });
  }
});

// ============================
// ACTUALIZAR COLOR
// ============================
router.put("/:id", async (req, res) => {
  try {
    const actualizado = await StockColor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar color" });
  }
});

// ============================
// ELIMINAR COLOR
// ============================
router.delete("/:id", async (req, res) => {
  try {
    await StockColor.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar color" });
  }
});

export default router;
