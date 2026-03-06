// Script simple para enviar solo el email al admin para la orden de Cielo #8538
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import { enviarEmailAlAdmin, enviarEmailPagoRecibido } from "../services/emailService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGO_URI);
const orderDoc = await mongoose.connection.collection("orders").findOne({ paymentId: "149031670638" });

if (!orderDoc) { console.error("Orden no encontrada"); process.exit(1); }

console.log("Orden:", orderDoc.code, orderDoc.customer?.email);

try {
  await enviarEmailAlAdmin(orderDoc);
  console.log("✅ Email admin enviado");
} catch (e) {
  console.error("❌ Admin email:", e.message);
}

try {
  await enviarEmailPagoRecibido(orderDoc);
  console.log("✅ Email pago recibido enviado");
} catch (e) {
  console.error("❌ Pago recibido email:", e.message);
}

await mongoose.disconnect();
