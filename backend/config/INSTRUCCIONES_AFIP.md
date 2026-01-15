# Instrucciones paso a paso para configurar AFIP

## 📋 Requisitos previos

1. **Tener instalado OpenSSL** (para generar certificados)
   - Descargar desde: https://slproweb.com/products/Win32OpenSSL.html
   - Instalar "Win64 OpenSSL v3.x.x Light"
   - Durante instalación, elegir "The OpenSSL binaries (/bin) directory"

2. **Tener clave fiscal de AFIP**
   - Nivel 3 o superior
   - Si no la tenés, pedila en AFIP

3. **Tu CUIT**

---

## 🚀 Paso 1: Generar certificados

### Opción A - Automático (RECOMENDADO):

1. Abrir terminal en `backend/config/`:
```bash
cd backend/config
```

2. Ejecutar el generador:
```bash
generar-certificados.bat
```

3. Seguir las instrucciones en pantalla
   - Ingresar tu CUIT (ej: 20123456789)
   - Ingresar nombre de empresa (ej: HelloComfy)

### Opción B - Manual:

```bash
cd backend/config

# Generar clave privada
openssl genrsa -out afip-key.key 2048

# Generar CSR (reemplazar CUIT y empresa)
openssl req -new -key afip-key.key -subj "/C=AR/O=HelloComfy/CN=homologacion/serialNumber=CUIT 20123456789" -out afip-csr.csr
```

---

## 🌐 Paso 2: Subir certificado a AFIP

### Para HOMOLOGACIÓN (Testing):

1. **Ir a**: https://www.afip.gob.ar/ws/WSASS/
   
2. **Ingresar** con CUIT y Clave Fiscal

3. **Ir a**: "Administrador de Relaciones de Clave Fiscal"

4. **Click en**: "Nueva Relación"

5. **Seleccionar**:
   - Servicio: **"wsfe"** (Web Service de Facturación Electrónica)
   - Ambiente: **"Homologación"** (testing)

6. **Subir archivo**: Elegir `afip-csr.csr`

7. **Confirmar** y esperar aprobación (puede tardar unos minutos)

8. **Descargar** el certificado generado y guardarlo como `afip-cert.crt` en `backend/config/`

---

## ⚙️ Paso 3: Configurar variables de entorno

Editar `backend/.env`:

```env
# AFIP CONFIGURATION
AFIP_CUIT=20123456789              # Tu CUIT real
AFIP_PRODUCTION=false              # false = homologación
AFIP_PUNTO_VENTA=1                 # Punto de venta habilitado
```

---

## ✅ Paso 4: Verificar instalación

1. **Reiniciar el servidor backend**:
```bash
npm run dev
```

2. **Probar conexión** con Bruno/Postman:

```http
GET http://localhost:5000/api/afip/status
Authorization: Bearer TU_TOKEN_ADMIN
```

Deberías ver:
```json
{
  "success": true,
  "status": {
    "appserver": "OK",
    "authserver": "OK",
    "dbserver": "OK"
  },
  "message": "Servicio AFIP operativo"
}
```

3. **Generar factura de prueba**:

```http
POST http://localhost:5000/api/afip/test-factura
Authorization: Bearer TU_TOKEN_ADMIN
```

Si funciona, verás el número de factura y CAE generados.

---

## 🎯 Paso 5: Habilitar punto de venta

1. Ir a: https://serviciosweb.afip.gob.ar/genericos/comprobantes/

2. Ingresar con Clave Fiscal

3. Ir a **"Comprobantes en línea"** → **"Factura Electrónica"**

4. **Habilitar punto de venta** (ej: Punto de venta 1)

5. Seleccionar tipos de comprobante:
   - ✅ Factura A
   - ✅ Factura B
   - ✅ Nota de Crédito A/B (opcional)

---

## 📁 Estructura final de archivos

```
backend/config/
  ├── afip-key.key         ✅ (generado - PRIVADO)
  ├── afip-csr.csr         ✅ (generado - para AFIP)
  ├── afip-cert.crt        ✅ (descargado de AFIP)
  └── afip-ta/             ✅ (carpeta para tokens - auto)
```

---

## 🔒 Seguridad

**IMPORTANTE:** Agregar al `.gitignore`:

```gitignore
# AFIP Certificates
backend/config/afip-*.key
backend/config/afip-*.crt
backend/config/afip-*.csr
backend/config/afip-ta/
```

---

## 🆘 Problemas comunes

### Error: "OpenSSL no encontrado"
- Instalar OpenSSL para Windows
- Agregar al PATH del sistema

### Error: "No se pudo autenticar"
- Verificar que el CUIT en .env sea correcto
- Verificar que el certificado esté en la carpeta correcta
- Verificar que la relación esté activa en AFIP

### Error: "Punto de venta no habilitado"
- Habilitar punto de venta en "Comprobantes en línea"
- Esperar 5-10 minutos para que se active

### Error: "Certificado vencido"
- Los certificados vencen cada año
- Generar nuevo CSR y renovar en AFIP

---

## 📞 Soporte AFIP

- **Homologación**: https://www.afip.gob.ar/ws/
- **Documentación**: https://www.afip.gob.ar/ws/documentacion/ws-factura-electronica.asp
- **Teléfono**: 0810-999-2347

---

## 🚀 Para producción

Una vez que todo funcione en homologación:

1. Generar nuevo certificado para **producción**
2. Subir CSR en ambiente de **producción** (no homologación)
3. Cambiar `AFIP_PRODUCTION=true` en `.env`
4. Habilitar punto de venta en producción
5. ¡Listo para facturar en vivo! 🎉
