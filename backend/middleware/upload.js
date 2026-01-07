import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// ============================
// MULTER → memoryStorage (ideal para Cloudinary)
// ============================
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por archivo
});

// ============================
// SUBIR UNA IMAGEN A CLOUDINARY
// ============================
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

// ============================
// SUBIR MÚLTIPLES IMÁGENES
// ============================
export const uploadMultipleToCloudinary = async (files) => {
  const urls = [];

  for (const file of files) {
    const url = await uploadToCloudinary(file);
    urls.push(url);
  }

  return urls;
};

export default upload;
