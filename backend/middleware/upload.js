import multer from "multer";
import cloudinary from "../config/cloudinary.js"; // 👈 este ya tiene las claves
import { Readable } from "stream";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "hellocomfy",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

export default upload;
