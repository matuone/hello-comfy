import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// Multer con memoryStorage
const storage = multer.memoryStorage();

// ✅ Aceptamos múltiples archivos bajo el campo "images"
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // opcional: 5MB por archivo
});

export const uploadToCloudinary = async (file) => {
  try {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "hellocomfy/products",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  }
};

export default upload;
