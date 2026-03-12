/**
 * Script de migración: recalcula el campo `sold` de todos los productos
 * agregando las cantidades vendidas de las órdenes históricas.
 *
 * Uso: node backend/scripts/recalcular-sold.js
 * (desde la raíz del proyecto, con el .env de backend cargado)
 */

import "dotenv/config";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ No se encontró MONGODB_URI en las variables de entorno.");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log("✅ Conectado a MongoDB");

// 1. Agregar ventas por productId desde todas las órdenes
const pipeline = [
  { $unwind: "$items" },
  {
    $match: {
      "items.productId": { $exists: true, $ne: null, $ne: "" },
      "items.quantity": { $gt: 0 },
      // Solo órdenes con pago recibido
      pagoEstado: "recibido",
    },
  },
  {
    $group: {
      _id: "$items.productId",
      totalVendido: { $sum: "$items.quantity" },
    },
  },
];

const results = await Order.aggregate(pipeline);
console.log(`📊 Productos con ventas encontradas: ${results.length}`);

// 2. Resetear sold a 0 en todos los productos
await Product.updateMany({}, { $set: { sold: 0 } });
console.log("🔄 Campo sold reseteado a 0 en todos los productos");

// 3. Actualizar sold para cada producto con ventas
let actualizados = 0;
for (const { _id, totalVendido } of results) {
  const result = await Product.findByIdAndUpdate(
    _id,
    { $set: { sold: totalVendido } },
    { new: true }
  );
  if (result) {
    console.log(`  ✅ ${result.name}: ${totalVendido} vendidos`);
    actualizados++;
  } else {
    console.warn(`  ⚠️ Producto no encontrado: ${_id}`);
  }
}

console.log(`\n✅ Migración completa. ${actualizados} productos actualizados.`);
await mongoose.disconnect();
