// backend/routes/modoRoutes.js
import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentStatus
} from "../controllers/modoController.js";

const router = express.Router();

// Crear intención de pago
router.post("/create-payment-intent", createPaymentIntent);

// Confirmar pago (Test mode)
router.post("/confirm-payment", confirmPayment);

// Webhook de notificaciones
router.post("/webhook", handleWebhook);

// Consultar estado de un pago
router.get("/payment/:paymentId", getPaymentStatus);

export default router;
