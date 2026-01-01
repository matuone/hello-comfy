import express from "express";
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode
} from "../controllers/promoCodeController.js";

const router = express.Router();

// CRUD
router.get("/", getPromoCodes);
router.post("/", createPromoCode);
router.put("/:id", updatePromoCode);
router.delete("/:id", deletePromoCode);

// Validación para el carrito
router.post("/validate", validatePromoCode);

export default router;
