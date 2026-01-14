// routes/userRoutes.js
import express from "express";
import { updateUserProfile, updateUserAvatar } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Configurar multer para memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("El archivo debe ser una imagen"));
    }
  },
});

// PUT /api/users/:id (actualizar perfil del usuario)
router.put("/:id", authMiddleware, updateUserProfile);

// PUT /api/users/:id/avatar (actualizar avatar del usuario)
router.put("/:id/avatar", authMiddleware, upload.single("avatar"), updateUserAvatar);

export default router;
