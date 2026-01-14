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

## Flujo de integración

### Frontend

- **ProductDetail.jsx**: Botón "Comprar con Mercado Pago" que crea una preferencia directamente desde el producto
- **CheckoutStep4.jsx**: Opción para pagar con Mercado Pago durante el checkout
- **Páginas de resultado**: `/payment/success`, `/payment/failure`, `/payment/pending`

### Backend

- **mercadopagoController.js**: Endpoints para crear preferencias y manejar webhooks
- **mercadopagoRoutes.js**: Rutas de Mercado Pago

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
Webhook para recibir notificaciones de pago. Mercado Pago enviará notificaciones automáticamente cuando el estado de un pago cambie.

### GET /api/mercadopago/payment/:id
Obtiene el estado actual de un pago específico.

## Flujo de compra

1. **Usuario selecciona producto** → Ingresa al ProductDetail o agregado al carrito
2. **Elige "Comprar con Mercado Pago"** → Se crea una preferencia en el backend
3. **Es redirigido a Mercado Pago** → Usuario completa el pago
4. **Mercado Pago lo redirige de vuelta** → A `/payment/success`, `/payment/failure` o `/payment/pending`
5. **Orden se crea en BD** → Con los datos del pago confirmado (próxima implementación)

## Estado actual (Post-Apagón)

✅ **Completado:**
- Servicio de Mercado Pago en frontend (`mercadopagoService.js`)
- Integración en ProductDetail
- Integración en CheckoutStep4
- Controlador backend (`mercadopagoController.js`)
- Rutas backend (`mercadopagoRoutes.js`)
- Páginas de resultado de pago (success, failure, pending)
- Estilos para botones y páginas de pago

⏳ **Pendiente:**
- Conectar webhook para actualizar órdenes automáticamente
- Validación y creación de orden en BD cuando se confirma el pago
- Integración con modelo de Order
- Testing en ambiente de sandbox

## Testing

Para probar en sandbox (no usa dinero real):

1. En `.env` del backend, asegúrate de usar las credenciales de **sandbox**
2. Usa tarjetas de prueba de Mercado Pago (disponibles en su documentación)
3. Verifica los logs en la consola del backend para las notificaciones del webhook

## Documentación oficial

- [Mercado Pago Docs](https://www.mercadopago.com.ar/developers/es/reference)
- [Integración de Checkout](https://www.mercadopago.com.ar/developers/es/guides/checkout-api/introduction)
- [Webhooks](https://www.mercadopago.com.ar/developers/es/guides/webhooks/intro)
