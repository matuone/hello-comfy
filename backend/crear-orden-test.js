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
    const codigo = `TEST-FACTURA-${timestamp}`;

    // Crear orden de test
    const ordenTest = new Order({
      code: codigo,
      customer: {
        name: 'Cliente Test Facturación',
        email: 'test-factura@ejemplo.com'
      },
      items: [
        {
          productId: '507f1f77bcf86cd799439011',
          name: 'Producto Test - Remera',
          quantity: 2,
          price: 500,
          image: 'https://via.placeholder.com/300x300?text=Test+Product',
          color: 'Blanco',
          size: 'M'
        },
        {
          productId: '507f1f77bcf86cd799439012',
          name: 'Producto Test - Pantalón',
          quantity: 1,
          price: 1200,
          image: 'https://via.placeholder.com/300x300?text=Test+Product',
          color: 'Negro',
          size: 'M'
        }
      ],
      totals: {
        subtotal: 2200,
        shipping: 200,
        discount: 0,
        total: 2400
      },
      status: 'recibido', // Estado válido
      pagoEstado: 'recibido',
      paymentMethod: 'mercadopago',
      envioEstado: 'pendiente',
      shipping: {
        method: 'home', // Campo requerido
        address: 'Calle Test 123, Buenos Aires'
      },
      date: new Date().toISOString(),

      // Campos de factura vacíos (para llenar al facturar)
      facturaNumero: null,
      facturaCae: null,
      facturaVencimientoCAE: null,
      facturaFecha: null,

      // Timeline
      timeline: [
        {
          status: 'Orden creada para test de facturación',
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
    console.log('✅ Orden de test creada exitosamente');
    console.log(`📋 Código: ${ordenGuardada.code}`);
    console.log(`🆔 ID: ${ordenGuardada._id}`);
    console.log(`💰 Total: $${ordenGuardada.totals.total}`);
    console.log(`📧 Cliente: ${ordenGuardada.customer.name}`);
    console.log('');
    console.log('Ahora podes:');
    console.log(`1. Ir a Admin > Ventas y buscar la orden "${codigo}"`);
    console.log('2. Click en la orden para abrir detalles');
    console.log('3. Click en botón naranja "Generar factura"');
    console.log('4. Elegir Factura C (consumidor final)');
    console.log('');
    console.log('O testear con Bruno:');
    console.log(`POST http://localhost:5000/api/afip/generar-factura/${ordenGuardada._id}`);
    console.log('Body: { "tipoFactura": "C" }');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando orden de test:', error.message);
    process.exit(1);
  }
}

crearOrdenTest();
