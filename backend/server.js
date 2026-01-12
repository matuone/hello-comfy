import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// ============================
// IMPORTS DE RUTAS
// ============================
import productRoutes from "./routes/productRoutes.js";
import stockRoutes from "./routes/stock.js";
import discountRoutes from "./routes/discountRoutes.js";
import promoCodeRoutes from "./routes/promoCodeRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import supportRoutes from "./routes/supportRoutes.js"; // ⭐ NUEVO

// ============================
// IMPORTS DE SERVICIOS DE ENVÍO
// ============================
import { cotizarAndreani } from "./services/shipping/andreani.js";
import { cotizarCorreo } from "./services/shipping/correo.js";

// ============================
// INICIALIZAR EXPRESS
// ============================
const app = express();

// ============================
// MIDDLEWARES
// ============================
app.use(cors());
app.use(express.json());

// ============================
// RUTAS DE AUTENTICACIÓN ADMIN
// ============================
app.use("/api/admin", adminAuthRoutes);

// ============================
// RUTA DE LOGIN CLIENTE
// ============================
app.use("/api/auth", authRoutes);

// ============================
// RUTA DE SOPORTE (NUEVA)
// ============================
app.use("/api/support", supportRoutes); // ⭐ NUEVO

// ============================
// RUTAS EXISTENTES
// ============================
app.use("/api/stock", stockRoutes);
app.use("/api/products", productRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/promocodes", promoCodeRoutes);

// ============================
// RUTAS DE ADMIN (FACTURACIÓN, ESTADOS, ETC.)
// ============================
app.use("/api", adminOrderRoutes);

// ============================
// RUTAS DE PEDIDOS (checkout, crear orden, etc.)
// ============================
app.use("/api", orderRoutes);

// ============================
// ENDPOINTS DE ENVÍO
// ============================
app.post("/api/shipping/andreani", async (req, res) => {
  try {
    const result = await cotizarAndreani(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error cotizando Andreani:", err);
    res.status(500).json({ error: "Error cotizando Andreani" });
  }
});

app.post("/api/shipping/correo", (req, res) => {
  try {
    const result = cotizarCorreo(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error cotizando Correo Argentino:", err);
    res.status(500).json({ error: "Error cotizando Correo Argentino" });
  }
});

// ============================
// RUTA DE PRUEBA
// ============================
app.get("/", (req, res) => {
  res.send("API HelloComfy funcionando");
});

// ============================
// CONEXIÓN A MONGO
// ============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// ============================
// INICIO DEL SERVIDOR
// ============================
app.listen(5000, () => {
  console.log("Servidor corriendo en puerto 5000");
});
