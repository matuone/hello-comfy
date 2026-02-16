/**
 * seed-feed.js
 * Script para insertar datos de ejemplo en la colección Feed
 * 
 * Uso: node seed-feed.js
 */

import mongoose from "mongoose";
import Feed from "./models/Feed.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hello-comfy";

const sampleFeedData = [
  {
    title: "Nueva Colección Primavera 2024",
    description: "Descubre nuestras nuevas prendas para la primavera con colores vibrantes",
    caption: "Colección Primavera ✨",
    imageUrl: "https://via.placeholder.com/400x400?text=Primavera+2024",
    instagramUrl: "https://instagram.com/hellocomfy",
    order: 1,
    active: true,
  },
  {
    title: "Best Sellers del Mes",
    description: "Los productos más vendidos este mes",
    caption: "Top Ventas 🔥",
    imageUrl: "https://via.placeholder.com/400x400?text=Best+Sellers",
    instagramUrl: "https://instagram.com/hellocomfy",
    order: 2,
    active: true,
  },
  {
    title: "Remeras Premium",
    description: "Nuestras remeras de calidad premium con diseños exclusivos",
    caption: "Remeras Premium 👕",
    imageUrl: "https://via.placeholder.com/400x400?text=Remeras",
    instagramUrl: "https://instagram.com/hellocomfy",
    order: 3,
    active: true,
  },
  {
    title: "Accesorios Complementarios",
    description: "Los accesorios perfectos para completar tu look",
    caption: "Accesorios 💎",
    imageUrl: "https://via.placeholder.com/400x400?text=Accesorios",
    instagramUrl: "https://instagram.com/hellocomfy",
    order: 4,
    active: true,
  },
  {
    title: "Limited Edition",
    description: "Edición limitada disponible solo este mes",
    caption: "Limited Edition 🎯",
    imageUrl: "https://via.placeholder.com/400x400?text=Limited+Edition",
    instagramUrl: "https://instagram.com/hellocomfy",
    order: 5,
    active: true,
  },
  {
    title: "Colección Invierno",
    description: "Abrígate con estilo con nuestra colección de invierno",
    caption: "Invierno 2024 ❄️",
    imageUrl: "https://via.placeholder.com/400x400?text=Invierno",
    instagramUrl: "https://instagram.com/hellocomfy",
    order: 6,
    active: true,
  },
  {
    title: "Looks de Cliente",
    description: "Nuestros clientes luciendo HelloComfy",
    caption: "Customer Looks 📸",
    imageUrl: "https://via.placeholder.com/400x400?text=Customer+Looks",
    instagramUrl: "https://instagram.com/hellocomfy",
    order: 7,
    active: true,
  },
  {
    title: "Novedades Agosto",
    description: "Llegan las novedades del mes de agosto",
    caption: "Novedades 🆕",
    imageUrl: "https://via.placeholder.com/400x400?text=Novedades",
    instagramUrl: "https://instagram.com/hellocomfy",
    order: 8,
    active: false,
  },
];

async function seedFeed() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar colección existente
    console.log("🗑️  Limpiando colección Feed...");
    await Feed.deleteMany({});

    // Insertar datos de ejemplo
    console.log("📝 Insertando datos de ejemplo...");
    const result = await Feed.insertMany(sampleFeedData);
    console.log(`✅ ${result.length} posts creados exitosamente`);

    // Mostrar resumen
    const allPosts = await Feed.find().sort({ order: 1 });
    console.log("\n📊 Posts en la base de datos:");
    allPosts.forEach((post) => {
      console.log(`  - [${post.order}] ${post.title} (${post.active ? "Activo" : "Inactivo"})`);
    });

    console.log("\n✨ Seed completado!");
  } catch (error) {
    console.error("❌ Error durante seed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado de MongoDB");
  }
}

// Ejecutar seed
seedFeed();
