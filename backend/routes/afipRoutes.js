// backend/routes/afipRoutes.js
import express from 'express';
const router = express.Router();
import {
  generarFacturaC,
  generarFacturaA,
  verificarEstadoServicio,
  consultarContribuyente,
  obtenerPuntosVenta,
  probarPuntosVenta
} from '../services/afipService.js';
import { generarFacturaPDF } from '../services/pdfService.js';
import { enviarFacturaEmail } from '../services/emailService.js';
import Order from '../models/Order.js';
import { verifyAdmin } from '../middleware/adminMiddleware.js';

/**
 * GET /api/afip/puntos-venta
 * Obtener lista de puntos de venta habilitados
 */
router.get('/afip/puntos-venta', verifyAdmin, async (req, res) => {
  try {
    const ptos = await obtenerPuntosVenta();
    res.json({
      success: true,
      puntosVenta: ptos,
      message: 'Puntos de venta obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo puntos de venta:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error al obtener puntos de venta'
    });
  }
});

/**
 * GET /api/afip/puntos-venta/test
 * Probar todos los puntos de venta habilitados haciendo getLastVoucher
 */
router.get('/afip/puntos-venta/test', verifyAdmin, async (req, res) => {
  try {
    const resultados = await probarPuntosVenta();
    res.json({ success: true, resultados });
  } catch (error) {
    console.error('Error probando puntos de venta:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error al probar puntos de venta'
    });
  }
});

/**
 * GET /api/afip/status
 * Verificar estado del servicio de AFIP
 */
router.get('/afip/status', verifyAdmin, async (req, res) => {
  try {
    const status = await verificarEstadoServicio();
    res.json({
      success: true,
      status,
      message: 'Servicio AFIP operativo'
    });
  } catch (error) {
    console.error('Error verificando AFIP:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error al conectar con AFIP'
    });
  }
});

/**
 * POST /api/afip/generar-factura/:orderId
 * Generar factura para una orden específica
 */
router.post('/afip/generar-factura/:orderId', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tipoFactura, cuitCliente } = req.body; // 'A' o 'B'

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Verificar si ya tiene factura
    if (order.facturaNumero) {
      return res.status(400).json({
        error: 'Esta orden ya tiene factura generada',
        facturaNumero: order.facturaNumero
      });
    }

    let factura;

    // Generar factura según tipo
    if (tipoFactura === 'A') {
      if (!cuitCliente) {
        return res.status(400).json({ error: 'CUIT del cliente requerido para Factura A' });
      }
      factura = await generarFacturaA(order, cuitCliente);
    } else {
      factura = await generarFacturaC(order);
    }

    // Actualizar orden con datos de factura
    order.facturaNumero = `${factura.tipo}-${String(factura.puntoVenta).padStart(4, '0')}-${String(factura.numero).padStart(8, '0')}`;
    order.facturaCae = factura.cae;
    order.facturaVencimientoCAE = factura.vencimientoCAE;
    order.facturaFecha = factura.fecha;

    await order.save();

    // console.log(`✅ Factura ${order.facturaNumero} generada para orden ${order.code}`);

    res.json({
      success: true,
      factura: {
        numero: order.facturaNumero,
        cae: factura.cae,
        vencimientoCae: factura.vencimientoCAE,
        fecha: factura.fecha,
        total: factura.total,
      },
      order: {
        code: order.code,
        customer: order.customer,
      }
    });

  } catch (error) {
    console.error('Error generando factura:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error al generar factura en AFIP'
    });
  }
});

/**
 * GET /api/afip/consultar-contribuyente/:cuit
 * Consultar datos de un contribuyente por CUIT
 */
router.get('/afip/consultar-contribuyente/:cuit', verifyAdmin, async (req, res) => {
  try {
    const { cuit } = req.params;
    const taxpayer = await consultarContribuyente(parseInt(cuit));

    res.json({
      success: true,
      contribuyente: taxpayer
    });
  } catch (error) {
    console.error('Error consultando contribuyente:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/afip/test-factura
 * Generar factura de prueba (solo para testing)
 */
router.post('/afip/test-factura', verifyAdmin, async (req, res) => {
  try {
    const orderDataTest = {
      code: 'TEST-001',
      totals: {
        total: 1000
      },
      customer: {
        name: 'Cliente de Prueba',
        email: 'test@ejemplo.com'
      }
    };

    const factura = await generarFacturaC(orderDataTest);

    res.json({
      success: true,
      message: 'Factura de prueba generada exitosamente',
      factura
    });
  } catch (error) {
    console.error('Error en factura de prueba:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error generando factura de prueba'
    });
  }
});

/**
 * GET /api/afip/factura-pdf/:orderId
 * Descargar PDF de la factura de una orden
 */
router.get('/afip/factura-pdf/:orderId', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada' });
    }

    if (!order.facturaNumero) {
      return res.status(400).json({ success: false, error: 'La orden no tiene factura generada' });
    }

    const pdfBuffer = await generarFacturaPDF(order);

    const filename = `Factura-${order.facturaNumero}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al generar PDF' });
  }
});

/**
 * POST /api/afip/reenviar-factura/:orderId
 * Reenviar factura por email al cliente
 */
router.post('/afip/reenviar-factura/:orderId', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada' });
    }

    if (!order.facturaNumero) {
      return res.status(400).json({ success: false, error: 'La orden no tiene factura generada' });
    }

    if (!order.customer?.email) {
      return res.status(400).json({ success: false, error: 'El cliente no tiene email registrado' });
    }

    // Generar PDF de la factura
    const pdfBuffer = await generarFacturaPDF(order);

    // Enviar email con la factura
    const emailEnviado = await enviarFacturaEmail(order, pdfBuffer);

    if (!emailEnviado) {
      return res.status(500).json({ success: false, error: 'Error al enviar el email' });
    }

    res.json({ success: true, message: 'Factura reenviada exitosamente' });
  } catch (error) {
    console.error('Error reenviando factura:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al reenviar factura' });
  }
});

export default router;
