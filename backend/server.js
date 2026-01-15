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
import userRoutes from "./routes/userRoutes.js"; // ⭐ NUEVO
import customerRoutes from "./routes/customerRoutes.js"; // ⭐ NUEVO
import mercadopagoRoutes from "./routes/mercadopagoRoutes.js"; // ⭐ NUEVO
import gocuotasRoutes from "./routes/gocuotasRoutes.js"; // ⭐ NUEVO
import subcategoryRoutes from "./routes/subcategoryRoutes.js"; // ⭐ NUEVO
import siteConfigRoutes from "./routes/siteConfigRoutes.js"; // ⭐ NUEVO
import sizeTableRoutes from "./routes/sizeTableRoutes.js"; // ⭐ NUEVO
import promoBannerRoutes from "./routes/promoBannerRoutes.js"; // ⭐ NUEVO
import modoRoutes from "./routes/modoRoutes.js"; // ⭐ NUEVO

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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
// RUTA DE USUARIOS (NUEVA)
// ============================
app.use("/api/users", userRoutes); // ⭐ NUEVO

// ============================
// RUTA DE CLIENTES (NUEVA)
// ============================
app.use("/api/customers", customerRoutes); // ⭐ NUEVO

// ============================
// RUTAS EXISTENTES
// ============================
app.use("/api/stock", stockRoutes);
app.use("/api/products", productRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/promocodes", promoCodeRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/sizetables", sizeTableRoutes);

// ============================
// RUTAS DE MERCADO PAGO (⭐ NUEVO)
// ============================
app.use("/api/mercadopago", mercadopagoRoutes);

// ============================
// RUTAS DE GO CUOTAS (⭐ NUEVO)
// ============================
app.use("/api/gocuotas", gocuotasRoutes);

// ============================
// RUTAS DE MODO (⭐ NUEVO)
// ============================
app.use("/api/modo", modoRoutes);

// ============================
// RUTAS DE ADMIN (FACTURACIÓN, ESTADOS, ETC.)
// ============================
app.use("/api", adminOrderRoutes);

// ============================
// RUTAS DE CONFIGURACIÓN DEL SITIO (⭐ NUEVO)
// ============================
app.use("/api/config", siteConfigRoutes);

// ============================
// RUTAS DE PROMO BANNER (⭐ NUEVO)
// ============================
app.use("/api/promo-banner", (req, res, next) => {
  console.log(`📍 Petición a promo-banner: ${req.method} ${req.url}`);
  next();
}, promoBannerRoutes);

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
