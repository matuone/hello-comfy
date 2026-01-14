import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "backend", ".env") });

import User from "./backend/models/User.js";
import Order from "./backend/models/Order.js";

async function createOrdersForAllUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Obtener todos los usuarios
    const users = await User.find({}, "email name");
    console.log(`📋 Encontrados ${users.length} usuarios`);

    if (users.length === 0) {
      console.log("⚠️  No hay usuarios en la base de datos");
      process.exit(0);
    }

    // Para cada usuario, crear una orden
    for (const user of users) {
      try {
        // Eliminar órdenes antiguas del usuario
        await Order.deleteMany({ "customer.email": user.email });

        // Crear orden 1
        const order1 = new Order({
          code: `ORD-${user.email.split("@")[0].toUpperCase()}-001`,
          customer: {
            email: user.email,
            name: user.name || "Cliente",
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
            eta: "2026-01-20",
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

        await order1.save();
        console.log(`✅ Orden creada para ${user.email}`);

        // Crear orden 2
        const order2 = new Order({
          code: `ORD-${user.email.split("@")[0].toUpperCase()}-002`,
          customer: {
            email: user.email,
            name: user.name || "Cliente",
          },
          status: "entregado",
          pagoEstado: "recibido",
          envioEstado: "enviado",
          timeline: [
            {
              status: "recibido",
              date: "2026-01-10",
            },
            {
              status: "preparando",
              date: "2026-01-11",
            },
            {
              status: "en_camino",
              date: "2026-01-12",
            },
            {
              status: "entregado",
              date: "2026-01-15",
            },
          ],
          shipping: {
            method: "home",
            address: "Avenida Corrientes 1234, Buenos Aires",
            eta: "2026-01-15",
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
          date: "2026-01-10",
        });

        await order2.save();
      } catch (err) {
        console.error(`❌ Error creando órdenes para ${user.email}:`, err.message);
      }
    }

    console.log("\n✅ Órdenes creadas exitosamente para todos los usuarios");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createOrdersForAllUsers();
