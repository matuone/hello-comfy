/**
 * enviarEmailCielo.js
 * Envía los emails de confirmación (cliente + admin) para la orden #8538 de Cielo Sanessi.
 * EJECUTAR SOLO UNA VEZ.
 *
 * node backend/scripts/enviarEmailCielo.js
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import {
  enviarEmailConfirmacionOrden,
  enviarEmailPagoRecibido,
  enviarEmailAlAdmin,
} from "../services/emailService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Conectado a MongoDB\n");

// Obtener la orden por paymentId
const orderDoc = await mongoose.connection
  .collection("orders")
  .findOne({ paymentId: "149031670638" });

if (!orderDoc) {
  console.error("❌ Orden no encontrada en BD. Verificar.");
  await mongoose.disconnect();
  process.exit(1);
}

console.log(`📦 Orden encontrada: #${orderDoc.code}`);
console.log(`   Cliente: ${orderDoc.customer?.name} <${orderDoc.customer?.email}>`);
console.log(`   Total: $${orderDoc.totals?.total?.toLocaleString("es-AR")}\n`);

// Enviar emails
try {
  console.log("📧 Enviando email de confirmación al cliente...");
  await enviarEmailConfirmacionOrden(orderDoc);
  console.log("   ✅ Email confirmación enviado");
} catch (e) {
  console.error("   ❌ Error email confirmación:", e.message);
}

try {
  console.log("📧 Enviando email de pago recibido al cliente...");
  await enviarEmailPagoRecibido(orderDoc);
  console.log("   ✅ Email pago recibido enviado");
} catch (e) {
  console.error("   ❌ Error email pago recibido:", e.message);
}

try {
  console.log("📧 Enviando notificación al admin...");
  await enviarEmailAlAdmin(orderDoc);
  console.log("   ✅ Email admin enviado");
} catch (e) {
  console.error("   ❌ Error email admin:", e.message);
}

console.log("\n✅ Proceso de emails completado.");
await mongoose.disconnect();
