// backend/services/emailService.js
import nodemailer from "nodemailer";

/**
 * Enviar email de confirmación de orden al cliente
 * @param {Object} order - Objeto de orden creada
 */
export async function enviarEmailConfirmacionOrden(order) {
  try {
    // Validar que tenemos el password configurado
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️ GMAIL_APP_PASSWORD no configurado, no se enviará email");
      console.warn("⚠️ Email del cliente que debería recibir:", order.customer?.email);
      return false;
    }

    console.log("📧 Intentando enviar email a:", order.customer?.email);
    console.log("📧 Código de orden:", order.code);

    // Configurar transporte (mismo que supportController)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hellocomfyind@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Generar lista de productos HTML
    const productosHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong><br>
            <small style="color: #888;">
              Cantidad: ${item.quantity}
              ${item.size ? `<br>Talle: ${item.size}` : ''}
              ${item.color ? `<br>Color: ${item.color}` : ''}
            </small>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            $${item.price.toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    // Información de envío
    const shippingInfo =
      order.shipping?.method === "pickup"
        ? `<strong>Retiro en Pick Up Point</strong><br>${order.shipping?.pickPoint || ""}`
        : `<strong>Envío a domicilio</strong><br>${order.shipping?.address || ""}`;

    // Mapeo de métodos de pago
    const paymentMethodLabels = {
      mercadopago: "Mercado Pago",
      gocuotas: "GoCuotas",
      modo: "Modo",
    };
    const paymentMethodLabel = paymentMethodLabels[order.paymentMethod] || order.paymentMethod || "No especificado";

    // HTML del email
    const emailHtml = `
      <div style="
        font-family: 'Arial', sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #d94f7a 0%, #e76f93 100%);
          padding: 32px 24px;
          text-align: center;
        ">
          <h1 style="
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          ">¡Gracias por tu compra!</h1>
          <p style="
            color: rgba(255,255,255,0.95);
            margin: 8px 0 0 0;
            font-size: 16px;
          ">Tu orden ha sido confirmada</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
          <!-- Número de orden -->
          <div style="
            background: #f8f8f8;
            border: 2px solid #d94f7a;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            text-align: center;
          ">
            <p style="
              margin: 0 0 8px 0;
              color: #666;
              font-size: 14px;
            ">Número de orden</p>
            <p style="
              margin: 0;
              color: #d94f7a;
              font-size: 32px;
              font-weight: 800;
            ">#${order.code}</p>
          </div>

          <!-- Productos -->
          <h2 style="
            color: #333;
            font-size: 20px;
            margin: 0 0 16px 0;
          ">Productos</h2>
          <table style="
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #eee;
          ">
            ${productosHtml}
            <tr style="background: #f8f8f8;">
              <td style="padding: 16px; font-weight: 700; font-size: 18px;">
                Total
              </td>
              <td style="padding: 16px; text-align: right; font-weight: 700; font-size: 18px; color: #d94f7a;">
                $${order.totals?.total?.toFixed(2) || "0.00"}
              </td>
            </tr>
          </table>

          <!-- Información de envío -->
          <h2 style="
            color: #333;
            font-size: 20px;
            margin: 0 0 12px 0;
          ">Información de envío</h2>
          <div style="
            background: #f8f8f8;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          ">
            <p style="margin: 0; color: #555; line-height: 1.6;">
              ${shippingInfo}
            </p>
          </div>

          <!-- Medio de pago -->
          <h2 style="
            color: #333;
            font-size: 20px;
            margin: 0 0 12px 0;
          ">Medio de pago</h2>
          <div style="
            background: #f8f8f8;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          ">
            <p style="margin: 0; color: #555;">
              <strong>${paymentMethodLabel}</strong>
            </p>
          </div>

          <!-- Información adicional -->
          <div style="
            background: #fff7fb;
            border-left: 4px solid #d94f7a;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 24px;
          ">
            <p style="margin: 0 0 8px 0; color: #555; line-height: 1.6;">
              ${
                order.shipping?.method === "pickup"
                  ? "Te avisaremos por email y WhatsApp cuando tu pedido esté listo para retirar."
                  : "Te notificaremos cuando tu pedido salga en camino."
              }
            </p>
            <p style="margin: 0; color: #555; line-height: 1.6;">
              Podés hacer seguimiento de tu pedido en nuestra web.
            </p>
          </div>

          <!-- Datos del cliente -->
          <p style="color: #888; font-size: 14px; margin: 0;">
            <strong>Email:</strong> ${order.customer?.email}<br>
            <strong>Nombre:</strong> ${order.customer?.name}
          </p>
        </div>

        <!-- Footer -->
        <div style="
          background: #f8f8f8;
          padding: 24px;
          text-align: center;
          border-top: 1px solid #eee;
        ">
          <p style="
            color: #999;
            font-size: 14px;
            margin: 0 0 8px 0;
          ">¿Necesitás ayuda?</p>
          <p style="
            color: #d94f7a;
            font-size: 14px;
            margin: 0;
            font-weight: 600;
          ">Contactanos: hellocomfyind@gmail.com</p>
        </div>
      </div>
    `;

    // Enviar email al cliente
    await transporter.sendMail({
      from: '"Hello Comfy 🧸" <hellocomfyind@gmail.com>',
      to: order.customer?.email,
      subject: `✅ Confirmación de compra - Orden #${order.code}`,
      html: emailHtml,
    });

    console.log(`✅ Email de confirmación enviado a: ${order.customer?.email}`);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email de confirmación:", error.message);
    console.error("❌ Error completo:", error);
    console.error("❌ Email destinatario:", order.customer?.email);
    console.error("❌ Código de orden:", order.code);
    // No lanzamos el error para que no falle la creación de la orden
    return false;
  }
}

