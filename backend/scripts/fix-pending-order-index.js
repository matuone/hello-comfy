// Script temporal para eliminar el índice único no-sparse en checkoutId_1
// de la colección pendingorders. Solo ejecutar una vez.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Conectado a MongoDB');

try {
  const result = await mongoose.connection.collection('pendingorders').dropIndex('checkoutId_1');
  console.log('✅ Índice checkoutId_1 eliminado:', result);
} catch (e) {
  if (e.codeName === 'IndexNotFound') {
    console.log('ℹ️ El índice checkoutId_1 no existe (ya fue eliminado o nunca se creó)');
  } else {
    console.error('❌ Error al eliminar índice:', e.message);
  }
}

// Verificar índices actuales
const indexes = await mongoose.connection.collection('pendingorders').indexes();
console.log('\n📋 Índices actuales en pendingorders:');
indexes.forEach(idx => console.log(' -', idx.name, JSON.stringify(idx.key), idx.unique ? '[UNIQUE]' : '', idx.sparse ? '[SPARSE]' : ''));

await mongoose.disconnect();
console.log('\n✅ Listo.');
