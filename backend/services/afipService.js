// backend/services/afipService.js
import Afip from '@afipsdk/afip.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración de AFIP
 * IMPORTANTE: Antes de usar en producción necesitás:
 * 1. Certificado digital de AFIP (.crt y .key)
 * 2. CUIT de la empresa
 * 3. Punto de venta habilitado
 */
const afip = new Afip({
  CUIT: process.env.AFIP_CUIT || 20000000000, // Reemplazar con tu CUIT
  production: process.env.AFIP_PRODUCTION === 'true' || false, // false = homologación (testing)
  cert: path.join(__dirname, '../config/afip-cert.crt'), // Ruta al certificado
  key: path.join(__dirname, '../config/afip-key.key'), // Ruta a la clave privada
  ta_folder: path.join(__dirname, '../config/afip-ta'), // Carpeta para tokens
});

/**
 * Generar factura electrónica tipo B (consumidor final)
 * @param {Object} orderData - Datos de la orden
 * @returns {Promise<Object>} Factura generada
 */
export async function generarFacturaB(orderData) {
  try {
    console.log('📄 Iniciando generación de factura B para orden:', orderData.code);

    // Obtener el último número de factura para este punto de venta
    const lastVoucher = await afip.ElectronicBilling.getLastVoucher(6, 1); // 6 = Factura B, 1 = Punto de venta
    const nextVoucherNumber = lastVoucher + 1;

    console.log('📝 Último comprobante:', lastVoucher);
    console.log('📝 Próximo número:', nextVoucherNumber);

    // Datos de la factura
    const data = {
      'CantReg': 1, // Cantidad de facturas a registrar
      'PtoVta': 1, // Punto de venta (configurar según AFIP)
      'CbteTipo': 6, // Tipo de comprobante (6 = Factura B)
      'Concepto': 1, // 1 = Productos, 2 = Servicios, 3 = Productos y Servicios
      'DocTipo': 99, // 99 = Consumidor Final, 96 = DNI, 80 = CUIT
      'DocNro': 0, // 0 para consumidor final
      'CbteDesde': nextVoucherNumber,
      'CbteHasta': nextVoucherNumber,
      'CbteFch': parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, '')), // Formato YYYYMMDD
      'ImpTotal': orderData.totals.total,
      'ImpTotConc': 0, // Importe neto no gravado
      'ImpNeto': orderData.totals.total, // Importe neto gravado
      'ImpOpEx': 0, // Importe exento
      'ImpIVA': 0, // Importe de IVA (para factura B se incluye en el total)
      'ImpTrib': 0, // Importe de tributos
      'MonId': 'PES', // Moneda (PES = Pesos argentinos)
      'MonCotiz': 1, // Cotización de moneda
    };

    // Generar la factura en AFIP
    const result = await afip.ElectronicBilling.createVoucher(data);

    console.log('✅ Factura generada exitosamente');
    console.log('📋 CAE:', result.CAE);
    console.log('📋 Vencimiento CAE:', result.CAEFchVto);
    console.log('📋 Número de factura:', nextVoucherNumber);

    return {
      numero: nextVoucherNumber,
      puntoVenta: 1,
      tipo: 'B',
      cae: result.CAE,
      vencimientoCAE: result.CAEFchVto,
      fecha: new Date().toISOString(),
      total: orderData.totals.total,
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
