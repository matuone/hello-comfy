// backend/routes/mercadopagoRoutes.js
import express from "express";
import {
  createPreference,
  webhookMercadoPago,
  getPaymentStatus,
  processPayment,
} from "../controllers/mercadopagoController.js";

const router = express.Router();

/**
 * POST /api/mercadopago/create-preference
 * Crea una preferencia de pago en Mercado Pago
 */
router.post("/create-preference", createPreference);

/**
 * POST /api/mercadopago/webhook
 * Webhook para notificaciones de Mercado Pago
 */
router.post("/webhook", webhookMercadoPago);

/**
 * GET /api/mercadopago/payment/:id
 * Obtiene el estado de un pago
 */
router.get("/payment/:id", getPaymentStatus);

/**
 * POST /api/mercadopago/process-payment
 * Procesa un pago confirmado y crea la orden en BD
 */
router.post("/process-payment", processPayment);

export default router;
