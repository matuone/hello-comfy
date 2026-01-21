import User from "../models/User.js";
import validator from "validator";
import crypto from "crypto";
import sendEmail from "../services/emailService.js";

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "El email no está registrado" });
    }
    // Generar token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hora
    await user.save();
    // Enviar email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Recuperá tu contraseña",
      html: `<p>Hacé click en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });
    res.json({ message: "Si el email existe, se envió un correo de recuperación" });
  } catch (err) {
    console.error("Error en forgotPassword:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
