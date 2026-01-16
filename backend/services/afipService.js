// backend/services/afipService.js
import Afip from '@afipsdk/afip.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración de AFIP con certificado real
 */

// Leer contenido de certificados
const certPath = path.join(__dirname, '../config/afip-cert.crt');
const keyPath = path.join(__dirname, '../config/afip-key.key');

let certContent, keyContent;

try {
  certContent = fs.readFileSync(certPath, 'utf8');
  keyContent = fs.readFileSync(keyPath, 'utf8');
  console.log('✅ Certificados AFIP cargados correctamente');
} catch (err) {
  console.error('❌ Error cargando certificados:', err.message);
  console.error('Ruta esperada para cert:', certPath);
  console.error('Ruta esperada para key:', keyPath);
  throw err;
}

const afip = new Afip({
  CUIT: parseInt(process.env.AFIP_CUIT) || 27391049802,
  cert: certContent,
  key: keyContent,
  access_token: process.env.AFIP_ACCESS_TOKEN,
  production: true,  // ✅ IMPORTANTE: Tu certificado es de producción
});

/**
 * Obtener estado de los puntos de venta habilitados
 * Usa FEParamGetPtosVenta
 * @returns {Promise<Array>} Lista de puntos de venta habilitados
 */
export async function obtenerPuntosVenta() {
  try {
    console.log('📍 Obteniendo puntos de venta habilitados...');
    
    // Intentar obtener parámetros del servidor (incluye puntos de venta)
    try {
      const response = await afip.ElectronicBilling.request('FEParamGetTiposDoc', {});
      console.log('✅ Respuesta de parámetros:', response);
      
      // Intentar con FEParamGetPtosVenta
      const ptos = await afip.ElectronicBilling.request('FEParamGetPtosVenta', {});
      console.log('✅ Puntos de venta:', ptos);
      return ptos;
    } catch (error) {
      // Si falla, intentar método alternativo
      try {
        console.log('Intentando método alternativo: getParameters');
        const params = await afip.ElectronicBilling.getParameters();
        console.log('✅ Parámetros del servidor:', params);
        
        if (params && params.PuntosVenta) {
          return params.PuntosVenta;
        }
        return params;
      } catch (e) {
        console.warn('⚠️ No se pudo obtener puntos de venta reales');
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error obteniendo puntos de venta:', error.message);
    if (error.code) console.error('Código de error:', error.code);
    throw error;
  }
}

/**
 * Generar factura electrónica tipo C (monotributista)
 * @param {Object} orderData - Datos de la orden
 * @param {Number} puntoVenta - Punto de venta a usar (opcional)
 * @returns {Promise<Object>} Factura generada
 */
export async function generarFacturaB(orderData, puntoVenta = null) {
  try {
    console.log('📄 Iniciando generación de factura C para orden:', orderData.code);

    // Usar punto de venta configurado en .env o el especificado
    const ptoVta = puntoVenta || parseInt(process.env.AFIP_PUNTO_VENTA) || 4;

    console.log(`🔄 Usando punto de venta ${ptoVta}...`);

    // Obtener el último número de factura para este punto de venta
    const lastVoucher = await afip.ElectronicBilling.getLastVoucher(11, ptoVta); // 11 = Factura C (Monotributo)
    const nextVoucherNumber = lastVoucher + 1;

    console.log(`✅ Punto de venta ${ptoVta} está habilitado`);
    console.log('📝 Último comprobante:', lastVoucher);
    console.log('📝 Próximo número:', nextVoucherNumber);

    // Parsear el total - asegurar que es número
    const total = parseFloat(orderData.totals?.total || orderData.total || 1000);
    const fecha = new Date();
    const fechaFormato = parseInt(fecha.toISOString().slice(0, 10).replace(/-/g, ''));

    // Datos de la factura - estructura correcta para SDK
    const data = {
      'CantReg': 1,
      'PtoVta': ptoVta,
      'CbteTipo': 11, // Factura C (Monotributista)
      'Concepto': 1,
      'DocTipo': 99, // Consumidor Final
      'DocNro': 0,
      'CbteDesde': nextVoucherNumber,
      'CbteHasta': nextVoucherNumber,
      'CbteFch': fechaFormato,
      'ImpTotal': total,
      'ImpTotConc': 0,
      'ImpNeto': total,
      'ImpOpEx': 0,
      'ImpIVA': 0,
      'ImpTrib': 0,
      'MonId': 'PES',
      'MonCotiz': 1,
    };

    console.log('📋 Datos enviados a AFIP:', JSON.stringify(data, null, 2));

    // Generar la factura en AFIP
    const result = await afip.ElectronicBilling.createVoucher(data);

    console.log('✅ Factura generada exitosamente');
    console.log('📋 CAE:', result.CAE);
    console.log('📋 Vencimiento CAE:', result.CAEFchVto);
    console.log('📋 Número de factura:', nextVoucherNumber);

    return {
      numero: nextVoucherNumber,
      puntoVenta: ptoVta,
      tipo: 'B',
      cae: result.CAE,
      vencimientoCAE: result.CAEFchVto,
      fecha: new Date().toISOString(),
      total: total,
    };

  } catch (error) {
    console.error('❌ Error generando factura en AFIP:', error);
    throw new Error(`Error en AFIP: ${error.message}`);
  }
}

/**
 * Obtener información de contribuyente por CUIT
 * @param {Number} cuit - CUIT a consultar
 * @returns {Promise<Object>} Datos del contribuyente
 */
export async function consultarContribuyente(cuit) {
  try {
    const taxpayer = await afip.RegisterScopeFive.getTaxpayerDetails(cuit);
    return taxpayer;
  } catch (error) {
    console.error('❌ Error consultando contribuyente:', error);
    throw error;
  }
}

/**
 * Verificar estado del servicio de facturación electrónica
 * @returns {Promise<Object>} Estado del servicio
 */
export async function verificarEstadoServicio() {
  try {
    const status = await afip.ElectronicBilling.getServerStatus();
    console.log('🟢 Estado del servidor AFIP:', status);
    return status;
  } catch (error) {
    console.error('❌ Error verificando estado de AFIP:', error);
    throw error;
  }
}

/**
 * Generar factura tipo A (responsable inscripto)
 * @param {Object} orderData - Datos de la orden
 * @param {Number} cuitCliente - CUIT del cliente
 * @returns {Promise<Object>} Factura generada
 */
export async function generarFacturaA(orderData, cuitCliente) {
  try {
    console.log('📄 Iniciando generación de factura A para orden:', orderData.code);

    const lastVoucher = await afip.ElectronicBilling.getLastVoucher(1, 1); // 1 = Factura A
    const nextVoucherNumber = lastVoucher + 1;

    // Calcular IVA (21%)
    const neto = orderData.totals.total / 1.21;
    const iva = orderData.totals.total - neto;

    const data = {
      'CantReg': 1,
      'PtoVta': 1,
      'CbteTipo': 1, // 1 = Factura A
      'Concepto': 1,
      'DocTipo': 80, // 80 = CUIT
      'DocNro': cuitCliente,
      'CbteDesde': nextVoucherNumber,
      'CbteHasta': nextVoucherNumber,
      'CbteFch': parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, '')),
      'ImpTotal': orderData.totals.total,
      'ImpTotConc': 0,
      'ImpNeto': neto,
      'ImpOpEx': 0,
      'ImpIVA': iva,
      'ImpTrib': 0,
      'MonId': 'PES',
      'MonCotiz': 1,
      'Iva': [
        {
          'Id': 5, // 5 = 21%
          'BaseImp': neto,
          'Importe': iva
        }
      ]
    };

    const result = await afip.ElectronicBilling.createVoucher(data);

    console.log('✅ Factura A generada exitosamente');
    console.log('📋 CAE:', result.CAE);

    return {
      numero: nextVoucherNumber,
      puntoVenta: 1,
      tipo: 'A',
      cae: result.CAE,
      vencimientoCAE: result.CAEFchVto,
      fecha: new Date().toISOString(),
      neto: neto,
      iva: iva,
      total: orderData.totals.total,
    };

  } catch (error) {
    console.error('❌ Error generando factura A:', error);
    throw new Error(`Error en AFIP: ${error.message}`);
  }
}

export default afip;
