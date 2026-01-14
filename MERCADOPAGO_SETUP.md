# Integración de Mercado Pago

## Configuración necesaria

Para que la integración de Mercado Pago funcione correctamente, necesitas configurar las siguientes variables de entorno en el archivo `.env` del backend:

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR_[Tu Access Token aquí]
MERCADOPAGO_PUBLIC_KEY=APP_USR_[Tu Public Key aquí]

# URLs de retorno
FRONTEND_URL=http://localhost:5173  # O tu URL de producción
API_URL=http://localhost:5000       # O tu URL de API de producción
```

## Obtener credenciales de Mercado Pago

1. Crea una cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Ve a la sección "Mis integraciones"
3. Crea una nueva aplicación
4. Obtén tu **Access Token** y **Public Key** desde el dashboard

## Flujo de integración completo

### 1. Frontend - Crear preferencia
- Usuario selecciona producto en ProductDetail o agrega al carrito
- Elige "Comprar con Mercado Pago"
- Se llama a `crearPreferenciaMercadoPago()` que envía datos al backend
- Se guarda la orden pendiente en localStorage

### 2. Backend - Crear preferencia
- POST `/api/mercadopago/create-preference` recibe los datos
- Se construye la preferencia con los items, cliente y URLs de retorno
- Se envía a la API de Mercado Pago
- Se retorna `init_point` (URL de Mercado Pago)

### 3. Redireccionamiento
- Usuario es redirigido a `init_point` de Mercado Pago
- Completa el pago

### 4. Retorno - Páginas de resultado
- Mercado Pago redirige a `/payment/success`, `/payment/failure` o `/payment/pending`
- PaymentSuccess.jsx:
  - Obtiene `payment_id` de los query params
  - Recupera la orden pendiente del localStorage
  - Llama a `procesarPagoConfirmado()` en el backend
  - Se crea la orden en BD
  - Se muestra el código de orden al usuario

### 5. Backend - Procesar pago
- POST `/api/mercadopago/process-payment` recibe:
  - `paymentId`: ID del pago de Mercado Pago
  - `pendingOrderData`: Datos de la orden guardada
- Se obtienen detalles del pago desde la API de Mercado Pago
- Se valida que el pago sea aprobado o esté pendiente
- Se crea la orden en BD usando `crearOrdenDesdePago()`
- Se retorna el código de orden

### 6. Webhook - Notificaciones
- Mercado Pago envía notificaciones de cambios de estado
- POST `/api/mercadopago/webhook` recibe la notificación
- Se extrae el `payment_id` y se obtienen detalles del pago
- Se actualiza el estado en BD usando `actualizarEstadoPago()`

## Endpoints

### POST /api/mercadopago/create-preference
Crea una preferencia de pago en Mercado Pago.

**Request:**
```json
{
  "items": [
    {
      "title": "Remera CUTE DOG",
      "description": "Talle: M, Color: Beige",
      "picture_url": "https://...",
      "quantity": 1,
      "unit_price": 25000
    }
  ],
  "totalPrice": 25000,
  "customerData": {
    "email": "cliente@example.com",
    "name": "Juan Pérez",
    "phone": "+541123456789"
  },
  "metadata": {
    "productId": "...",
    "size": "M",
    "color": "Beige"
  }
}
```

**Response:**
```json
{
  "id": "preference_id",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

### POST /api/mercadopago/webhook
Webhook para recibir notificaciones de pago automáticamente desde Mercado Pago.

**Parámetros:**
- `type=payment` - Tipo de notificación
- `data.id` - ID del pago

### GET /api/mercadopago/payment/:id
Obtiene el estado actual de un pago específico.

### POST /api/mercadopago/process-payment
Procesa un pago confirmado y crea la orden en BD.

**Request:**
```json
{
  "paymentId": "123456789",
  "pendingOrderData": {
    "formData": {
      "email": "cliente@example.com",
      "name": "Juan Pérez",
      "shippingMethod": "home",
      "address": "..."
    },
    "items": [...],
    "totalPrice": 25000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pago procesado correctamente",
  "order": {
    "code": "ORD-1705246800000-ABC123XYZ",
    "email": "cliente@example.com",
    "status": "recibido",
    "total": 25000
  }
}
```

## Servicios backend

### orderService.js
- `crearOrdenDesdePago()` - Crea orden en BD desde datos de pago
- `actualizarEstadoPago()` - Actualiza estado de pago de orden existente
- `obtenerOrdenPorCodigo()` - Obtiene orden por código
- `obtenerOrdenesPorEmail()` - Obtiene órdenes de un cliente

## Estado actual

✅ **Completado:**
- Servicio de Mercado Pago en frontend
- Integración en ProductDetail y CheckoutStep4
- Controlador backend con webhook mejorado
- Rutas de API
- Páginas de resultado de pago (success, failure, pending)
- Servicio de órdenes (`orderService.js`)
- Endpoint para procesar pagos confirmados
- Creación automática de órdenes en BD
- Actualizaciones de estado vía webhook

⏳ **Próximas mejoras:**
- Envío de email de confirmación
- Integración con Facturante para generar facturas automáticamente
- Webhook en tiempo real (actualizar en vivo sin recargar)
- Retries automáticos para fallos de pago
- Dashboard de pagos en admin panel

## Testing

### En Sandbox (sin dinero real)
1. Usa tarjetas de prueba de Mercado Pago:
   - **Aprobada**: 4111 1111 1111 1111
   - **Rechazada**: 4000 0000 0000 0002
   - **Pendiente**: 4000 0000 0000 0010

2. Cualquier CCV y fecha futura

3. En `.env` usa credenciales de **sandbox**

### En Producción
1. Usa credenciales de **producción**
2. Configura webhook en dashboard de Mercado Pago
3. URL: `https://tu-dominio.com/api/mercadopago/webhook`

## Documentación oficial

- [Mercado Pago Docs](https://www.mercadopago.com.ar/developers/es/reference)
- [Integración de Checkout](https://www.mercadopago.com.ar/developers/es/guides/checkout-api/introduction)
- [Webhooks](https://www.mercadopago.com.ar/developers/es/guides/webhooks/intro)
- [Tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/guides/resources/localization/test-cards)
