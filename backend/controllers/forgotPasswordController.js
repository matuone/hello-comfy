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
      html: `
      <div style=\"font-family: 'Arial', sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.10);\">
        <div style=\"background: linear-gradient(135deg, #d94f7a 0%, #e76f93 100%); padding: 32px 24px; text-align: center;\">
          <h1 style=\"color: white; margin: 0; font-size: 26px; font-weight: 700;\">Recuperá tu contraseña</h1>
          <p style=\"color: rgba(255,255,255,0.95); margin: 8px 0 0 0; font-size: 16px;\">Hola! Recibimos tu pedido para restablecer la contraseña de tu cuenta Hello Comfy.</p>
        </div>
        <div style=\"padding: 32px 24px; text-align: center;\">
          <p style=\"font-size: 16px; color: #333; margin-bottom: 24px;\">Hacé click en el siguiente botón para crear una nueva contraseña:</p>
          <a href=\"${resetUrl}\" style=\"display: inline-block; background: #d94f7a; color: #fff; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 8px; font-size: 18px; margin-bottom: 18px;\">Restablecer contraseña</a>
          <p style=\"color: #888; font-size: 13px; margin-top: 24px;\">Si no solicitaste este cambio, podés ignorar este email.</p>
          <p style=\"color: #888; font-size: 13px; margin-top: 8px;\">Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br><span style=\"word-break: break-all; color: #d94f7a;\">${resetUrl}</span></p>
        </div>
        <div style=\"background: #fafafa; padding: 18px 0; text-align: center; color: #aaa; font-size: 12px; border-top: 1px solid #eee;\">
          <p style=\"margin: 0;\">Hello Comfy 🧸</p>
          <p style=\"margin: 8px 0 0 0;\">© 2026 Hello Comfy. Todos los derechos reservados.</p>
        </div>
      </div>
      `
    });
    res.json({ message: "Si el email existe, se envió un correo de recuperación" });
  } catch (err) {
    console.error("Error en forgotPassword");
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
