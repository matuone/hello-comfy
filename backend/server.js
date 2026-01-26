import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

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
import afipRoutes from "./routes/afipRoutes.js"; // ⭐ NUEVO
import correoArgentinoRoutes from "./routes/correoArgentinoRoutes.js"; // ⭐ CORREO ARG API

// ============================
// IMPORTS DE SERVICIOS DE ENVÍO
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

// Opcional: bloquear OPTIONS salvo para CORS preflight
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

// Configuración de CORS restrictivo
const allowedOrigins = [
  "http://localhost:5173",
  "https://tudominio.com" // Cambia esto por tu dominio real en producción
];
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman) o desde orígenes permitidos
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true
}));

// Middleware para forzar HTTPS en producción
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
  });
}

// Rate limiting global: 100 requests cada 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: "Demasiadas solicitudes desde esta IP, intenta más tarde." });
  }
});
app.use(limiter);

// Helmet para headers de seguridad con políticas reforzadas
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
        frameSrc: ["'self'", "https://www.google.com"],
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

// Logs de acceso HTTP (solo en producción)
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}

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
// RUTAS DE AFIP (⭐ NUEVO)
// ============================
app.use("/api", afipRoutes);

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
app.use("/api/promo-banner", promoBannerRoutes);

// ============================
// RUTAS CORREO ARGENTINO API
// ============================
app.use("/api", correoArgentinoRoutes);

// ============================
// RUTAS DE PEDIDOS (checkout, crear orden, etc.)
// ============================
app.use("/api", orderRoutes);

// ============================
// ENDPOINTS DE ENVÍO
// ============================
// COMENTADO: Andreani no configurado aún
// app.post("/api/shipping/andreani", async (req, res) => {
//   try {
//     const result = await cotizarAndreani(req.body);
//     res.json(result);
//   } catch (err) {
//     console.error("Error cotizando Andreani:", err);
//     res.status(500).json({ error: "Error cotizando Andreani" });
//   }
// });

app.post("/api/shipping/correo", async (req, res) => {
  try {
    // Intentar usar la API de Correo Argentino primero
    const apiResult = await cotizarCorreoArgentino(req.body);

    // Si la API no está configurada o falla, usar tarifas locales
    if (apiResult.pendingCredentials || apiResult.apiError) {
      const fallbackResult = cotizarCorreo(req.body);
      res.json({ ...fallbackResult, source: "local" });
    } else {
      res.json({ ...apiResult, source: "api" });
    }
  } catch (err) {
    console.error("Error cotizando Correo Argentino:", err);
    // Fallback a tarifas locales en caso de error
    try {
      const fallbackResult = cotizarCorreo(req.body);
      res.json({ ...fallbackResult, source: "local-fallback" });
    } catch (fallbackErr) {
      res.status(500).json({ error: "Error cotizando Correo Argentino" });
    }
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
  .then(() => {/* MongoDB conectado */ })
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// ============================
// INICIO DEL SERVIDOR
// ============================
app.listen(5000, () => {
  console.log("\u2705  Backend corriendo en puerto 5000");
});
