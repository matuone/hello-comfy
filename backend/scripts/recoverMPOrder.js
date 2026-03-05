/**
 * recoverMPOrder.js
 * Script de recuperación de órdenes de Mercado Pago que fueron cobradas
 * pero no se crearon en la base de datos.
 *
 * Uso:
 *   node backend/scripts/recoverMPOrder.js
 *
 * Busca los últimos pagos aprobados en MP de las últimas 2 horas
 * y muestra cuáles no tienen orden en MongoDB.
 *
 * Para recuperar un pago específico por ID:
 *   PAYMENT_ID=123456789 node backend/scripts/recoverMPOrder.js
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import axios from "axios";

// Cargar .env desde backend/ sin importar desde dónde se ejecute el script
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

// Cargar modelos directamente
const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model("Order", orderSchema, "orders");

const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MP_TOKEN) {
  console.error("❌ MERCADOPAGO_ACCESS_TOKEN no configurado en .env");
  process.exit(1);
}
if (!MONGO_URI) {
  console.error("❌ MONGODB_URI no configurado en .env");
  process.exit(1);
}

async function fetchPayment(paymentId) {
  const res = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` },
  });
  return res.data;
}

async function searchRecentPayments(email = null, hoursBack = 2) {
  const from = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
  const params = {
    status: "approved",
    begin_date: from,
    limit: 20,
    sort: "date_created",
    criteria: "desc",
  };
  if (email) params["payer.email"] = email;

  const res = await axios.get("https://api.mercadopago.com/v1/payments/search", {
    headers: { Authorization: `Bearer ${MP_TOKEN}` },
    params,
  });
  return res.data.results || [];
}

async function findOrCreateOrder(payment) {
  // Buscar si ya existe la orden por paymentId
  const existing = await Order.findOne({ paymentId: payment.id.toString() });
  if (existing) {
    console.log(`  ✅ Ya existe orden ${existing.code} para payment ${payment.id}`);
    return { found: true, order: existing };
  }

  // Buscar por external_reference (puede haberse grabado antes)
  const byRef = await Order.findOne({ code: payment.external_reference });
  if (byRef) {
    console.log(`  ✅ Ya existe orden ${byRef.code} por external_reference para payment ${payment.id}`);
    return { found: true, order: byRef };
  }

  console.log(`  ⚠️  SIN ORDEN para payment ${payment.id} (${payment.payer?.email}, $${payment.transaction_amount})`);
  return { found: false, payment };
}

async function createMinimalOrder(payment) {
  // Obtener el último código de orden
  const lastOrder = await Order.findOne({}, { code: 1 }).sort({ createdAt: -1 });
  let nextCode = "01";
  if (lastOrder?.code) {
    const n = parseInt(lastOrder.code, 10);
    nextCode = isNaN(n) ? `REC-${Date.now()}` : String(n + 1).padStart(2, "0");
  }

  const orderData = {
    code: nextCode,
    paymentId: payment.id.toString(),
    customer: {
      email: payment.payer?.email || "desconocido@email.com",
      name: payment.payer?.first_name
        ? `${payment.payer.first_name} ${payment.payer.last_name || ""}`.trim()
        : "Cliente",
      phone: null,
      dni: null,
    },
    status: "recibido",
    pagoEstado: "recibido",
    paymentMethod: "mercadopago",
    envioEstado: "pendiente",
    shipping: {
      method: "desconocido",
      address: null,
      postalCode: null,
    },
    items: (payment.additional_info?.items || []).map((i) => ({
      name: i.title || "Producto",
      quantity: parseInt(i.quantity) || 1,
      price: parseFloat(i.unit_price) || 0,
    })),
    totals: {
      subtotal: payment.transaction_amount,
      shipping: 0,
      discount: 0,
      total: payment.transaction_amount,
    },
    date: new Date().toLocaleString("es-AR"),
    timeline: [
      {
        status: "Pago aprobado - Mercado Pago (recuperado)",
        date: new Date().toLocaleString("es-AR"),
      },
      {
        status: "Orden recuperada manualmente desde script",
        date: new Date().toLocaleString("es-AR"),
      },
    ],
    _recoveredAt: new Date(),
    _recoveredNote: "Orden creada por script de recuperación. Verificar ítems y envío con el cliente.",
  };

  const order = new Order(orderData);
  await order.save();
  console.log(`  ✅ Orden CREADA: ${order.code} para ${payment.payer?.email} ($${payment.transaction_amount})`);
  console.log(`  ⚠️  NOTA: Esta orden no tiene ítems ni envío detallados. Completar manualmente en el panel.`);
  return order;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Conectado a MongoDB\n");

  const specificPaymentId = process.env.PAYMENT_ID;

  if (specificPaymentId) {
    // Recuperar pago específico
    console.log(`🔍 Buscando pago ${specificPaymentId} en Mercado Pago...`);
    try {
      const payment = await fetchPayment(specificPaymentId);
      console.log(`  Pago: status=${payment.status}, email=${payment.payer?.email}, monto=$${payment.transaction_amount}`);

      if (payment.status !== "approved") {
        console.log(`  ❌ El pago no está aprobado (status: ${payment.status}). No se crea orden.`);
        process.exit(0);
      }

      const result = await findOrCreateOrder(payment);
      if (!result.found) {
        const order = await createMinimalOrder(payment);
        console.log(`\n✅ Orden recuperada exitosamente: ${order.code}`);
        console.log("⚠️  Revisá el panel de admin y completá los datos faltantes (ítems, envío, datos del cliente).");
      }
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);
    }
  } else {
    // Buscar pagos recientes de matiascastells@gmail.com en las últimas 2 horas
    const email = process.env.SEARCH_EMAIL || "matiascastells@gmail.com";
    const hours = parseInt(process.env.HOURS_BACK || "2");
    console.log(`🔍 Buscando pagos aprobados de "${email}" en las últimas ${hours} horas...\n`);

    try {
      const payments = await searchRecentPayments(email, hours);

      if (payments.length === 0) {
        console.log("⚠️  No se encontraron pagos aprobados recientes.");
        console.log("    Probá sin filtro de email: SEARCH_EMAIL='' node backend/scripts/recoverMPOrder.js");
        console.log("    O con el ID del pago: PAYMENT_ID=123456789 node backend/scripts/recoverMPOrder.js");
        process.exit(0);
      }

      console.log(`Encontrados ${payments.length} pago(s):\n`);

      const missing = [];
      for (const p of payments) {
        console.log(`📄 Payment ${p.id} | ${p.payer?.email} | $${p.transaction_amount} | ${p.date_created}`);
        const result = await findOrCreateOrder(p);
        if (!result.found) missing.push(p);
      }

      if (missing.length === 0) {
        console.log("\n✅ Todos los pagos ya tienen orden en la base de datos.");
        process.exit(0);
      }

      console.log(`\n⚠️  ${missing.length} pago(s) sin orden. Creando órdenes mínimas de recuperación...\n`);
      for (const p of missing) {
        await createMinimalOrder(p);
      }

      console.log("\n✅ Recuperación completada.");
      console.log("⚠️  Revisá el panel de admin y completá los datos faltantes en cada orden recuperada.");
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        // La API de búsqueda puede no soportar filtro por email directamente
        console.log("⚠️  La búsqueda con filtro de email falló. Probando sin filtro...\n");
        const payments = await searchRecentPayments(null, hours);
        for (const p of payments) {
          if (!email || p.payer?.email?.toLowerCase().includes(email.toLowerCase())) {
            console.log(`📄 Payment ${p.id} | ${p.payer?.email} | $${p.transaction_amount} | ${p.date_created}`);
            const result = await findOrCreateOrder(p);
            if (!result.found) await createMinimalOrder(p);
          }
        }
      } else {
        console.error("❌ Error:", err.response?.data || err.message);
      }
    }
  }

  await mongoose.disconnect();
  console.log("\n🔌 Desconectado de MongoDB");
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
