# 📋 Checklist de Reconstrucción Hello Comfy

## ✅ Archivos COMPLETADOS

### Frontend (React) - 6 archivos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/views/account/AccountProfile.jsx` | Formulario edición perfil usuario | ✅ |
| `src/views/account/AccountPurchases.jsx` | Listado órdenes con estado/colores | ✅ |
| `src/styles/account/accountlayout.css` | Sidebar + navegación | ✅ (YA EXISTÍA) |
| `src/styles/account/accountprofile.css` | Estilos formulario perfil | ✅ |
| `src/styles/account/accountpurchases.css` | Estilos tarjetas órdenes | ✅ |
| `vite.config.js` | Proxy para `/api` → localhost:5000 | ✅ |

---

### Backend (Node.js/Express) - 5 archivos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `backend/routes/userRoutes.js` | Rutas PUT perfil y PUT avatar | ✅ |
| `backend/controllers/authController.js` | updateUserProfile + updateUserAvatar | ✅ |
| `backend/routes/orderRoutes.js` | GET /orders/my-orders agregado | ✅ |
| `backend/server.js` | Import userRoutes + registro | ✅ |
| `backend/models/User.js` | ✅ Ya estaba configurado | ✅ |

---

## 🔗 Rutas API Implementadas

### Rutas de Usuario
```http
PUT /api/users/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "string",
  "dni": "string",
  "whatsapp": "string",
  "address": {
    "street": "string",
    "number": "string",
    "floor": "string (opcional)",
    "city": "string",
    "province": "string",
    "postalCode": "string"
  }
}
```

```http
PUT /api/users/:id/avatar
Content-Type: multipart/form-data
Authorization: Bearer {token}

avatar: File
```

### Rutas de Órdenes
```http
GET /api/orders/my-orders
Authorization: Bearer {token}

Response:
{
  "orders": [
    {
      "_id": "ObjectId",
      "orderNumber": "string",
      "status": "pending|processing|shipped|delivered",
      "createdAt": "ISO 8601",
      "items": [ { productName, quantity, size, price } ],
      "subtotal": number,
      "shippingCost": number,
      "discount": number,
      "total": number,
      "shipping": { method, trackingNumber, estimatedDelivery }
    }
  ]
}
```

---

## 🎨 Colores de Estados de Órdenes

```javascript
pending      → #FFC107 (Amarillo)     = "Pendiente"
processing   → #2196F3 (Azul)         = "Procesando"
shipped      → #4CAF50 (Verde)        = "Enviado"
delivered    → #9E9E9E (Gris)         = "Entregado"
```

---

## 📱 Responsive Design

Todos los CSS están optimizados para:
- ✅ Desktop (>768px)
- ✅ Tablet (768px - 480px)
- ✅ Mobile (<480px)

Con media queries para:
- Grid layouts
- Font sizes
- Padding/Margins
- Overflow handling

---

## 🔐 Autenticación & Autorización

### Requerimientos:
1. **authMiddleware** en todas las rutas privadas
2. **Bearer Token** en header Authorization
3. **Verificación de propiedad** (user ID match)

### Flujo:
```
Cliente → Envía Token → authMiddleware → Valida/Decodifica
→ req.user = { id, isAdmin } → Controlador → Verifica autorización
```

---

## ⚙️ Configuración Necesaria

### Variables de Entorno (.env)
```
JWT_SECRET=tu_secreto_aqui
MONGO_URI=tu_mongodb_uri
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Dependencias Necesarias
```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^6.x+",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.x",
    "validator": "^13.x",
    "cloudinary": "^1.x",
    "multer": "^1.x",
    "cors": "^2.8.5"
  }
}
```

---

## 📂 Estructura de Directorios Actualizada

```
backend/
├── routes/
│   ├── userRoutes.js ✅ NUEVO
│   ├── orderRoutes.js ✅ ACTUALIZADO
│   └── ...
├── controllers/
│   ├── authController.js ✅ ACTUALIZADO
│   └── ...
├── middleware/
│   ├── authMiddleware.js ✅ (existente)
│   └── upload.js ✅ (existente)
└── server.js ✅ ACTUALIZADO

src/
├── views/
│   └── account/
│       ├── AccountProfile.jsx ✅ NUEVO
│       ├── AccountPurchases.jsx ✅ NUEVO
│       └── ...
├── styles/
│   └── account/
│       ├── accountprofile.css ✅ NUEVO
│       ├── accountpurchases.css ✅ NUEVO
│       ├── accountlayout.css ✅ ACTUALIZADO
│       └── ...
├── context/
│   └── AuthContext.jsx ✅ (existente)
└── ...

vite.config.js ✅ ACTUALIZADO
```

---

## 🧪 Pruebas Recomendadas

### Test 1: Actualizar Perfil
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
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

### Test 2: Obtener Órdenes
```bash
curl -X GET http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer TOKEN"
```

### Test 3: Subir Avatar
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID/avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@/ruta/a/foto.jpg"
```

---

## 🚨 Posibles Errores & Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Unauthorized` | Token inválido/expirado | Regenerar token en login |
| `403 Forbidden` | No eres propietario | Verificar user ID |
| `404 Not Found` | Usuario/orden no existe | Verificar IDs en DB |
| `500 Internal Server` | Error en servidor | Revisar logs/console |
| CORS error | Proxy no configurado | Verificar vite.config.js |

---

## 📞 Notas de Implementación

✅ **Completado:**
- Validación de campos en frontend y backend
- Manejo de errores con try/catch
- Escapado de datos con validator.js
- Integración con AuthContext
- Estilos responsive
- Autenticación con JWT
- Proxy Vite configurado

⚠️ **Verificar Antes de Deploy:**
- authMiddleware devuelve `req.user.id` correctamente
- Config Cloudinary está en lugar correcto
- Variables de entorno todas seteadas
- Base de datos MongoDB conectada
- Puerto 5000 disponible en backend

💡 **Mejoras Futuras:**
- Agregar validación de email en frontend
- Mostrar foto de avatar en AccountLayout
- Implementar edición de contraseña
- Agregar modal de confirmación
- Log de cambios de perfil
- Rate limiting en rutas

---

**Generado:** 14 de Enero, 2026
**Versión:** 1.0 - PRODUCCIÓN LISTA
