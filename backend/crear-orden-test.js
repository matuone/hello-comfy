import mongoose from 'mongoose';
import Order from './models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

async function crearOrdenTest() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hellocomfy');
    console.log('✅ Conectado a MongoDB');

    // Generar código único para la orden
    const timestamp = Date.now();
    const codigo = `TEST-REGALO-${timestamp}`;

    // Crear orden de test
    const ordenTest = new Order({
      code: codigo,
      customer: {
        name: 'María González',
        email: 'maria.gonzalez@ejemplo.com'
      },
      items: [
        {
          productId: '507f1f77bcf86cd799439011',
          name: 'Sweater Comfy Rosa',
          quantity: 1,
          price: 8500,
          image: 'https://via.placeholder.com/300x300?text=Sweater+Regalo',
          color: 'Rosa',
          size: 'M'
        },
        {
          productId: '507f1f77bcf86cd799439012',
          name: 'Pijama Premium',
          quantity: 1,
          price: 6200,
          image: 'https://via.placeholder.com/300x300?text=Pijama',
          color: 'Lila',
          size: 'M'
        }
      ],
      totals: {
        subtotal: 14700,
        shipping: 0,
        discount: 0,
        total: 14700
      },
      status: 'recibido',
      pagoEstado: 'recibido',
      paymentMethod: 'mercadopago',
      envioEstado: 'pendiente',
      shipping: {
        method: 'pickup',
        pickPoint: 'aquelarre',
        eta: '2-3 días hábiles'
      },

      // ⭐ CAMPOS DE REGALO
      isGift: true,
      giftMessage: '¡Feliz cumpleaños prima! Espero que te encanten. Te quiero mucho. ❤️',

      date: new Date().toISOString(),

      // Campos de factura vacíos (para llenar al facturar)
      facturaNumero: null,
      facturaCae: null,
      facturaVencimientoCAE: null,
      facturaFecha: null,

      timeline: [
        {
          status: 'Orden de regalo creada',
          date: new Date().toLocaleString('es-AR')
        },
        {
          status: 'Pago recibido',
          date: new Date().toLocaleString('es-AR')
        }
      ]
    });

    // Guardar en la BD
    const ordenGuardada = await ordenTest.save();
    console.log('✅ Orden de regalo creada exitosamente');
    console.log(`📋 Código: ${ordenGuardada.code}`);
    console.log(`🆔 ID: ${ordenGuardada._id}`);
    console.log(`💰 Total: $${ordenGuardada.totals.total}`);
    console.log(`📧 Cliente: ${ordenGuardada.customer.name}`);
    console.log(`🎁 Es regalo: ${ordenGuardada.isGift ? 'SÍ' : 'NO'}`);
    console.log(`💌 Mensaje: "${ordenGuardada.giftMessage}"`);
    console.log('');
    console.log('Ahora podés:');
    console.log(`1. Ir a Admin > Ventas y ver el ícono 🎁 en la orden`);
    console.log('2. Hacer hover sobre el ícono para ver el mensaje');
    console.log('3. Abrir el detalle de la orden para ver la sección de regalo completa');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando orden de test:', error.message);
    process.exit(1);
  }
}

crearOrdenTest();
