import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

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
import supportRoutes from "./routes/supportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import mercadopagoRoutes from "./routes/mercadopagoRoutes.js";
import gocuotasRoutes from "./routes/gocuotasRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import siteConfigRoutes from "./routes/siteConfigRoutes.js";
import sizeTableRoutes from "./routes/sizeTableRoutes.js";
import promoBannerRoutes from "./routes/promoBannerRoutes.js";
import modoRoutes from "./routes/modoRoutes.js";
import afipRoutes from "./routes/afipRoutes.js";
import correoArgentinoRoutes from "./routes/correoArgentinoRoutes.js";
import opinionRoutes from "./routes/opinionRoutes.js";

import "./services/stockAlertService.js";

// ============================
// SERVICIOS DE ENVÍO
// ============================
import { cotizarAndreani } from "./services/shipping/andreani.js";
import { cotizarCorreo } from "./services/shipping/correo.js";
import { cotizarCorreoArgentino } from "./services/shipping/correoArgentinoApi.js";

// ============================
// INICIALIZAR EXPRESS
// ============================
const app = express();

// Deshabilitar métodos HTTP inseguros
const disallowedMethods = ["TRACE", "TRACK"];
app.use((req, res, next) => {
  if (disallowedMethods.includes(req.method)) {
    return res.status(405).send("Método no permitido");
  }
  next();
});

// Bloquear OPTIONS inválidos
app.use((req, res, next) => {
  if (req.method === "OPTIONS" && !req.headers["access-control-request-method"]) {
    return res.status(405).send("Método OPTIONS no permitido");
  }
  next();
});

// ============================
// MIDDLEWARES
// ============================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://tudominio.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true
}));

// Forzar HTTPS en producción
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
  });
}

// Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://api.mercadopago.com", "https://api.gocuotas.com"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    xssFilter: true,
    noSniff: true,
    frameguard: { action: "deny" },
  })
);

// Logs
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}

// ============================
// RUTAS API
// ============================
app.use("/api/admin", adminAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/products", productRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/promocodes", promoCodeRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/sizetables", sizeTableRoutes);
app.use("/api/mercadopago", mercadopagoRoutes);
app.use("/api/gocuotas", gocuotasRoutes);
app.use("/api/modo", modoRoutes);
app.use("/api", afipRoutes);
app.use("/api", adminOrderRoutes);
app.use("/api/config", siteConfigRoutes);
app.use("/api/promo-banner", promoBannerRoutes);
app.use("/api", correoArgentinoRoutes);
app.use("/api", orderRoutes);
app.use("/api/opinions", opinionRoutes);

// ============================
// ENVÍOS
// ============================
app.post("/api/shipping/correo", async (req, res) => {
  try {
    const apiResult = await cotizarCorreoArgentino(req.body);

    if (apiResult.pendingCredentials || apiResult.apiError) {
      const fallbackResult = cotizarCorreo(req.body);
      res.json({ ...fallbackResult, source: "local" });
    } else {
      res.json({ ...apiResult, source: "api" });
    }
  } catch (err) {
    try {
      const fallbackResult = cotizarCorreo(req.body);
      res.json({ ...fallbackResult, source: "local-fallback" });
    } catch (fallbackErr) {
      res.status(500).json({ error: "Error cotizando Correo Argentino" });
    }
  }
});

// ============================
// SERVIR FRONTEND (EXPRESS 4)
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "..", "dist");

app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ============================
// CONEXIÓN A MONGO
// ============================
mongoose
  .connect(process.env.MONGO_URI)
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// ============================
// INICIO DEL SERVIDOR
// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en puerto ${PORT}`);
});
