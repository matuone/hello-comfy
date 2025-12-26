import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/products.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.use("/api/Products", productRoutes);

// Inicio del servidor
app.listen(5000, () => {
  console.log("Servidor corriendo en puerto 5000");
});
