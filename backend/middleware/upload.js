import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Directorio base de uploads.
// En producción se configura vía UPLOADS_DIR en .env (ej: /root/hello-comfy/uploads)
// En desarrollo, cae en <proyecto>/uploads/ (fuera de backend/)
const UPLOADS_BASE = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../../uploads");

// Función para obtener la URL pública base (evaluado en runtime, no en load-time)
// En producción: https://hellocomfy.com.ar (nginx sirve /uploads/ desde UPLOADS_BASE)
// En desarrollo: http://localhost:5000 (Express sirve /uploads/ como static)
function getPublicBase() {
  return (process.env.FRONTEND_URL || "http://localhost:5000").replace(/\/$/, "");
}

// Crear subcarpetas si no existen
["products", "avatars", "banners"].forEach((dir) => {
  fs.mkdirSync(path.join(UPLOADS_BASE, dir), { recursive: true });
});

// Nombre de archivo único
function makeFilename(file) {
  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

// Factory de diskStorage por subcarpeta
function diskStorageFor(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOADS_BASE, subfolder)),
    filename: (req, file, cb) => cb(null, makeFilename(file)),
  });
}

// Filtro: solo imágenes
const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten archivos de imagen"));
  }
  cb(null, true);
};

// ============================
// MIDDLEWARE PARA PRODUCTOS (por defecto)
// ============================
const upload = multer({
  storage: diskStorageFor("products"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// ============================
// MIDDLEWARE PARA BANNERS (10MB)
// ============================
export const uploadBannerMiddleware = multer({
  storage: diskStorageFor("banners"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// ============================
// MIDDLEWARE PARA AVATARES
// ============================
export const uploadAvatarMiddleware = multer({
  storage: diskStorageFor("avatars"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// Obtener la URL pública de un archivo ya guardado por multer en disco
export function getUploadUrl(file, subfolder) {
  return `${getPublicBase()}/uploads/${subfolder}/${file.filename}`;
}

// ============================
// Helpers de subida para productos
// ============================
export const uploadProductImage = async (file) => {
  return getUploadUrl(file, "products");
};

export const uploadProductImages = async (files) => {
  return files.map((f) => getUploadUrl(f, "products"));
};

export default upload;
