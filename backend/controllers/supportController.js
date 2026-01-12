import nodemailer from "nodemailer";
import validator from "validator";

export async function sendSupportEmail(req, res) {
  try {
    const { tema, orden, email, whatsapp, descripcion } = req.body;

    // ============================
    // VALIDACIONES
    // ============================
    if (!tema || !email || !whatsapp || !descripcion) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Sanitizar campos
    const cleanTema = validator.escape(tema);
    const cleanOrden = orden ? validator.escape(orden) : "No especificada";
    const cleanEmail = validator.normalizeEmail(email);
    const cleanWhatsapp = validator.escape(whatsapp);
    const cleanDescripcion = validator.escape(descripcion);

    // ============================
    // CONFIGURAR TRANSPORTE
    // ============================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hellocomfyind@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD, // contraseña de app con espacios
      },
    });

    // ============================
    // MENSAJE
    // ============================
    const message = `
📩 NUEVA CONSULTA DE AYUDA

Tema: ${cleanTema}
Orden: ${cleanOrden}
Email: ${cleanEmail}
WhatsApp: ${cleanWhatsapp}

Descripción:
${cleanDescripcion}
    `;

    // ============================
    // ENVIAR EMAIL
    // ============================
    await transporter.sendMail({
      from: "Hello Comfy <hellocomfyind@gmail.com>",
      to: "hellocomfyind@gmail.com",
      subject: `Consulta de ayuda: ${cleanTema}`,
      text: message,
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("Error enviando email:", err);
    return res.status(500).json({ error: "Error enviando email" });
  }
}
