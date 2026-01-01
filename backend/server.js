import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import stockRoutes from "./routes/stock.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/stock", stockRoutes);
app.use("/api/products", productRoutes);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API HelloComfy funcionando");
});

// Inicio del servidor
app.listen(5000, () => {
  console.log("Servidor corriendo en puerto 5000");
});
