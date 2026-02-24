/**
 * Enviar email de notificación de retiro en punto de Pick Up
 * @param {Object} order - Objeto de orden
 * @param {String} fechaRetiro - Fecha/hora para retirar
 */
export async function enviarEmailRetiroPickup(order, fechaRetiro) {
  try {
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️ GMAIL_APP_PASSWORD no configurado, no se enviará email de retiro");
      return false;
    }
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hellocomfyind@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let emailHtml;
    const pickPoint = (order.shipping?.pickPoint || '').toLowerCase();
    if (pickPoint.includes('aquelarre')) {
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="padding: 32px 24px; text-align: left;">
            <p style="color: #333; font-size: 17px; margin: 0 0 18px 0;">¡Buenas! Te escribo desde <b>HELLO COMFY!</b> para avisarte que podes pasar a retirar tu compra <b>#${order.code}</b> a partir del día <b>${fechaRetiro}</b> por <b><a href="https://www.google.com/maps?q=Lavalle+2086,+C1051+Cdad.+Aut%C3%B3noma+de+Buenos+Aires" target="_blank" style="color: #d94f7a; text-decoration: underline;">AQUELARRE SHOWROOM - LAVALLE 2086 (Portón rosa), CABA</a></b></p>
            <p style="color: #d94f7a; font-size: 16px; margin: 0 0 12px 0; font-weight: bold;">Los horarios de atención del showroom son: LUN. A DOM. de 10 a 19hs, sin cita previa</p>
            <p style="color: #444; font-size: 15px; margin: 0 0 12px 0;">⚠️ Para el retiro es necesario que indiques número de pedido, nombre de quien realizó la compra emprendimiento al que corresponde la misma</p>
            <p style="color: #e76f93; font-size: 15px; margin: 0 0 12px 0; font-weight: bold;">‼️ Los pedidos permanecen en el showroom por un plazo de 30 días, luego vuelven a nuestro taller, SIN EXCEPCIÓN</p>
            <p style="color: #888; font-size: 14px; margin: 0 0 12px 0;">Saludos,<br>HELLO COMFY! 🐻</p>
          </div>
        </div>
      `;
    } else {
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
          </tr>
        `
        )
        .join("");
      emailHtml = `
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
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="color: #333; font-size: 16px; margin: 0 0 16px 0;">
              Hola <strong>${order.customer?.name || "Cliente"}</strong>,<br>
              ¡Tu pedido ya está listo para retirar en nuestro punto de Pick Up!
            </p>
            <div style="background: #f8f8f8; border: 2px solid #d94f7a; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Podés pasar a retirarlo a partir de:</p>
              <p style="margin: 0; color: #d94f7a; font-size: 24px; font-weight: 800;">${fechaRetiro}</p>
              <p style="margin: 8px 0 0 0; color: #555; font-size: 15px;">Punto de retiro: <strong>${order.shipping?.pickPoint || "(consultar dirección)"}</strong></p>
            </div>
            <h2 style="color: #333; font-size: 20px; margin: 0 0 16px 0;">Productos</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
              ${productosHtml}
            </table>
            <p style="color: #888; font-size: 14px; margin: 0;">
              <strong>Email:</strong> ${order.customer?.email}<br>
              <strong>Nombre:</strong> ${order.customer?.name}
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8f8f8; padding: 24px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0 0 8px 0;">¿Necesitás ayuda?</p>
            <p style="color: #d94f7a; font-size: 14px; margin: 0; font-weight: 600;">Contactanos: hellocomfyind@gmail.com</p>
          </div>
        </div>
      `;
    }

    await transporter.sendMail({
      from: 'Hello Comfy 🧸 <hellocomfyind@gmail.com>',
      to: order.customer?.email,
      subject: `🛍️ ¡Tu pedido está listo para retirar! - Orden #${order.code}`,
      html: emailHtml,
    });
    return true;
  } catch (error) {
    console.error("❌ Error enviando email de retiro pickup:", error.message);
    return false;
  }
}
// Enviar email simple (para recuperación de contraseña, etc)
export default async function sendEmail({ to, subject, html }) {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn("⚠️ GMAIL_APP_PASSWORD no configurado, no se enviará email");
    return false;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "hellocomfyind@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: 'Hello Comfy 🧸 <hellocomfyind@gmail.com>',
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
  return true;
}
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

    // console.log("📧 Intentando enviar email a:", order.customer?.email);
    // console.log("📧 Código de orden:", order.code);

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
    const shippingMethodLabels = {
      "home": "Envío a domicilio",
      "correo-home": "Envío a domicilio (Correo Argentino)",
      "correo-branch": "Envío a sucursal (Correo Argentino)",
      "pickup": "Retiro en Pick Up Point",
    };
    const shippingLabel = shippingMethodLabels[order.shipping?.method] || "Envío";
    let shippingInfo;
    if (order.shipping?.method === "pickup") {
      shippingInfo = `<strong>${shippingLabel}</strong><br>${order.shipping?.pickPoint || ""}`;
    } else {
      const parts = [];
      if (order.shipping?.address) parts.push(`<strong>Dirección:</strong> ${order.shipping.address}`);
      if (order.shipping?.localidad) parts.push(`<strong>Localidad:</strong> ${order.shipping.localidad}`);
      if (order.shipping?.province) parts.push(`<strong>Provincia:</strong> ${order.shipping.province}`);
      if (order.shipping?.postalCode) parts.push(`<strong>Código postal:</strong> ${order.shipping.postalCode}`);
      shippingInfo = `<strong>${shippingLabel}</strong><br>${parts.join("<br>") || "Sin datos de dirección"}`;
    }

    // Mapeo de métodos de pago
    const paymentMethodLabels = {
      mercadopago: "Mercado Pago",
      gocuotas: "GoCuotas",
      modo: "Modo",
      transfer: "Transferencia Bancaria",
      cuentadni: "Cuenta DNI",
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
              ${order.shipping?.method === "pickup"
        ? "Te avisaremos por email y WhatsApp cuando tu pedido esté listo para retirar."
        : "Te notificaremos cuando tu pedido salga en camino."
      }
            </p>
            <p style="margin: 0; color: #555; line-height: 1.6;">
              Podés hacer seguimiento de tu pedido en nuestra web.
            </p>
          </div>

          <!-- Aviso para transferencia sin comprobante -->
          ${order.paymentMethod === 'transfer' && !order.paymentProof
        ? `
          <div style="
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 24px;
          ">
            <h3 style="margin: 0 0 8px 0; color: #856404; font-size: 16px;">⚠️ Comprobante de Transferencia</h3>
            <p style="margin: 0; color: #856404; line-height: 1.6;">
              No recibimos adjunto el comprobante de transferencia. 
              <strong>Por favor, envialo por WhatsApp</strong> para acelerar la verificación de tu pago.
            </p>
          </div>
              `
        : order.paymentMethod === 'cuentadni' && !order.paymentProof
          ? `
          <div style="
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 16px;
            border-radius: 4px;
            margin-bottom: 24px;
          ">
            <h3 style="margin: 0 0 8px 0; color: #856404; font-size: 16px;">⚠️ Comprobante de Cuenta DNI</h3>
            <p style="margin: 0; color: #856404; line-height: 1.6;">
              No recibimos adjunto el comprobante de Cuenta DNI. 
              <strong>Por favor, envialo por WhatsApp</strong> para acelerar la verificación de tu pago.
            </p>
          </div>
              `
          : ''
      }

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

    // console.log(`✅ Email de confirmación enviado a: ${order.customer?.email}`);
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
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong>
            ${item.size ? `<br><small style="color: #666;">Talle: ${item.size}</small>` : ''}
            ${item.color ? `<br><small style="color: #666;">Color: ${item.color}</small>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString("es-AR")}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toLocaleString("es-AR")}</td>
        </tr>
      `
      )
      .join("");

    const adminShippingMethodLabels = {
      "home": "Envío a domicilio",
      "correo-home": "Envío a domicilio (Correo Argentino)",
      "correo-branch": "Envío a sucursal (Correo Argentino)",
      "pickup": "Retiro en Pick Up Point",
    };
    const adminShippingLabel = adminShippingMethodLabels[order.shipping?.method] || "Envío";
    let shippingInfo;
    if (order.shipping?.method === "pickup") {
      shippingInfo = `<strong>Método:</strong> ${adminShippingLabel}<br><strong>Punto de retiro:</strong> ${order.shipping?.pickPoint || ""}`;
    } else {
      const parts = [`<strong>Método:</strong> ${adminShippingLabel}`];
      if (order.shipping?.address) parts.push(`<strong>Dirección:</strong> ${order.shipping.address}`);
      if (order.shipping?.localidad) parts.push(`<strong>Localidad:</strong> ${order.shipping.localidad}`);
      if (order.shipping?.province) parts.push(`<strong>Provincia:</strong> ${order.shipping.province}`);
      if (order.shipping?.postalCode) parts.push(`<strong>Código postal:</strong> ${order.shipping.postalCode}`);
      shippingInfo = parts.join("<br>") || "Sin datos de dirección";
    }

    const paymentMethodLabels = {
      mercadopago: "Mercado Pago",
      gocuotas: "GoCuotas",
      modo: "Modo",
      transfer: "Transferencia Bancaria",
      cuentadni: "Cuenta DNI",
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
            <p style="margin: 0 0 8px 0; color: #555;"><strong>DNI:</strong> ${order.customer?.dni || 'Sin información'}</p>
            <p style="margin: 0; color: #555;"><strong>Teléfono:</strong> ${order.customer?.phone || 'Sin información'}</p>
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
          ${(order.paymentMethod === 'transfer' || order.paymentMethod === 'cuentadni') && order.paymentProof ? `
          <h2 style="color: #333; font-size: 18px; margin: 0 0 12px 0;">Comprobante de ${order.paymentMethod === 'transfer' ? 'Transferencia' : 'Cuenta DNI'}</h2>
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

    // Preparar adjuntos si hay comprobante de transferencia o Cuenta DNI
    const attachments = [];
    if ((order.paymentMethod === 'transfer' || order.paymentMethod === 'cuentadni') && order.paymentProof) {
      try {
        // Validar que paymentProof sea una string válida
        if (typeof order.paymentProof !== 'string') {
          console.warn("⚠️ paymentProof no es una string válida");
        } else {
          // Limpiar base64: remover data URI prefix y espacios/saltos de línea
          let cleanBase64 = order.paymentProof.trim();

          // Si tiene el prefijo de data URI, extraerlo
          if (cleanBase64.includes(',')) {
            cleanBase64 = cleanBase64.split(',')[1];
          }

          // Remover caracteres whitespace
          cleanBase64 = cleanBase64.replace(/\s/g, '');

          // Extraer el tipo de archivo del nombre o asumir jpg
          const fileName = order.paymentProofName || 'comprobante.jpg';
          const mimeType = order.paymentProofName?.includes('.pdf') ? 'application/pdf' : 'image/jpeg';

          // Validar que sea base64 válido (opcional pero ayuda a debugging)
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
            console.warn("⚠️ Base64 inválido para comprobante");
          } else {
            // El paymentProof está en formato base64, convertir a buffer
            const buffer = Buffer.from(cleanBase64, 'base64');
            attachments.push({
              filename: fileName,
              content: buffer,
              contentType: mimeType,
            });
            // console.log("✅ Comprobante adjuntado:", fileName, "(" + buffer.length + " bytes)");
          }
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

    // console.log(`✅ Email al admin enviado para orden: ${order.code}`);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email al admin:", error.message);
    // No lanzamos el error para que no falle la creación de la orden
    return false;
  }
}

/**
 * Enviar factura por email al cliente
 * @param {Object} order - Objeto de orden con factura
 * @param {Buffer} pdfBuffer - Buffer del PDF de la factura
 */
export async function enviarFacturaEmail(order, pdfBuffer) {
  try {
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️ GMAIL_APP_PASSWORD no configurado, no se enviará email");
      return false;
    }

    if (!order.customer?.email) {
      console.warn("⚠️ Email del cliente no disponible");
      return false;
    }

    // console.log("📧 Intentando enviar factura a:", order.customer?.email);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hellocomfyind@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

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
          ">Tu Factura</h1>
          <p style="
            color: rgba(255,255,255,0.95);
            margin: 8px 0 0 0;
            font-size: 16px;
          ">Adjuntamos tu factura</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 16px 0;">
            Hola <strong>${order.customer?.name || "Cliente"}</strong>,
          </p>

          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Adjuntamos tu factura para la orden #${order.code}. Si tienes alguna pregunta, no dudes en contactarnos.
          </p>

          <!-- Footer -->
          <div style="
            text-align: center;
            padding-top: 24px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 12px;
          ">
            <p style="margin: 0;">Hello Comfy 🧸</p>
            <p style="margin: 8px 0 0 0;">© 2024 Hello Comfy. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"Hello Comfy 🧸" <hellocomfyind@gmail.com>',
      to: order.customer.email,
      subject: `Factura - Orden #${order.code}`,
      html: emailHtml,
      attachments: [
        {
          filename: `Factura-${order.facturaNumero}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // console.log(`✅ Factura enviada a: ${order.customer.email}`);
    return true;
  } catch (error) {
    console.error("❌ Error enviando factura:", error.message);
    return false;
  }
}

/**
 * Enviar email de verificación de cuenta
 * @param {String} email - Email del usuario
 * @param {String} name - Nombre del usuario
 * @param {String} token - Token de verificación
 */
export async function enviarEmailVerificacion(email, name, token) {
  try {
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.warn("⚠️ GMAIL_APP_PASSWORD no configurado, no se enviará email de verificación");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hellocomfyind@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #d94f7a 0%, #e8789a 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700;">Hello Comfy 🧸</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Verificá tu email para activar tu cuenta</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <p style="color: #333; font-size: 16px; margin: 0 0 8px 0;">¡Hola <strong>${name}</strong>!</p>
          <p style="color: #555; font-size: 15px; margin: 0 0 24px 0;">Gracias por registrarte. Hacé click en el botón para verificar tu email y activar tu cuenta.</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #d94f7a; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">Verificar mi email</a>
          <p style="color: #999; font-size: 12px; margin: 24px 0 0 0;">Este enlace expira en 24 horas.<br>Si no creaste esta cuenta, podés ignorar este email.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Hello Comfy" <hellocomfyind@gmail.com>',
      to: email,
      subject: "Verificá tu email — Hello Comfy 🧸",
      html,
    });

    return true;
  } catch (error) {
    console.error("❌ Error enviando email de verificación:", error.message);
    return false;
  }
}
