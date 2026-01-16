# Facturación Electrónica AFIP - Guía Completa

## 📋 Descripción

Este proyecto utiliza **facturación electrónica directa con AFIP** mediante el SDK `@afipsdk/afip.js`. 

**✅ Ventajas:**
- Sin costos adicionales de servicios terceros (Facturante, etc.)
- Integración directa con AFIP
- Control total del proceso de facturación

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno (.env)

```env
# AFIP Configuration
AFIP_CUIT=27391049802
AFIP_PUNTO_VENTA=4
AFIP_ACCESS_TOKEN=tu_token_generado
```

### 2. Certificados AFIP

Los certificados deben estar en `backend/config/`:
- `cert.pem` - Certificado público
- `key.pem` - Clave privada

**Generar certificados:**
```bash
cd backend/config
# En Windows:
.\generar-certificados.bat

# En Linux/Mac:
./generar-certificados.sh
```

Ver instrucciones completas en [AFIP_SETUP.md](./AFIP_SETUP.md)

---

## 📁 Estructura de Archivos

```
backend/
├── services/
│   └── afipService.js          # Lógica de facturación AFIP
├── routes/
│   └── afipRoutes.js           # Endpoints de facturación
├── config/
│   ├── cert.pem                # Certificado AFIP
│   ├── key.pem                 # Clave privada AFIP
│   └── afip-ta/                # Token de autorización (auto-generado)
└── models/
    └── Order.js                # Modelo de órdenes
```

---

## 🔑 Funciones Principales

### `generarFacturaC(orderData, puntoVenta)`

Genera **Factura C** (Monotributista a Consumidor Final)

**Parámetros:**
- `orderData`: Objeto con datos de la orden
- `puntoVenta`: (Opcional) Punto de venta a usar. Por defecto usa `AFIP_PUNTO_VENTA`

**Retorna:**
```javascript
{
  numero: 12345,
  puntoVenta: 4,
  tipo: 'C',
  cae: '74123456789012',
  vencimientoCAE: '20260125',
  fecha: '2026-01-16T...',
  total: 1000
}
```

**Ejemplo:**
```javascript
import { generarFacturaC } from './services/afipService.js';

const factura = await generarFacturaC({
  code: 'ORD-001',
  totals: { total: 1500 },
  customer: {
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com'
  }
});
```

---

### `generarFacturaA(orderData, cuitCliente, puntoVenta)`

Genera **Factura A** (Responsable Inscripto a Responsable Inscripto)

**Parámetros:**
- `orderData`: Objeto con datos de la orden
- `cuitCliente`: CUIT del cliente (obligatorio)
- `puntoVenta`: (Opcional) Punto de venta a usar

**Características:**
- Discrimina IVA (21%)
- Requiere CUIT del cliente
- Documento tipo: 80 (CUIT)

---

## ⚠️ ERROR COMÚN Y SOLUCIÓN

### 🐛 Error: Orden de Parámetros en `getLastVoucher`

**❌ INCORRECTO:**
```javascript
const lastVoucher = await afip.ElectronicBilling.getLastVoucher(11, ptoVta);
//                                                              ^^  ^^^^^^
//                                                        tipo    punto
```

**✅ CORRECTO (según spec AFIP):**
```javascript
const lastVoucher = await afip.ElectronicBilling.getLastVoucher(ptoVta, 11);
//                                                              ^^^^^^  ^^
//                                                              punto   tipo
```

**Firma correcta:**
```javascript
afip.ElectronicBilling.getLastVoucher(puntoDeVenta, tipoDeComprobante)
```

### Tipos de Comprobante AFIP

| Código | Tipo de Factura |
|--------|-----------------|
| 1      | Factura A       |
| 6      | Factura B       |
| 11     | Factura C       |

---

## 🧪 Testing

### Test de Factura

**Endpoint:** `POST /api/afip/test-factura`

**Usar con Bruno:**
```
POST http://localhost:5000/api/afip/test-factura
Authorization: Bearer {admin_token}
```

**Archivo:** `HelloComfy/Test Factura AFIP.bru`

### Test de Puntos de Venta

**Endpoint:** `GET /api/afip/puntos-venta`

Verifica qué puntos de venta están habilitados en AFIP.

### Probar Puntos de Venta

**Endpoint:** `GET /api/afip/puntos-venta/test`

Prueba todos los puntos de venta haciendo `getLastVoucher`.

---

