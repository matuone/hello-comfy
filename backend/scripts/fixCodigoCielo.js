// Actualiza el código de la orden de Cielo de REC-xxx a un número secuencial correcto
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;

// Encontrar el máximo código numérico
const orders = await db.collection('orders').find({}, { projection: { code: 1, _id: 1 } }).toArray();
const numericCodes = orders.map(o => parseInt(o.code, 10)).filter(n => !isNaN(n));
const maxCode = Math.max(...numericCodes);
const nextCode = String(maxCode + 1);

console.log('Max numeric code:', maxCode);
console.log('Next code:', nextCode);

// Verificar que no exista ya ese código
const exists = await db.collection('orders').findOne({ code: nextCode });
if (exists) {
  console.error('❌ El código', nextCode, 'ya existe. Abortando.');
  await mongoose.disconnect();
  process.exit(1);
}

// Actualizar la orden de Cielo (la que tiene código REC-...)
const result = await db.collection('orders').updateOne(
  { paymentId: "149031670638" },
  { $set: { code: nextCode } }
);

console.log('Resultado update:', result);

if (result.modifiedCount === 1) {
  console.log(`✅ Código de orden actualizado: #${nextCode}`);
} else {
  console.warn('⚠️ No se modificó ningún documento. Verificar.');
}

// Imprimir la orden actualizada
const updated = await db.collection('orders').findOne({ paymentId: "149031670638" });
console.log('\nOrden actualizada:');
console.log('  code:', updated.code);
console.log('  customer:', updated.customer?.name, updated.customer?.email);
console.log('  total:', updated.totals?.total);

await mongoose.disconnect();
