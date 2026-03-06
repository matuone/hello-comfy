import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function fixImageURLs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // Buscar todos los productos con URLs localhost
    const products = await Product.find({
      images: { $regex: 'localhost' }
    });

    console.log(`\nEncontrados ${products.length} productos con URLs localhost`);

    let updated = 0;
    for (const product of products) {
      const oldImages = [...product.images];
      const newImages = product.images.map(url =>
        url.replace('http://localhost:5000', 'https://hellocomfy.com.ar')
      );

      if (JSON.stringify(oldImages) !== JSON.stringify(newImages)) {
        product.images = newImages;
        await product.save();
        updated++;
        console.log(`✓ Producto actualizado: ${product.name}`);
        console.log(`  Antes: ${oldImages[0]}`);
        console.log(`  Ahora: ${newImages[0]}`);
      }
    }

    console.log(`\n✅ Actualización completada: ${updated} productos corregidos`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixImageURLs();
