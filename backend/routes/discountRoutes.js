import express from "express";
import {
  getDiscountRules,
  createDiscountRule,
  updateDiscountRule,
  deleteDiscountRule,
  getFreeShippingThreshold,
  updateFreeShippingThreshold
} from "../controllers/discountController.js";

const router = express.Router();

router.get("/", getDiscountRules);
router.post("/", createDiscountRule);
router.put("/:id", updateDiscountRule);
router.delete("/:id", deleteDiscountRule);

// 🚚 Rutas para Free Shipping Threshold
router.get("/free-shipping/threshold", getFreeShippingThreshold);
router.put("/free-shipping/threshold", updateFreeShippingThreshold);

export default router;
