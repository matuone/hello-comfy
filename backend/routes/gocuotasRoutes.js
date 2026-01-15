// backend/routes/gocuotasRoutes.js
import express from "express";
import {
  createCheckout,
  getCheckoutStatus,
  webhookGocuotas,
  processPayment,
} from "../controllers/gocuotasController.js";

const router = express.Router();

/**
 * POST /api/gocuotas/create-checkout
 * Crea un checkout de pago en Go Cuotas
 */
router.post("/create-checkout", createCheckout);

/**
 * GET /api/gocuotas/checkout/:id
 * Obtiene el estado de un checkout
 */
router.get("/checkout/:id", getCheckoutStatus);

/**
 * POST /api/gocuotas/webhook
 * Webhook para notificaciones de Go Cuotas
 */
router.post("/webhook", webhookGocuotas);

/**
 * POST /api/gocuotas/process-payment
 * Procesa un pago confirmado y crea la orden en BD
 */
router.post("/process-payment", processPayment);

export default router;
