# 🎯 INTEGRACIÓN GO CUOTAS - GUÍA COMPLETA

## 1️⃣ CONFIGURACIÓN DE VARIABLES DE ENTORNO

Agrega a tu archivo `.env` (o crea `.env.local`):

```env
# Go Cuotas
GOCUOTAS_EMAIL=tu_email_de_comercio@example.com
GOCUOTAS_PASSWORD=tu_password_seguro

# Frontend
VITE_API_URL=http://localhost:5000
```

**⚠️ IMPORTANTE**: Las credenciales las obtienes al registrarte en https://www.gocuotas.com/


## 2️⃣ ENDPOINTS DISPONIBLES

### ✅ Crear Checkout
```
POST /api/gocuotas/create-checkout
```

**Request Body:**
```json
{
  "items": [
    {
      "title": "Remera Oversize",
      "description": "Remera de algodón 100%",
      "unit_price": 75.00,
      "quantity": 2,
      "picture_url": "https://..."
    }
  ],
  "totalPrice": 150.00,
  "customerData": {
    "email": "cliente@example.com",
    "name": "Juan Pérez",
    "phone": "1123456789",
    "dni": "40123456",
    "postalCode": "1636"
  },
  "shippingCost": 0,
  "metadata": {
    "orderId": "ORDER-123"
  }
}
```

**Response:**
```json
{
  "id": "checkout_abc123",
  "url_init": "https://www.gocuotas.com/checkout/abc123",
  "status": "pending",
  "orderReference": "order_1706383920000"
}
```

### 🔍 Consultar Estado del Checkout
```
GET /api/gocuotas/checkout/{id}
```

**Response:**
```json
{
  "id": "checkout_abc123",
  "status": "approved",
  "amount_in_cents": 15000000,
  "installments": 3
}
```

**Estados posibles:**
- `pending` - En proceso
- `approved` - Pago aprobado ✅
- `rejected` - Pago rechazado ❌
- `expired` - Expirado
- `cancelled` - Cancelado


### 🔔 Webhook (Automático)
```
POST /api/gocuotas/webhook
```

Go Cuotas envía automáticamente el estado del pago. El backend procesa automáticamente.


### ⚙️ Procesar Pago Manualmente
```
POST /api/gocuotas/process-payment
```

**Request Body:**
```json
{
  "checkoutId": "checkout_abc123",
  "orderReference": "order_1706383920000"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "507f1f77bcf86cd799439011",
  "message": "Pago procesado correctamente"
}
```


## 3️⃣ FLUJO COMPLETO EN FRONTEND

### Paso 1: Crear el Checkout
```javascript
import { createGocuotasCheckout } from "../services/gocuotasService";

async function handlePaymentWithGocuotas() {
  const checkoutData = {
    items: [
      {
        title: "Remera",
        unit_price: 75.00,
        quantity: 2,
      },
    ],
    totalPrice: 150.00,
    customerData: {
      email: "cliente@example.com",
      name: "Juan",
      phone: "1123456789",
      dni: "40123456",
    },
  };

  try {
    const checkout = await createGocuotasCheckout(checkoutData);
    // Redirigir al cliente a Go Cuotas
    window.location.href = checkout.url_init;
  } catch (err) {
    console.error("Error:", err);
  }
}
```

### Paso 2: Go Cuotas redirige de vuelta
Go Cuotas redirige al cliente a:
- **Success**: `https://tuapp.com/payment/success?method=gocuotas&reference=order_123`
- **Cancel**: `https://tuapp.com/payment/cancel?method=gocuotas&reference=order_123`

### Paso 3: Procesar el resultado
```javascript
import { processGocuotasPayment } from "../services/gocuotasService";

async function handlePaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const checkoutId = params.get("checkout_id");
  const orderReference = params.get("order_reference");

  try {
    const result = await processGocuotasPayment(checkoutId, orderReference);
    if (result.success) {
      // Pago exitoso
      window.location.href = `/order-confirmation/${result.orderId}`;
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
```


## 4️⃣ ESTRUCTURA DE DATOS

### Order creada en BD
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "paymentMethod": "gocuotas",
  "paymentId": "checkout_abc123",
  "orderReference": "order_1706383920000",
  "status": "completed",
  "totalPrice": 150.00,
  "shippingCost": 0,
  "items": [...],
  "customerData": {...},
  "metadata": {
    "gocuotasCheckoutId": "checkout_abc123",
    "installments": 3
  },
  "createdAt": "2026-01-14T10:30:00.000Z"
}
```


## 5️⃣ TESTING

### Test en Postman/Bruno

1. **Crear Checkout:**
```
POST http://localhost:5000/api/gocuotas/create-checkout
Body:
{
  "items": [{"title": "Test", "unit_price": 100, "quantity": 1}],
  "totalPrice": 100,
  "customerData": {
    "email": "test@test.com",
    "name": "Test",
    "phone": "1123456789",
    "dni": "40123456"
  }
}
```

2. **Consultar Estado (con ID del response anterior):**
```
GET http://localhost:5000/api/gocuotas/checkout/{id}
```

3. **Procesar Pago:**
```
POST http://localhost:5000/api/gocuotas/process-payment
Body:
{
  "checkoutId": "checkout_abc123",
  "orderReference": "order_1706383920000"
}
```


## 6️⃣ MANEJO DE ERRORES

El backend incluye manejo robusto de errores:

```javascript
try {
  const checkout = await createGocuotasCheckout(data);
} catch (err) {
  // Error de autenticación
  if (err.message.includes("authentication")) {
    // Verificar GOCUOTAS_EMAIL y GOCUOTAS_PASSWORD
  }
  // Error de datos incompletos
  if (err.message.includes("customer")) {
    // Verificar datos del cliente
  }
}
```


## 7️⃣ DETALLES TÉCNICOS

### Autenticación
- El token se obtiene automáticamente en cada petición
- Se cachea por 55 minutos para optimizar
- Se renueva automáticamente cuando expira

### Almacenamiento temporal
- Los datos del checkout se guardan en `global.gocuotasOrders` (memoria)
- En PRODUCCIÓN, considera guardar en Redis o DB para mayor seguridad

### Estados de pago
- `pending` - No procesar aún
- `approved` - Crear orden en BD ✅
- `rejected` - No crear orden ❌
- `cancelled` - No crear orden ❌
- `expired` - No crear orden ❌


## 8️⃣ PRÓXIMOS PASOS

- [ ] Configura credenciales de Go Cuotas
- [ ] Prueba crear un checkout
- [ ] Configura URLs de success/cancel en producción
- [ ] Implementa almacenamiento persistente para checkouts
- [ ] Configura webhook en panel de Go Cuotas
- [ ] Prueba flujo completo de pago


## 📞 SUPPORT

Para problemas:
1. Verifica variables de entorno
2. Revisa logs de consola del backend
3. Consulta documentación de Go Cuotas: https://www.gocuotas.com
4. Contacta al equipo de Go Cuotas
