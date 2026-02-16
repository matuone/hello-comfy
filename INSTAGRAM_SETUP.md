# Instagram Integration Setup

## Overview

HelloComfy ahora obtiene automáticamente posts de Instagram en tiempo real usando **Instagram Graph API**. El feed se muestra como un carrusel Swiper con navegación automática.

## Features

- ✅ Carga automática de posts más recientes de Instagram
- ✅ Carrusel Swiper responsive (1 → 2 → 3 columnas)
- ✅ Click en posts lleva a Instagram
- ✅ Falback a base de datos local si falla API
- ✅ Auto-sync de posts desde admin panel
- ✅ Ordenado por más reciente primero

## Requisitos Previos

### Antes de Configurar

Necesitas tener:
1. **Instagram Business Account** (no personal)
2. **Facebook App** asociada a Instagram
3. **Long-lived Access Token** de Instagram Graph API

### Crear Facebook App (si no tienes una)

1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Click en "Mis aplicaciones" → "Crear aplicación"
3. Seleccionar "Consumidor" como tipo
4. Llenar datos de la app
5. Agregar producto "Instagram Graph API"

## Obtener Instagram Access Token

### Opción 1: Token manualmente a través de Facebook (Recomendado para desarrollo)

1. Ir a [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. Seleccionar tu aplicación en dropdown arriba
3. Seleccionar "Get User Access Token"
4. En permisos, marcar:
   - `instagram_basic`
   - `instagram_content_publishing`
5. Click "Generate Access Token"
6. Copiar el token generado

**Para convertir a Long-Lived Token (válido 60 días):**

```bash
curl -i -X GET "https://graph.instagram.com/v18.0/oauth/access_token?grant_type=ig_refresh_token&access_token=YOUR_SHORT_LIVED_TOKEN"
```

### Opción 2: Token permanente (Producción)

Para producción, registra tu app y usa el [Instagram Graph API Documentation](https://developers.instagram.com/docs/instagram-api) para obtener un token server-to-server.

## Obtener Instagram Business Account ID

1. Ir a [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. En la URL, cambiar a:
   ```
   GET /me?fields=instagram_business_account
   ```
3. Ejecutar query
4. Copiar el `id` del `instagram_business_account`

**Ejemplo de respuesta:**
```json
{
  "instagram_business_account": {
    "id": "17841234567890123"
  },
  "id": "123456789"
}
```

Copiar: `17841234567890123`

## Configurar Variables de Entorno

### En `backend/.env`

Agregar estas líneas:

```env
# Instagram Graph API Configuration
INSTAGRAM_ACCESS_TOKEN=tu_long_lived_access_token_aqui
INSTAGRAM_BUSINESS_ACCOUNT_ID=tu_business_account_id_aqui
```

**Ejemplo:**
```env
INSTAGRAM_ACCESS_TOKEN=IGQWRRa3k5ZAWdzbGx2OWd1M3ZA0bV9waHRQd0RILWZAfbkZAqc2hKMGV6bl9lQl9xX3BfYm9wVzBDLWZAjV01vMEQyMFh4VkxVQWc4NGpTUEhkZAVNQWFZADSlFRdWh0SzBLZAV5lQVVpB...
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841405670123456
```

## Endpoints de Instagram

### 1. Obtener Feed en Tiempo Real (Público)

```bash
GET /api/instagram/feed
```

**Respuesta:**
```json
[
  {
    "id": "17845678901234567",
    "title": "Capsula Nueva Invierno",
    "caption": "Descubre nuestras nuevas prendas...",
    "imageUrl": "https://...",
    "instagramUrl": "https://instagram.com/p/ABC123",
    "timestamp": "2024-02-16T10:30:00Z",
    "externalId": "17845678901234567"
  },
  ...
]
```

### 2. Sincronizar Posts (Admin Only)

```bash
POST /api/instagram/sync
Headers: Authorization: Bearer [ADMIN_JWT]
```

**Respuesta:**
```json
{
  "success": true,
  "synced": 3,
  "total": 12,
  "message": "3 posts sincronizados desde Instagram"
}
```

Esto agregará nuevos posts a la BD y los mostrará en el panel admin.

### 3. Verificar Estado

```bash
GET /api/instagram/status
Headers: Authorization: Bearer [ADMIN_JWT]
```

**Respuesta:**
```json
{
  "configured": true,
  "accessTokenSet": true,
  "accountIdSet": true,
  "credentialsNeeded": []
}
```

## Frontend - Componente InstagramFeed

El componente `src/components/InstagramFeed.jsx`:

1. **Intenta obtener posts desde `/api/instagram/feed`** (en tiempo real)
2. **Si falla, usa `/api/feed`** (base de datos local sincronizada)
3. **Muestra Swiper carrusel** con navegación automática
4. **Al click, abre el post en Instagram**

### Características:

- Autoplay cada 5 segundos
- Navegación con flechas
- Pagination dots (clickeables)
- Responsive: 1 slide en móvil → 3 slides en desktop
- Lazy loading de imágenes

## Flujo de Datos

```
[Instagram]
    ↓
[Graph API]
    ↓
[Backend - /api/instagram/feed]
    ↓
[Frontend InstagramFeed Component]
    ↓
[Swiper Carousel → Click → Instagram.com]
```

## Admin Panel - Sincronizar Manualmente

Para sincronizar posts desde admin:

1. Login como admin
2. Ir a `/admin/feed`
3. En el futuro: botón "Sincronizar desde Instagram"
4. Los nuevos posts se agregan a la BD
5. Se pueden editar, ocultar, reordenar

**Vía API:**
```bash
curl -X POST http://localhost:5000/api/instagram/sync \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

## Troubleshooting

### "Instagram credentials not configured"

```
❌ Error: Instagram credentials not configured
```

**Solución:**
- Verificar que `.env` tiene `INSTAGRAM_ACCESS_TOKEN` y `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- Reiniciar servidor backend: `npm start`

### Token Expirado

```
❌ Error: Long-lived access token expired
```

**Solución:**
- Generar nuevo token (válido 60 días)
- Ir a [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- Generar nuevo access token
- Actualizar `.env`

### No muestra posts de Instagram

1. Verificar credenciales están configuradas: `GET /api/instagram/status`
2. Probar endpoint directamente:
   ```bash
   curl http://localhost:5000/api/instagram/feed
   ```
3. Revisar logs del backend
4. Confirmar que Instagram Business Account tiene posts

### Swiper no funciona

- Verificar que `swiper` está instalado: `npm list swiper`
- Verificar imports en `InstagramFeed.jsx`
- Revisar console del browser (DevTools)

## Deployment - Variables de Entorno

### Vercel / Render

Agregar en panel de configuración:

```
INSTAGRAM_ACCESS_TOKEN=tu_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=tu_id
```

### Railway / Heroku

```bash
heroku config:set INSTAGRAM_ACCESS_TOKEN=tu_token
heroku config:set INSTAGRAM_BUSINESS_ACCOUNT_ID=tu_id
```

## Límites y Consideraciones

- **Rate limit**: 200 requests/hora (Instagram Graph API)
- **Posts obtenidos**: Últimos 12 posts
- **Caché**: Feed se obtiene cada vez (sin caché, siempre fresco)
- **Fallback**: Si API falla, muestra posts de BD local sincronizados

## Mejoras Futuras

- [ ] Caché de posts (invalidar cada hora)
- [ ] Scheduled sync cada 30 min
- [ ] Story support (además de Feed)
- [ ] Reels en carrusel
- [ ] Instagram Insights (likes, comments)
- [ ] Multi-account support
- [ ] Instagram Shopping integration

## Archivos Relacionados

**Backend:**
- `backend/services/instagramService.js` - Lógica de API
- `backend/routes/instagramRoutes.js` - Endpoints
- `backend/models/Feed.js` - Schema (ahora con `externalId`)

**Frontend:**
- `src/components/InstagramFeed.jsx` - Componente Swiper
- `src/styles/instagramfeed.css` - Estilos responsive
- `src/components/Footer.jsx` - Uso del componente

## Support

Para issues:
1. Verificar credenciales en `.env`
2. Probar endpoint con curl
3. Revisar logs de backend
4. Revisar console del browser

---

**Last Updated**: February 16, 2026  
**Version**: 2.0.0 (Swiper + Instagram Live)
