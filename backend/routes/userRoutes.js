// routes/userRoutes.js
import express from "express";
import { updateUserProfile } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PUT /api/users/:id (actualizar perfil del usuario)
router.put("/:id", authMiddleware, updateUserProfile);

export default router;
