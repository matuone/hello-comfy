# Configuración AFIP - afip.js

## 📋 Pasos para configurar AFIP

### 1. Obtener Certificado Digital

**Para ambiente de homologación (testing):**
```bash
# Generar clave privada
openssl genrsa -out afip-key.key 2048

# Generar CSR (Certificate Signing Request)
openssl req -new -key afip-key.key -subj "/C=AR/O=TU_EMPRESA/CN=homologacion/serialNumber=CUIT TU_CUIT" -out afip-csr.csr

# Subir el CSR en AFIP:
# 1. Entrar a https://www.afip.gob.ar/ws/WSASS/
# 2. Ir a "Administrador de Relaciones de Clave Fiscal"
# 3. Crear nueva relación para "Factura Electrónica - Comprobantes en Línea"
# 4. Subir el archivo afip-csr.csr
# 5. Descargar el certificado afip-cert.crt
```

### 2. Estructura de archivos

Crear en `backend/config/`:
```
config/
  ├── afip-cert.crt    (certificado descargado de AFIP)
  ├── afip-key.key     (clave privada generada)
  └── afip-ta/         (carpeta para tokens - se crea automáticamente)
```

### 3. Variables de entorno

Agregar en `.env`:
```env
# AFIP Configuración
AFIP_CUIT=20123456789              # Tu CUIT
AFIP_PRODUCTION=false              # false = homologación, true = producción
AFIP_PUNTO_VENTA=1                 # Punto de venta habilitado en AFIP
```

### 4. Configurar punto de venta en AFIP

1. Entrar a AFIP con clave fiscal
2. Ir a "Comprobantes en línea"
3. Solicitar/verificar punto de venta habilitado
4. Habilitar para factura tipo A, B, C según necesites

## 🧪 Testing

El SDK funciona con ambiente de homologación de AFIP automáticamente cuando `AFIP_PRODUCTION=false`.

En homologación podés probar:
- Generación de facturas
- Consultas a padrón
- Todos los servicios sin afectar producción

## 📝 Tipos de comprobantes

- **Factura A**: Para responsables inscriptos (CUIT) - IVA discriminado
- **Factura B**: Para consumidores finales y monotributistas
- **Factura C**: Para operaciones exentas

## 🔐 Seguridad

⚠️ **IMPORTANTE:**
- Nunca commitear los archivos `.key` y `.crt` al repositorio
- Agregar al `.gitignore`:
```
config/afip-*.key
config/afip-*.crt
config/afip-ta/
```

## 📚 Documentación

- SDK: https://github.com/AfipSDK/afip.js
- Manual AFIP: https://www.afip.gob.ar/ws/documentacion/ws-factura-electronica.asp
- Tipos de comprobante: https://www.afip.gob.ar/fe/documentos/TABLACOMPROBANTES.xls

## 🆘 Problemas comunes

**Error: "No se pudo autenticar"**
- Verificar que el certificado esté vigente
- Verificar que el CUIT sea correcto
- Verificar permisos en "Administrador de Relaciones"

**Error: "Punto de venta no habilitado"**
- Habilitar el punto de venta en "Comprobantes en línea"

**Error: "Certificado vencido"**
- Generar nuevo certificado y CSR
- Actualizar en AFIP
