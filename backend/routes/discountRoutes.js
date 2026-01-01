import express from "express";
import {
  getDiscountRules,
  createDiscountRule,
  updateDiscountRule,
  deleteDiscountRule
} from "../controllers/discountController.js";

const router = express.Router();

router.get("/", getDiscountRules);
router.post("/", createDiscountRule);
router.put("/:id", updateDiscountRule);
router.delete("/:id", deleteDiscountRule);

export default router;
