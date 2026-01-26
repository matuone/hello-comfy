

import express from "express";
import { body, validationResult } from "express-validator";
import { loginUser, registerUser } from "../controllers/authController.js";
// Rate limiting desactivado para login y register
import { forgotPassword } from "../controllers/forgotPasswordController.js";
import { resetPassword } from "../controllers/resetPasswordController.js";

const router = express.Router();


// POST /api/auth/register
router.post(
  "/register",
  // authLimiter,
  [
    body("name").trim().notEmpty().withMessage("El nombre es obligatorio").escape(),
    body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("dni").trim().notEmpty().withMessage("El DNI es obligatorio").escape(),
    body("whatsapp").trim().notEmpty().withMessage("El WhatsApp es obligatorio").escape(),
    body("address.street").trim().notEmpty().withMessage("La calle es obligatoria").escape(),
    body("address.number").trim().notEmpty().withMessage("El número es obligatorio").escape(),
    body("address.city").trim().notEmpty().withMessage("La ciudad es obligatoria").escape(),
    body("address.province").trim().notEmpty().withMessage("La provincia es obligatoria").escape(),
    body("address.postalCode").trim().notEmpty().withMessage("El código postal es obligatorio").escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  registerUser
);

// POST /api/auth/reset-password/:token
router.post(
  "/reset-password/:token",
  [
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  resetPassword
);




// POST /api/auth/login
router.post(
  "/login",
  // authLimiter,
  [
    body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  loginUser
);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

export default router;
