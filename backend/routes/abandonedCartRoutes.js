import express from "express";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import {
  trackAbandonedCart,
  recoverCart,
  getAllAbandonedCarts,
  getAbandonedCartStats,
  sendRecoveryEmail,
  deleteAbandonedCart,
} from "../controllers/abandonedCartController.js";

const router = express.Router();

// ============================
// PÚBLICAS (llamadas desde el frontend)
// ============================
router.post("/track", trackAbandonedCart);
router.post("/recover", recoverCart);

// ============================
// ADMIN (protegidas con JWT)
// ============================
router.get("/stats", verifyAdmin, getAbandonedCartStats);
router.get("/", verifyAdmin, getAllAbandonedCarts);
router.post("/:id/send-email", verifyAdmin, sendRecoveryEmail);
router.delete("/:id", verifyAdmin, deleteAbandonedCart);

export default router;
