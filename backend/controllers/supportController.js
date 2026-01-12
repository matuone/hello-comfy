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
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // ============================
    // EMAIL PARA VOS (ADMIN)
    // ============================
    const adminHtml = `
      <div style="
        font-family: Arial, sans-serif;
        background: #fafafa;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #eee;
      ">
        <h2 style="color: #d94f7a; margin-top: 0;">📩 Nueva consulta de ayuda</h2>

        <p style="margin-bottom: 16px; color: #555;">
          Recibiste una nueva consulta desde el área de cliente.
        </p>

        <div style="
          background: white;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #eee;
        ">
          <p><strong>Tema:</strong> ${cleanTema}</p>
          <p><strong>Orden:</strong> ${cleanOrden}</p>
          <p><strong>Email:</strong> ${cleanEmail}</p>
          <p><strong>WhatsApp:</strong> ${cleanWhatsapp}</p>

          <p style="margin-top: 20px;">
            <strong>Descripción:</strong><br/>
            ${cleanDescripcion.replace(/\n/g, "<br/>")}
          </p>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Este mensaje fue generado automáticamente por HelloComfy.
        </p>
      </div>
    `;

    // ============================
    // EMAIL PARA EL CLIENTE
    // ============================
    const clientHtml = `
      <div style="
        font-family: Arial, sans-serif;
        background: #fafafa;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #eee;
      ">
        <h2 style="color: #d94f7a; margin-top: 0;">💖 ¡Gracias por contactarnos!</h2>

        <p style="margin-bottom: 16px; color: #555;">
          Recibimos tu consulta y nuestro equipo la está revisando.
        </p>

        <div style="
          background: white;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #eee;
        ">
          <p><strong>Tema:</strong> ${cleanTema}</p>
          <p><strong>Orden:</strong> ${cleanOrden}</p>

          <p style="margin-top: 20px;">
            <strong>Tu mensaje:</strong><br/>
            ${cleanDescripcion.replace(/\n/g, "<br/>")}
          </p>
        </div>

        <p style="margin-top: 24px; color: #555;">
          Te vamos a responder a este email o por WhatsApp al número que nos dejaste.
        </p>

        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          HelloComfy — Atención al cliente
        </p>
      </div>
    `;

    // ============================
    // ENVIAR EMAIL AL ADMIN
    // ============================
    await transporter.sendMail({
      from: "Hello Comfy <hellocomfyind@gmail.com>",
      to: "hellocomfyind@gmail.com",
      subject: `Consulta de ayuda: ${cleanTema}`,
      text: cleanDescripcion,
      html: adminHtml,
    });

    // ============================
    // ENVIAR EMAIL AL CLIENTE
    // ============================
    await transporter.sendMail({
      from: "Hello Comfy <hellocomfyind@gmail.com>",
      to: cleanEmail,
      subject: "Recibimos tu consulta 💖",
      text: "Recibimos tu consulta y te vamos a responder pronto.",
      html: clientHtml,
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("Error enviando email:", err);
    return res.status(500).json({ error: "Error enviando email" });
  }
}
