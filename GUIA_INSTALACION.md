# 🚀 Guía de Instalación y Testing - Hello Comfy Reconstrucción

## 1️⃣ Verificación de Dependencias

### Backend
```bash
cd backend
npm install
```

Asegúrate que tengas estas librerías:
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "validator": "^13.9.0",
  "cloudinary": "^1.33.0",
  "multer": "^1.4.5-lts.1"
}
```

### Frontend
```bash
npm install
```

Verifica que tengas:
```json
{
  "react": "^18.x",
  "vite": "^4.x"
}
```

---

## 2️⃣ Configuración de Variables de Entorno

### Backend (.env)
```env
# Puerto
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/hello-comfy

# JWT
JWT_SECRET=tu_secreto_super_largo_y_aleatorio_aqui_2024

# Cloudinary (para avatares)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=1234567890123456
CLOUDINARY_API_SECRET=tu_api_secret_aqui

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (Vite)
No necesita .env, el proxy está en `vite.config.js`

---

## 3️⃣ Estructura Cloudinary (opcional)

Si usas Cloudinary para avatares:

1. Ve a https://cloudinary.com
2. Crea una cuenta/inicia sesión
3. Obtén tu `Cloud Name`, `API Key`, `API Secret`
4. Crea una carpeta en Cloudinary: `/hellocomfy/avatars`

---

## 4️⃣ Iniciar los Servidores

### Terminal 1: Backend
```bash
cd backend
npm start
# Debería ver: "Servidor corriendo en puerto 5000"
```

### Terminal 2: Frontend
```bash
npm run dev
# Debería ver: "Local: http://localhost:5173"
```

---

## 5️⃣ Testing Manual

### Test 1: Registrarse (Crear usuario)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "12345678",
    "dni": "12345678",
    "whatsapp": "+54 9 11 1234-5678",
    "address": {
      "street": "Calle Principal",
      "number": "123",
      "floor": "2B",
      "city": "Buenos Aires",
      "province": "Buenos Aires",
      "postalCode": "1425"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "avatar": "https://res.cloudinary.com/...",
    "isAdmin": false
  }
}
```

### Test 2: Actualizar Perfil
```bash
# Guarda el TOKEN de la respuesta anterior
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
USER_ID="65a1b2c3d4e5f6g7h8i9j0k1"

curl -X PUT http://localhost:5000/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Carlos Pérez",
    "dni": "12345678",
    "whatsapp": "+54 9 11 9999-9999",
    "address": {
      "street": "Av. Corrientes",
      "number": "500",
      "floor": "5A",
      "city": "Buenos Aires",
      "province": "Buenos Aires",
      "postalCode": "1425"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Perfil actualizado correctamente",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Juan Carlos Pérez",
    "email": "juan@example.com",
    "dni": "12345678",
    "whatsapp": "+54 9 11 9999-9999",
    "address": {
      "street": "Av. Corrientes",
      "number": "500",
      "floor": "5A",
      "city": "Buenos Aires",
      "province": "Buenos Aires",
      "postalCode": "1425"
    }
  }
}
```

### Test 3: Obtener Órdenes del Usuario
```bash
curl -X GET http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada:**
```json
{
  "orders": [
    {
      "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
      "orderNumber": "0K1L2M3N",
      "status": "pending",
      "createdAt": "2024-01-14T10:30:00.000Z",
      "items": [
        {
          "productName": "Almohada Comfy",
          "quantity": 2,
          "size": "M",
          "price": 1500
        }
      ],
      "subtotal": 3000,
      "shippingCost": 500,
      "discount": 0,
      "total": 3500,
      "shipping": {
        "method": "Andreani",
        "trackingNumber": "1234567890",
        "estimatedDelivery": "2024-01-20T00:00:00.000Z"
      }
    }
  ]
}
```

### Test 4: Subir Avatar
```bash
curl -X PUT http://localhost:5000/api/users/$USER_ID/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/ruta/a/mi/foto.jpg"
```

