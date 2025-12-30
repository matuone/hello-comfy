import dotenv from "dotenv";
dotenv.config(); // ✅ Cargar variables ANTES de todo

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import productRoutes from "./routes/products.js";
import stockRoutes from "./routes/stock.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas nuevas
app.use("/api/stock", stockRoutes);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API HelloComfy funcionando");
});

// Rutas reales
app.use("/api/products", productRoutes);

// Inicio del servidor
app.listen(5000, () => {
  console.log("Servidor corriendo en puerto 5000");
});
