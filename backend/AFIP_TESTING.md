# Guía de prueba de AFIP.js

## ⚠️ IMPORTANTE - Configuración inicial

Antes de poder generar facturas, necesitás configurar los certificados de AFIP.

### Opción 1: Ambiente de homologación (TESTING - Recomendado para empezar)

1. **Generar certificado de prueba:**

```bash
cd backend/config

# Generar clave privada
openssl genrsa -out afip-key.key 2048

# Generar CSR
openssl req -new -key afip-key.key -subj "/C=AR/O=HelloComfy/CN=homologacion/serialNumber=CUIT 20123456789" -out afip-csr.csr
```

2. **Subir a AFIP Homologación:**
   - Ir a: https://www.afip.gob.ar/ws/WSASS/ (ambiente de prueba)
   - Ingresar con usuario de prueba de AFIP
   - Ir a "Administrador de Relaciones de Clave Fiscal"
   - Nueva relación → "wsfe" (Factura Electrónica)
   - Subir el archivo `afip-csr.csr`
   - Descargar el certificado como `afip-cert.crt`
   - Guardar en `backend/config/`

3. **Actualizar .env con tu CUIT de prueba:**
```env
AFIP_CUIT=20123456789  # Tu CUIT de prueba
AFIP_PRODUCTION=false
AFIP_PUNTO_VENTA=1
```

### Opción 2: Modo de prueba SIN certificados (Solo para testing de API)

Si solo querés probar que el código funciona sin configurar AFIP todavía:

1. Comentar temporalmente las líneas de certificado en `afipService.js`:
```javascript
const afip = new Afip({
  CUIT: process.env.AFIP_CUIT || 20000000000,
  production: false,
  // cert: path.join(__dirname, '../config/afip-cert.crt'),  // Comentar
  // key: path.join(__dirname, '../config/afip-key.key'),     // Comentar
  ta_folder: path.join(__dirname, '../config/afip-ta'),
});
```

2. Las rutas de la API funcionarán pero darán error al intentar conectar con AFIP (esperado).

## 🧪 Probar las rutas de la API

Una vez configurado (opción 1) o en modo prueba (opción 2):

### 1. Verificar estado del servicio
```bash
# Usando Bruno o Postman
GET http://localhost:5000/api/afip/status
Authorization: Bearer <token_admin>
```

### 2. Generar factura de prueba
```bash
POST http://localhost:5000/api/afip/test-factura
Authorization: Bearer <token_admin>
```

### 3. Generar factura para una orden real
```bash
POST http://localhost:5000/api/afip/generar-factura/ORDER_ID
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "tipoFactura": "B"
}
```

### 4. Consultar contribuyente por CUIT
```bash
GET http://localhost:5000/api/afip/consultar-contribuyente/20123456789
Authorization: Bearer <token_admin>
```

## 📋 Próximos pasos

1. **Para producción:**
   - Obtener certificado de producción de AFIP
   - Cambiar `AFIP_PRODUCTION=true`
   - Usar CUIT real de la empresa
   - Habilitar punto de venta en AFIP producción

2. **Integración con el panel admin:**
   - Agregar botón "Generar Factura" en la vista de órdenes
   - Mostrar datos de factura (CAE, fecha, vencimiento)
   - Generar PDF con los datos de la factura

3. **Automatización:**
   - Generar factura automáticamente cuando se aprueba un pago
   - Enviar factura por email al cliente

## 🆘 Si tenés problemas

1. Verificar que MongoDB esté corriendo
2. Verificar que el servidor backend esté en puerto 5000
3. Verificar que tengas token de admin válido
4. Ver logs en la consola del servidor
5. Leer `AFIP_SETUP.md` para más detalles

## 📚 Documentación

- SDK afip.js: https://github.com/AfipSDK/afip.js
- Manual AFIP: https://www.afip.gob.ar/ws/