**Respuesta esperada:**
```json
{
  "message": "Avatar actualizado correctamente",
  "avatar": "https://res.cloudinary.com/hellocomfy/image/upload/v1705231234/avatars/abc123.jpg"
}
```

---

## 6️⃣ Testing en el Navegador

### Flujo del Usuario:
1. **Registrarse** en `/register`
   - Completa todos los campos
   - El token se guarda en localStorage

2. **Ir a Account Profile** (`/account/profile`)
   - Deberías ver tus datos actuales
   - Edita name, dni, whatsapp, address
   - Haz clic en "Guardar Cambios"
   - Deberías ver mensajes de éxito

3. **Ir a Account Purchases** (`/account/purchases`)
   - Si tienes órdenes, aparecerán listadas
   - Cada orden mostrará estado con color
   - Expandir para ver items, totales, envío

---

## 7️⃣ Debugging

### El backend no inicia
```bash
# Verifica que el puerto 5000 esté disponible
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows
```

### Error 401 Unauthorized
- Token expirado → Re-loguearse
- Token inválido → Verificar JWT_SECRET
- Token no enviado → Agregar header Authorization

### Error 403 Forbidden
- Intentas actualizar perfil de otro usuario
- Verifica que user.id coincida con el ID en la URL

### Error de CORS
- Asegúrate que `vite.config.js` tiene el proxy configurado
- Reinicia el servidor Vite

### Avatar no sube a Cloudinary
- Verifica credenciales en .env
- Asegúrate que multer está instalado
- Revisa que el folder `/hellocomfy/avatars` existe

---

## 8️⃣ Verificación de Archivos

Asegúrate que estos archivos EXISTAN y NO estén vacíos:

```
✅ src/views/account/AccountProfile.jsx (304 líneas)
✅ src/views/account/AccountPurchases.jsx (211 líneas)
✅ src/styles/account/accountprofile.css (202 líneas)
✅ src/styles/account/accountpurchases.css (344 líneas)
✅ backend/routes/userRoutes.js (17 líneas)
✅ backend/routes/orderRoutes.js (121 líneas)
✅ backend/controllers/authController.js (260+ líneas)
✅ backend/server.js (con userRoutes importado)
✅ vite.config.js (con proxy configurado)
```

---

## 9️⃣ Errores Comunes & Soluciones

| Problema | Solución |
|----------|----------|
| **"Cannot find module 'cloudinary'"** | `npm install cloudinary` |
| **"Cannot find module 'multer'"** | `npm install multer` |
| **JWT token is invalid** | Verifica JWT_SECRET en .env |
| **ECONNREFUSED: Connection refused** | MongoDB no conecta, verifica MONGO_URI |
| **404 Not Found /api/users/:id** | Verifica que userRoutes esté importado en server.js |
| **Proxy no funciona** | Restart Vite dev server |

---

## 🔟 Checklist Final

Antes de considerar "completado":

- [ ] Backend inicia en puerto 5000
- [ ] Frontend inicia en puerto 5173
- [ ] Puedes registrarte con éxito
- [ ] Token se guarda en localStorage
- [ ] Puedes actualizar perfil
- [ ] Actualización guarda en BD
- [ ] Avatar sube a Cloudinary (si configurado)
- [ ] Órdenes se cargan con GET /my-orders
- [ ] Estados de órdenes muestran colores correctos
- [ ] CSS responsive funciona en móvil
- [ ] No hay errores en console del navegador
- [ ] No hay errores en terminal del backend

---

## 📞 Soporte

Si algo no funciona:

1. **Revisa los logs** en terminal (frontend + backend)
2. **Abre DevTools** (F12) en el navegador
3. **Revisa la pestaña Network** para ver requests/responses
4. **Verifica MongoDB** está corriendo y conectada
5. **Reinicia ambos servidores** (Ctrl+C y reinicia)

---

**Última actualización:** 14 de Enero, 2026
**Version:** 1.0 - LISTO PARA DEPLOY
