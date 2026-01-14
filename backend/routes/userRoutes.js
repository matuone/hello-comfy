import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { updateUserProfile, updateUserAvatar } from "../controllers/authController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ============================
// ACTUALIZAR PERFIL DEL USUARIO
// ============================
router.put("/:id", authMiddleware, updateUserProfile);

// ============================
// ACTUALIZAR AVATAR DEL USUARIO
// ============================
router.put("/:id/avatar", authMiddleware, upload.single("avatar"), updateUserAvatar);

export default router;
