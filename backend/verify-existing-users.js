// Script para marcar todos los usuarios existentes como verificados
// (evitar lockout tras agregar verificación por email)
// Uso: cd backend && node verify-existing-users.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI no definida en .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Conectado a MongoDB");

  const result = await mongoose.connection.db.collection("users").updateMany(
    { emailVerified: { $ne: true } },
    {
      $set: { emailVerified: true },
      $unset: { emailVerificationToken: "", emailVerificationExpires: "" },
    }
  );

  console.log(`✅ ${result.modifiedCount} usuarios marcados como verificados`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
