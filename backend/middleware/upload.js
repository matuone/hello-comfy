import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadToCloudinary = async (file) => {
  try {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "hellocomfy",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  }
};

export default upload;
