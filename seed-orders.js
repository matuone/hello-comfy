import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "backend", ".env") });

import Order from "./backend/models/Order.js";

async function createSampleOrder() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Crear una orden de prueba
    const sampleOrder = new Order({
      code: "TEST-001",
      customer: {
        email: "matias@example.com", // Cambiar por el email del usuario logueado
        name: "Matías",
      },
      status: "preparando",
      pagoEstado: "recibido",
      envioEstado: "pendiente",
      timeline: [
        {
          status: "recibido",
          date: new Date().toISOString(),
        },
      ],
      shipping: {
        method: "home",
        address: "Avenida Corrientes 1234, Buenos Aires",
        eta: "2024-01-20",
        tracking: "AR123456789",
      },
      items: [
        {
          productId: "1",
          name: "Remera HelloComfy Premium",
          quantity: 2,
          price: 14999,
          image: "https://res.cloudinary.com/hellocomfy/image/upload/v173/remera1.jpg",
        },
        {
          productId: "2",
          name: "Hoodie Oversize",
          quantity: 1,
          price: 24999,
          image: "https://res.cloudinary.com/hellocomfy/image/upload/v173/hoodie1.jpg",
        },
      ],
      totals: {
        subtotal: 54997,
        shipping: 2000,
        discount: 0,
        total: 56997,
      },
      comentarios: "Por favor, entregar entre 14 y 18hs",
      date: new Date().toISOString(),
    });

    // Guardar la orden
    await sampleOrder.save();
    console.log("✅ Orden de prueba creada exitosamente");
    console.log("Detalles:", sampleOrder);

    // Crear una segunda orden
    const sampleOrder2 = new Order({
      code: "TEST-002",
      customer: {
        email: "matias@example.com", // Mismo email
        name: "Matías",
      },
      status: "entregado",
      pagoEstado: "recibido",
      envioEstado: "enviado",
      timeline: [
        {
          status: "recibido",
          date: "2024-01-10",
        },
        {
          status: "preparando",
          date: "2024-01-11",
        },
        {
          status: "en_camino",
          date: "2024-01-12",
        },
        {
          status: "entregado",
          date: "2024-01-15",
        },
      ],
      shipping: {
        method: "home",
        address: "Avenida Corrientes 1234, Buenos Aires",
        eta: "2024-01-15",
        tracking: "AR987654321",
      },
      items: [
        {
          productId: "3",
          name: "Tote Bag HelloComfy",
          quantity: 1,
          price: 8999,
          image: "https://res.cloudinary.com/hellocomfy/image/upload/v173/totebag1.jpg",
        },
      ],
      totals: {
        subtotal: 8999,
        shipping: 1500,
        discount: 0,
        total: 10499,
      },
      date: "2024-01-10",
    });

    await sampleOrder2.save();
    console.log("✅ Segunda orden de prueba creada exitosamente");

    console.log("\n📝 Recuerda cambiar el email en los scripts si usas otro usuario");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createSampleOrder();
