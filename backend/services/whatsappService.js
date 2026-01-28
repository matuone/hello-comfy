// backend/services/whatsappService.js
// Servicio para enviar mensajes de WhatsApp usando Twilio
import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // ej: 'whatsapp:+14155238886'

const client = twilio(accountSid, authToken);

export async function sendWhatsapp(to, message) {
  if (!to || !message) throw new Error('Número y mensaje requeridos');
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  return client.messages.create({
    from: whatsappFrom,
    to: toFormatted,
    body: message,
  });
}
