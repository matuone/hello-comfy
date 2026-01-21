
import express from "express";
import { loginUser } from "../controllers/authController.js";
import { forgotPassword } from "../controllers/forgotPasswordController.js";
import { resetPassword } from "../controllers/resetPasswordController.js";

const router = express.Router();
// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", resetPassword);


// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

export default router;
