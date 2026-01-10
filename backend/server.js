import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Rutas existentes
import productRoutes from "./routes/productRoutes.js";
import stockRoutes from "./routes/stock.js";
import discountRoutes from "./routes/discountRoutes.js";
import promoCodeRoutes from "./routes/promoCodeRoutes.js";

// Servicios de envío
import { cotizarAndreani } from "./services/shipping/andreani.js";
import { cotizarCorreo } from "./services/shipping/correo.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas existentes
app.use("/api/stock", stockRoutes);
app.use("/api/products", productRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/promocodes", promoCodeRoutes);

// ⭐ NUEVO — Endpoint Andreani
app.post("/api/shipping/andreani", async (req, res) => {
  try {
    const result = await cotizarAndreani(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error cotizando Andreani:", err);
    res.status(500).json({ error: "Error cotizando Andreani" });
  }
});

// ⭐ NUEVO — Endpoint Correo Argentino
app.post("/api/shipping/correo", (req, res) => {
  try {
    const result = cotizarCorreo(req.body);
    res.json(result);
  } catch (err) {
    console.error("Error cotizando Correo Argentino:", err);
    res.status(500).json({ error: "Error cotizando Correo Argentino" });
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API HelloComfy funcionando");
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// Inicio del servidor
app.listen(5000, () => {
  console.log("Servidor corriendo en puerto 5000");
});