/**
 * Enviar email al admin notificando nueva orden
 * @param {Object} order - Objeto de orden creada
 */
export async function enviarEmailAlAdmin(order) {
  try {
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️ GMAIL_APP_PASSWORD no configurado, no se enviará email al admin");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hellocomfyind@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Generar lista de productos
    const productosHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString("es-AR")}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toLocaleString("es-AR")}</td>
        </tr>
      `
      )
      .join("");

    const shippingInfo =
      order.shipping?.method === "pickup"
        ? `<strong>Punto de retiro:</strong> ${order.shipping?.pickPoint || ""}`
        : `<strong>Dirección:</strong> ${order.shipping?.address || ""}`;

    const paymentMethodLabels = {
      mercadopago: "Mercado Pago",
      gocuotas: "GoCuotas",
      modo: "Modo",
      transfer: "Transferencia Bancaria",
    };
    const paymentMethodLabel = paymentMethodLabels[order.paymentMethod] || order.paymentMethod || "No especificado";

    const emailHtml = `
      <div style="
        font-family: 'Arial', sans-serif;
        max-width: 700px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #d94f7a 0%, #e76f93 100%);
          padding: 32px 24px;
          text-align: center;
        ">
          <h1 style="
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          ">Recibiste una compra 🎉</h1>
          <p style="
            color: rgba(255,255,255,0.95);
            margin: 8px 0 0 0;
            font-size: 16px;
          ">De ${order.customer?.name}</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
          <!-- Número de orden -->
          <div style="
            background: #f8f8f8;
            border: 2px solid #d94f7a;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            text-align: center;
          ">
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Orden Nro:</p>
            <p style="margin: 0; color: #d94f7a; font-size: 32px; font-weight: 800;">#${order.code}</p>
          </div>

          <!-- Información de Contacto -->
          <h2 style="color: #333; font-size: 18px; margin: 0 0 12px 0;">Información de Contacto</h2>
          <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: #555;"><strong>Email:</strong> ${order.customer?.email}</p>
            <p style="margin: 0 0 8px 0; color: #555;"><strong>Nombre completo:</strong> ${order.customer?.name}</p>
            <p style="margin: 0 0 8px 0; color: #555;"><strong>DNI:</strong> Sin información</p>
            <p style="margin: 0; color: #555;"><strong>Teléfono:</strong> Sin información</p>
          </div>

          <!-- Información de Envío -->
          <h2 style="color: #333; font-size: 18px; margin: 0 0 12px 0;">Información de Envío</h2>
          <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #555;">${shippingInfo}</p>
          </div>

          <!-- Productos -->
          <h2 style="color: #333; font-size: 18px; margin: 0 0 12px 0;">Productos</h2>
          <table style="
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            border: 1px solid #eee;
          ">
            <thead>
              <tr style="background: #f8f8f8;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #eee;">Producto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">Cantidad</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">Precio</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productosHtml}
            </tbody>
            <tfoot>
              <tr style="background: #f8f8f8; font-weight: 700;">
                <td colspan="3" style="padding: 16px; text-align: right;">Total</td>
                <td style="padding: 16px; text-align: right; color: #d94f7a; font-size: 18px;">
                  $${order.totals?.total?.toLocaleString("es-AR") || "0"}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- Método de Pago -->
          <h2 style="color: #333; font-size: 18px; margin: 0 0 12px 0;">Método de Pago</h2>
          <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #555;"><strong>${paymentMethodLabel}</strong></p>
          </div>

          <!-- Comprobante (si existe) -->
          ${order.paymentMethod === 'transfer' && order.paymentProof ? `
          <h2 style="color: #333; font-size: 18px; margin: 0 0 12px 0;">Comprobante de Transferencia</h2>
          <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; border-left: 4px solid #2196F3; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: #555;">
              <strong>Archivo:</strong> ${order.paymentProofName || 'comprobante.jpg'}
            </p>
            <p style="margin: 0; color: #555;">
              Adjunto al final de este email.
            </p>
          </div>
          ` : ''}

          <!-- Estado -->
          <h2 style="color: #333; font-size: 18px; margin: 0 0 12px 0;">Estado de la transacción</h2>
          <div style="background: #e8f5e9; padding: 16px; border-radius: 8px;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>✓ Pago ${order.pagoEstado === 'recibido' ? 'recibido' : 'pendiente'}</strong>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          background: #f8f8f8;
          padding: 24px;
          text-align: center;
          border-top: 1px solid #eee;
        ">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Este es un email automático de Hello Comfy. No responder a este correo.
          </p>
        </div>
      </div>
    `;

    // Preparar adjuntos si hay comprobante de transferencia
    const attachments = [];
    if (order.paymentMethod === 'transfer' && order.paymentProof) {
      try {
        // Validar que paymentProof sea una string válida
        if (typeof order.paymentProof !== 'string') {
          console.warn("⚠️ paymentProof no es una string válida");
        } else {
          // Extraer el tipo de archivo del nombre o asumir jpg
          const fileName = order.paymentProofName || 'comprobante.jpg';
          const mimeType = order.paymentProofName?.includes('.pdf') ? 'application/pdf' : 'image/jpeg';
          
          // El paymentProof está en formato base64
          const buffer = Buffer.from(order.paymentProof, 'base64');
          attachments.push({
            filename: fileName,
            content: buffer,
            contentType: mimeType,
          });
        }
      } catch (attachError) {
        console.warn("⚠️ No se pudo adjuntar el comprobante:", attachError.message);
      }
    }

    const mailOptions = {
      from: '"Hello Comfy 🧸" <hellocomfyind@gmail.com>',
      to: "hellocomfyind@gmail.com",
      subject: `🎉 Nueva compra - Orden #${order.code} - ${order.customer?.name}`,
      html: emailHtml,
    };

    // Agregar attachments solo si hay
    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email al admin enviado para orden: ${order.code}`);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email al admin:", error.message);
    // No lanzamos el error para que no falle la creación de la orden
    return false;
  }
}
