@echo off
echo ========================================
echo Generador de Certificados para AFIP
echo ========================================
echo.

REM Verificar si OpenSSL está instalado
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] OpenSSL no está instalado
    echo.
    echo Descargalo desde: https://slproweb.com/products/Win32OpenSSL.html
    echo Instala "Win64 OpenSSL v3.x.x Light"
    echo.
    pause
    exit /b 1
)

echo [1/3] Generando clave privada (afip-key.key)...
openssl genrsa -out afip-key.key 2048
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo generar la clave privada
    pause
    exit /b 1
)
echo OK - Clave privada generada

echo.
echo [2/3] Generando CSR (Certificate Signing Request)...
echo.
set /p CUIT="Ingresa tu CUIT (sin guiones, ej: 20123456789): "
set /p EMPRESA="Ingresa el nombre de tu empresa (ej: HelloComfy): "

openssl req -new -key afip-key.key -subj "/C=AR/O=%EMPRESA%/CN=homologacion/serialNumber=CUIT %CUIT%" -out afip-csr.csr
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo generar el CSR
    pause
    exit /b 1
)
echo OK - CSR generado

echo.
echo ========================================
echo CERTIFICADOS GENERADOS EXITOSAMENTE
echo ========================================
echo.
echo Archivos creados:
echo   - afip-key.key  (clave privada - NO COMPARTIR)
echo   - afip-csr.csr  (para subir a AFIP)
echo.
echo PROXIMOS PASOS:
echo.
echo 1. Ir a: https://www.afip.gob.ar/ws/WSASS/
echo 2. Ingresar con clave fiscal
echo 3. Ir a "Administrador de Relaciones de Clave Fiscal"
echo 4. Nueva Relacion -^> Seleccionar "wsfe"
echo 5. Subir el archivo: afip-csr.csr
echo 6. Descargar el certificado como: afip-cert.crt
echo 7. Guardar afip-cert.crt en esta misma carpeta
echo.
echo Tu CUIT configurado: %CUIT%
echo.
pause
