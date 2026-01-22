import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { updateUserProfile, updateUserAvatar } from "../controllers/authController.js";
import upload from "../middleware/upload.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// ============================
// ACTUALIZAR PERFIL DEL USUARIO
// ============================
router.put(
  "/:id",
  authMiddleware,
  [
    body("name").trim().notEmpty().withMessage("El nombre es obligatorio").escape(),
    body("dni").trim().notEmpty().withMessage("El DNI es obligatorio").escape(),
    body("whatsapp").trim().notEmpty().withMessage("El WhatsApp es obligatorio").escape(),
    body("address.street").optional().trim().notEmpty().withMessage("La calle es obligatoria").escape(),
    body("address.number").optional().trim().notEmpty().withMessage("El número es obligatorio").escape(),
    body("address.city").optional().trim().notEmpty().withMessage("La ciudad es obligatoria").escape(),
    body("address.province").optional().trim().notEmpty().withMessage("La provincia es obligatoria").escape(),
    body("address.postalCode").optional().trim().notEmpty().withMessage("El código postal es obligatorio").escape(),
    body("address.floor").optional().trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateUserProfile
);

// ============================
// ACTUALIZAR AVATAR DEL USUARIO
// ============================
router.put("/:id/avatar", authMiddleware, upload.single("avatar"), updateUserAvatar);

export default router;
