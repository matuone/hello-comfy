#!/bin/bash

echo "========================================"
echo "Generador de Certificados para AFIP"
echo "========================================"
echo ""

# Verificar si OpenSSL está instalado
if ! command -v openssl &> /dev/null; then
    echo "[ERROR] OpenSSL no está instalado"
    echo ""
    echo "Instalalo con Git for Windows o desde:"
    echo "https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
fi

echo "[1/3] Generando clave privada (afip-key.key)..."
openssl genrsa -out afip-key.key 2048 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[ERROR] No se pudo generar la clave privada"
    exit 1
fi
echo "✅ OK - Clave privada generada"

echo ""
echo "[2/3] Generando CSR (Certificate Signing Request)..."
echo ""

# Solicitar datos
read -p "Ingresa tu CUIT (sin guiones, ej: 20123456789): " CUIT
read -p "Ingresa el nombre de tu empresa (ej: HelloComfy): " EMPRESA

openssl req -new -key afip-key.key -subj "/C=AR/O=$EMPRESA/CN=homologacion/serialNumber=CUIT $CUIT" -out afip-csr.csr 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[ERROR] No se pudo generar el CSR"
    exit 1
fi
echo "✅ OK - CSR generado"

echo ""
echo "========================================"
echo "CERTIFICADOS GENERADOS EXITOSAMENTE"
echo "========================================"
echo ""
echo "📁 Archivos creados:"
echo "   ✅ afip-key.key  (clave privada - NO COMPARTIR)"
echo "   ✅ afip-csr.csr  (para subir a AFIP)"
echo ""
echo "📋 PROXIMOS PASOS:"
echo ""
echo "1. Ir a: https://www.afip.gob.ar/ws/WSASS/"
echo "2. Ingresar con clave fiscal"
echo "3. Ir a 'Administrador de Relaciones de Clave Fiscal'"
echo "4. Nueva Relacion -> Seleccionar 'wsfe'"
echo "5. Subir el archivo: afip-csr.csr"
echo "6. Descargar el certificado como: afip-cert.crt"
echo "7. Guardar afip-cert.crt en esta misma carpeta"
echo ""
echo "🔑 Tu CUIT configurado: $CUIT"
echo ""
echo "📖 Lee INSTRUCCIONES_AFIP.md para más detalles"
echo ""
