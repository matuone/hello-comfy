// Script para crear admin de prueba
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

async function crearAdmin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Datos del admin
    const email = "admin@hellocomfy.com";
    const password = "admin123"; // Cambiar después

    // Verificar si ya existe
    const existente = await Admin.findOne({ email });
    if (existente) {
      console.log("⚠️  Admin ya existe:", email);

      // Generar token para el admin existente
      const jwt = await import("jsonwebtoken");
      const token = jwt.default.sign(
        { id: existente._id, email: existente.email, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("\n🔑 TOKEN DE ADMIN:");
      console.log(token);
      console.log("\nUsá este token en el header Authorization: Bearer <token>");

      process.exit(0);
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear admin
    const admin = new Admin({
      email,
      passwordHash,
      role: "superadmin"
    });

    await admin.save();
    console.log("✅ Admin creado exitosamente");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);

    // Generar token
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      { id: admin._id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("\n🔑 TOKEN DE ADMIN:");
    console.log(token);
    console.log("\nUsá este token en el header Authorization: Bearer <token>");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

crearAdmin();
