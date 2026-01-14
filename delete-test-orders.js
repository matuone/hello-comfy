import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "backend", ".env") });

import Order from "./backend/models/Order.js";

async function deleteOldOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Eliminar órdenes de prueba
    const result = await Order.deleteMany({ code: { $in: ["TEST-001", "TEST-002"] } });
    console.log(`✅ ${result.deletedCount} órdenes eliminadas`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

deleteOldOrders();
