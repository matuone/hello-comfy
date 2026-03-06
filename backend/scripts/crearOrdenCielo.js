/**
 * crearOrdenCielo.js
 * Crea manualmente la orden de Cielo Sanessi (cielosanessi3@gmail.com)
 * cuyo pago MP 149031670638 fue procesado pero la orden nunca se creó
 * por el bug de checkoutId nulo en PendingOrder.
 *
 * Pago: $325,335 total. $9,335 fue reembolsado (costo de envío).
 * Neto pagado: $316,000. 12 remeras $39,500 c/u con 3x2 (4 gratis).
 *
 * EJECUTAR SOLO UNA VEZ:
 *   node backend/scripts/crearOrdenCielo.js
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI no configurado en .env");
  process.exit(1);
}

// Schemas mínimos para crear la orden
const orderSchema = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model("Order", orderSchema, "orders");
const Product = mongoose.model("Product", productSchema, "products");

// ─────────────────────────────────────────────────────────────────
// DATOS DEL PAGO Y CLIENTE
// ─────────────────────────────────────────────────────────────────
const PAYMENT_ID = "149031670638";
const EXTERNAL_REFERENCE = "order_1772751231914";
const CUSTOMER_NAME = "Cielo Andrea Sanessi";
const CUSTOMER_EMAIL = "cielosanessi3@gmail.com"; // Email cta. MercadoPago
const CUSTOMER_PHONE = "+54 9 34 2578 1310";
const POSTAL_CODE = "3000";
const SHIPPING_METHOD = "correo-home";
// El envío ($9,335) ya fue reembolsado por el admin → se registra $0
const SHIPPING_COST = 0;

// Nombres de productos tal como figuran en la BD (sin "Remera " al inicio)
const PRODUCT_NAMES = [
  { name: "TALK TO THE BIRDS", color: null, size: "XXL" },
  { name: "PEANUTS ATLH. CLUB", color: "Azul", size: "XXL" },
  { name: "BUNNY CAT HAT CLUB", color: null, size: "XXL" },
  { name: "CUTE BUT OVERTHINKER", color: null, size: "XXL" },
  { name: "WHICH WAY", color: null, size: "XXL" },
  { name: "LOOK MOM, NO FRIENDS", color: null, size: "XXL" },
  { name: "ROBBER", color: null, size: "XXL" },
  { name: "PARDON MY FRENCH", color: null, size: "XXL" },
  { name: "WEASLEY'S VINTAGE CAR X HARRY POTTER", color: null, size: "XXL" },
  { name: "HAPPINESS IS A VINTAGE T-SHIRT", color: null, size: "XXL" },
  { name: "STOP MAKING DRAMA", color: null, size: "XXL" },
  { name: "PEANUTS SPORTSWEAR", color: "Verde", size: "XXL" },
];

const UNIT_PRICE = 39500; // precio original por remera

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Conectado a MongoDB\n");

  // ── 1. Verificar que la orden no exista ya ───────────────────────
  const existing = await Order.findOne({
    $or: [
      { paymentId: PAYMENT_ID },
      { externalReference: EXTERNAL_REFERENCE },
    ],
  });
  if (existing) {
    console.log(`⚠️  La orden ya existe: código #${existing.code}. Abortando.`);
    await mongoose.disconnect();
    return;
  }

  // ── 2. Buscar productos en la BD ────────────────────────────────
  const resolvedItems = [];
  let anyNotFound = false;

  for (const entry of PRODUCT_NAMES) {
    // Buscar por nombre (regex insensitive, también con o sin "Remera" al inicio)
    const regex = new RegExp(entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const product = await Product.findOne({ name: regex });

    if (!product) {
      console.warn(`  ⚠️  Producto NO ENCONTRADO en BD: "${entry.name}"`);
      anyNotFound = true;
      resolvedItems.push({
        productId: null,
        name: `Remera ${entry.name}`,
        color: entry.color,
        size: entry.size,
        quantity: 1,
        price: UNIT_PRICE,
        image: null,
        category: ["Indumentaria"],
        subcategory: ["Remeras"],
        _notResolved: true,
      });
    } else {
      console.log(`  ✅ Encontrado: "${product.name}" (id: ${product._id})`);
      resolvedItems.push({
        productId: product._id,
        name: product.name,
        color: entry.color ?? (product.color?.[0] ?? null),
        size: entry.size,
        quantity: 1,
        price: UNIT_PRICE,
        image: product.images?.[0] ?? product.image ?? null,
        category: product.category,
        subcategory: product.subcategory,
      });
    }
  }

  if (anyNotFound) {
    console.log("\n⚠️  Algunos productos no se encontraron. Continuando con datos parciales...\n");
  }

  // ── 3. Calcular totales ─────────────────────────────────────────
  // 3x2 promo: 12 productos → 4 gratis → 8 pagan $39,500 c/u = $316,000
  const itemsSubtotal = UNIT_PRICE * 12; // $474,000
  const promo3x2Discount = UNIT_PRICE * 4; // $158,000 (4 gratis)
  const itemsTotal = itemsSubtotal - promo3x2Discount; // $316,000
  const grandTotal = itemsTotal + SHIPPING_COST; // $316,000

  // ── 4. Obtener el próximo código de orden ────────────────────────
  let nextCode;
  let attempts = 0;
  while (attempts < 10) {
    const lastOrder = await Order.findOne(
      {},
      { code: 1 }
    ).sort({ code: -1 }).lean();

    const candidate = (() => {
      if (!lastOrder?.code) return "01";
      const n = parseInt(lastOrder.code, 10);
      return isNaN(n) ? `REC-${Date.now()}` : String(n + 1).padStart(2, "0");
    })();

    const exists = await Order.findOne({ code: candidate });
    if (!exists) { nextCode = candidate; break; }
    attempts++;
    await new Promise(r => setTimeout(r, 100));
  }
  if (!nextCode) nextCode = `REC-CIE-${Date.now()}`;

  console.log(`\n📦 Código de orden asignado: #${nextCode}`);

  // ── 5. Crear la orden ────────────────────────────────────────────
  const now = new Date();
  const dateStr = now.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });

  const orderData = {
    code: nextCode,
    paymentId: PAYMENT_ID,
    externalReference: EXTERNAL_REFERENCE,
    paymentMethod: "mercadopago",
    pagoEstado: "recibido",
    status: "recibido",
    envioEstado: "pendiente",
    customer: {
      name: CUSTOMER_NAME,
      email: CUSTOMER_EMAIL,
      phone: CUSTOMER_PHONE,
      address: null, // no disponible — preguntar al cliente
      city: null,
      province: null,
      postalCode: POSTAL_CODE,
    },
    shipping: {
      method: SHIPPING_METHOD,
      address: null,
      postalCode: POSTAL_CODE,
      cost: SHIPPING_COST,
    },
    items: resolvedItems,
    totals: {
      subtotal: itemsSubtotal,
      promo3x2Discount: promo3x2Discount,
      promoDiscount: 0,
      discount: promo3x2Discount,
      itemsTotal: itemsTotal,
      shipping: SHIPPING_COST,
      total: grandTotal,
    },
    date: dateStr,
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        status: "Pago aprobado - Mercado Pago",
        date: new Date("2026-03-05T22:54:22.000Z").toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }),
      },
      {
        status: "Orden recuperada manualmente (bug checkoutId PendingOrder)",
        date: dateStr,
      },
    ],
    _recoveredAt: now,
    _recoveredNote: `Orden creada por crearOrdenCielo.js. 
Envío $9,335 ya reembolsado por admin (parcial refund MP ${PAYMENT_ID}).
Dirección no disponible — contactar cliente: ${CUSTOMER_PHONE}.
Email en checkout original desconocido; usando email MP: ${CUSTOMER_EMAIL}.`,
  };

  const order = new Order(orderData);
  await order.save();

  console.log(`\n✅ ORDEN CREADA EXITOSAMENTE:`);
  console.log(`   Código:    #${order.code}`);
  console.log(`   Cliente:   ${CUSTOMER_NAME}`);
  console.log(`   Email:     ${CUSTOMER_EMAIL}`);
  console.log(`   Teléfono:  ${CUSTOMER_PHONE}`);
  console.log(`   Total:     $${grandTotal.toLocaleString("es-AR")}`);
  console.log(`   Productos: ${resolvedItems.length} remeras talle XXL`);
  console.log(`   Envío:     $0 (reembolsado)`);
  console.log(`\n📧 RECORDATORIO:`);
  console.log(`   - Enviar email de confirmación manualmente`);
  console.log(`   - Dirección de envío: PREGUNTAR por WhatsApp ${CUSTOMER_PHONE}`);
  console.log(`   - El envío ya fue reembolsado ($9,335) el 05/03/2026`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
