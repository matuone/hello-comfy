// Script para actualizar peso y dimensiones de todos los productos
// Uso: cd backend && node update-dimensions.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const WEIGHT = 0.2;          // kg
const HEIGHT = 5;             // cm
const WIDTH = 5;              // cm
const LENGTH = 5;             // cm

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI no definida en .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Conectado a MongoDB");

  const result = await mongoose.connection.db.collection("products").updateMany(
    {},
    {
      $set: {
        weight: WEIGHT,
        dimensions: { height: HEIGHT, width: WIDTH, length: LENGTH },
      },
    }
  );

  console.log(`✅ ${result.modifiedCount} productos actualizados`);
  console.log(`   Peso: ${WEIGHT} kg | Medidas: ${HEIGHT}×${WIDTH}×${LENGTH} cm`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
