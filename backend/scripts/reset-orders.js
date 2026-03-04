/**
 * Script para resetear todas las Ã³rdenes y arrancar desde el nÃºmero 8522.
 *
 * Uso (desde backend/):
 *   cd backend && node scripts/reset-orders.js
 */

import mongoose from "mongoose";
import Order from "../models/Order.js";
import PendingOrder from "../models/PendingOrder.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("âŒ No se encontrÃ³ MONGO_URI en el .env del backend.");
  process.exit(1);
}

const PRIMER_NUMERO = 8522;
const CODIGO_SEMILLA = String(PRIMER_NUMERO - 1); // "8521"

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("âœ… Conectado a MongoDB");

  // 1. Borrar todas las Ã³rdenes
  const { deletedCount: ordersDeleted } = await Order.deleteMany({});
  console.log(`í·‘ï¸  Ã“rdenes eliminadas: ${ordersDeleted}`);

  const { deletedCount: pendingDeleted } = await PendingOrder.deleteMany({});
  console.log(`í·‘ï¸  PendingOrders eliminadas: ${pendingDeleted}`);

  // 2. Insertar orden semilla con cÃ³digo 8521 para que la prÃ³xima sea 8522
  await mongoose.connection.collection("orders").insertOne({
    code: CODIGO_SEMILLA,
    customer: { email: "seed@hellocomfy.com.ar", name: "SEMILLA SISTEMA" },
    status: "cancelado",
    pagoEstado: "pendiente",
    paymentMethod: "transfer",
    envioEstado: "pendiente",
    comentarios: "ORDEN SEMILLA - NO ES UNA VENTA REAL. Solo existe para fijar el contador en #8522.",
    shipping: { method: "pickup" },
    items: [],
    totals: { subtotal: 0, shipping: 0, discount: 0, promo3x2Discount: 0, promoDiscount: 0, transferDiscount: 0, total: 0 },
    date: new Date().toISOString(),
    timeline: [],
    isGift: false,
    giftMessage: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`âœ… Orden semilla creada con cÃ³digo: ${CODIGO_SEMILLA}`);
  console.log(`í¾¯ La prÃ³xima orden real serÃ¡ la #${PRIMER_NUMERO}`);

  await mongoose.disconnect();
  console.log("âœ… Desconectado. Reset completo.");
}

run().catch((err) => {
  console.error("âŒ Error:", err);
  process.exit(1);
});