## 📡 Endpoints Disponibles

### 1. Verificar Estado AFIP
```
GET /api/afip/status
```

### 2. Obtener Puntos de Venta
```
GET /api/afip/puntos-venta
```

### 3. Probar Puntos de Venta
```
GET /api/afip/puntos-venta/test
```

### 4. Generar Factura de Prueba
```
POST /api/afip/test-factura
```

### 5. Generar Factura para Orden
```
POST /api/afip/generar-factura/:orderId
Body: {
  tipoFactura: 'A' | 'C',
  cuitCliente: '20123456789' // Solo para tipo A
}
```

---

## 🔍 Verificación de Factura Generada

### En la Orden (MongoDB)

Después de generar una factura, la orden se actualiza con:

```javascript
{
  facturaNumero: "C-0004-00000123",  // Formato: TIPO-PtoVta-Número
  facturaCae: "74123456789012",      // CAE de AFIP
  facturaVencimientoCAE: "20260125", // Vencimiento del CAE
  facturaTipo: "C",                   // Tipo de factura
  status: "facturado"                 // Estado actualizado
}
```

### Logs del Sistema

```
📄 Iniciando generación de factura C para orden: ORD-001
🔄 Usando punto de venta 4...
✅ Punto de venta 4 está habilitado
📝 Último comprobante: 122
📝 Próximo número: 123
✅ Factura generada exitosamente
📋 CAE: 74123456789012
📋 Vencimiento CAE: 20260125
📋 Número de factura: 123
```

---

## 🛠️ Troubleshooting

### Error: "Certificado no encontrado"
- Verificar que existen `cert.pem` y `key.pem` en `backend/config/`
- Regenerar certificados si están vencidos

### Error: "CUIT no autorizado"
- Verificar que el certificado esté asociado al CUIT correcto en AFIP
- Revisar `AFIP_CUIT` en `.env`

### Error: "Punto de venta no habilitado"
- Consultar puntos habilitados: `GET /api/afip/puntos-venta`
- Habilitar punto de venta en AFIP web

### Error: "Token inválido o expirado"
- El token se regenera automáticamente
- Verificar permisos de escritura en `backend/config/afip-ta/`

### Error: "Parámetros incorrectos en getLastVoucher"
- **Verificar orden:** `getLastVoucher(puntoVenta, tipoComprobante)`
- **NO:** ~~`getLastVoucher(tipoComprobante, puntoVenta)`~~

---

## 📚 Recursos Adicionales

- [AFIP_SETUP.md](./AFIP_SETUP.md) - Configuración inicial completa
- [AFIP_TESTING.md](./AFIP_TESTING.md) - Guía de testing
- [config/INSTRUCCIONES_AFIP.md](./config/INSTRUCCIONES_AFIP.md) - Instrucciones detalladas

---

## ✅ Checklist de Implementación

- [ ] Variables de entorno configuradas en `.env`
- [ ] Certificados AFIP generados y en `backend/config/`
- [ ] Certificado asociado al CUIT en portal AFIP
- [ ] Punto de venta habilitado en AFIP
- [ ] Test de conexión exitoso: `GET /api/afip/status`
- [ ] Test de factura exitoso: `POST /api/afip/test-factura`
- [ ] Orden de parámetros verificado en `getLastVoucher`

---

## 📝 Notas Importantes

1. **Ambiente de Producción vs Testing:**
   - Los certificados son diferentes para homologación y producción
   - Cambiar el ambiente en la inicialización del SDK si es necesario

2. **Punto de Venta:**
   - Cada punto de venta tiene su propia numeración de comprobantes
   - Usar siempre el mismo punto de venta para mantener secuencia

3. **Tipos de Factura:**
   - **Factura C:** Para ventas a consumidor final (sin CUIT)
   - **Factura A:** Para ventas a responsables inscriptos (con CUIT)

4. **CAE (Código de Autorización Electrónico):**
   - Válido por tiempo limitado (generalmente 10 días)
   - Debe guardarse junto con la factura

---

## 🚀 Próximos Pasos

- [ ] Implementar generación de PDF de factura
- [ ] Envío automático de factura por email
- [ ] Integración con sistema de stock
- [ ] Dashboard de facturas generadas
- [ ] Notas de crédito automáticas

---

**Última actualización:** Enero 2026  
**Versión SDK:** @afipsdk/afip.js  
**Estado:** ✅ Funcionando correctamente
