# Instagram Feed Automático & Swiper - Guía Rápida

## ¿Qué se implementó?

✅ **Feed de Instagram en Vivo**  
✅ **Carrusel Swiper (no Grid estático)**  
✅ **Posts ordenados de más reciente a antiguo**  
✅ **Click abre post en Instagram automáticamente**  
✅ **Responsive y autoplay cada 5 segundos**

---

## Flujo de Datos

```
[Tu Instagram] → [Graph API] → [Backend /api/instagram/feed] → [Swiper Frontend] → [Click = Instagram]
```

---

## Setup Rápido (5 minutos)

### 1. Obtener Credenciales de Instagram

Ir a: **[Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer)**

**A) Conseguir Access Token:**
- Click en "Get User Access Token"
- Marcar permisos: `instagram_basic`, `instagram_content_publishing`
- Copiar token generado
- **Convertir a Long-Lived (válido 60 días):**
  ```bash
  curl "https://graph.instagram.com/v18.0/oauth/access_token?grant_type=ig_refresh_token&access_token=TU_TOKEN_CORTO"
  ```
- Copiar el token largo resultante

**B) Conseguir Business Account ID:**
- En Graph API Explorer, cambiar query a: `GET /me?fields=instagram_business_account`
- Copiar el ID: `17841234567890123`

### 2. Agregar Variables a `.env`

**File:** `backend/.env`

```env
INSTAGRAM_ACCESS_TOKEN=tu_long_lived_token_aqui
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841234567890123
```

### 3. Reiniciar Backend

```bash
cd backend
npm start
```

### 4. ¡Listo! 

Footer automáticamente mostrará:
- Últimos posts de Instagram
- En formato Swiper (carrusel)
- Con navegación automática
- Click abre Instagram

---

## Endpoints de API

### Obtener Feed (Público)
```bash
GET /api/instagram/feed
```
Respuesta: Array de últimos 12 posts de Instagram

### Sincronizar a BD (Admin)
```bash
POST /api/instagram/sync
Authorization: Bearer [ADMIN_TOKEN]
```
Guarda posts en la BD para respaldo

### Ver Estado (Admin)
```bash
GET /api/instagram/status
Authorization: Bearer [ADMIN_TOKEN]
```
Verifica si está configurado correctamente

---

## Características del Swiper

| Feature | Comportamiento |
|---------|----------------|
| **Slides** | 1 → 2 → 3 columnas (responsive) |
| **Navegación** | Flechas left/right |
| **Pagination** | Dots clickeables |
| **Autoplay** | 5 segundos (pausa al interactuar) |
| **On Click** | Abre post en Instagram |
| **Overflow** | Scroll en móvil |

---

## Troubleshooting

### ❌ "Instagram credentials not configured"
```
Solución: Verificar .env tiene ambas variables
Reiniciar: npm start
```

### ❌ No aparecen posts
```
1. Verificar endpoint: curl http://localhost:5000/api/instagram/feed
2. Ver logs del backend
3. Confirmar que Instagram Business tiene posts
```

### ❌ Token expirado
```
Pasos:
1. Obtener nuevo token en Graph API Explorer
2. Actualizar INSTAGRAM_ACCESS_TOKEN en .env
3. Reiniciar servidor
```

### ❌ Swiper no muestra carrusel
```
1. npm list swiper (verificar instalado)
2. Revisar console en DevTools
3. Limpiar cache: npm run dev
```

---

## Archivos Importantes

### Backend
- **`backend/services/instagramService.js`** - Lógica de Graph API
- **`backend/routes/instagramRoutes.js`** - Endpoints `/api/instagram/*`
- **`backend/.env.example`** - Variables necesarias

### Frontend
- **`src/components/InstagramFeed.jsx`** - Componente Swiper
- **`src/styles/instagramfeed.css`** - Estilos responsivos
- **`src/components/Footer.jsx`** - Integración (usa InstagramFeed)

### Documentación
- **`INSTAGRAM_SETUP.md`** - Guía completa y detallada

---

## Validar que Funciona

### 1. Terminal Backend
```bash
cd backend && npm start
# Buscar: "Server corriendo en http://localhost:5000"
```

### 2. Terminal Frontend
```bash
npm run dev
# Buscar: "VITE v... ready in XXX ms"
```

### 3. Browser
```
http://localhost:5173
↓ Scroll al footer
↓ Deberías ver carrusel de Instagram
↓ Click en imagen abre Instagram
```

### 4. Verificar API Directamente
```bash
curl http://localhost:5000/api/instagram/feed
# Deberías ver JSON array de posts
```

---

## Fallback (Si Instagram falla)

Si por algún motivo no se conecta a Instagram:
- Automáticamente muestra posts sincronizados en BD (`/api/feed`)
- Los posts se pueden crear manualmente en admin panel `/admin/feed`
- No hay error visible para el usuario (graceful degradation)

---

## Próximas Mejoras (Futuro)

- [ ] Caché de posts (30 min - evitar rate limit)
- [ ] Sincronización automática (cron cada hora)
- [ ] Stories en carrusel
- [ ] Reels en carrusel
- [ ] Instagram Insights (likes, comments)
- [ ] Multi-cuenta Instagram

---

## Videos/Links Útiles

- 📚 [Instagram Graph API Docs](https://developers.instagram.com/docs/instagram-api)
- 🔑 [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer)
- 🎡 [Swiper Documentation](https://swiperjs.com/)
- 🎬 [Tutorial: Get Instagram Access Token](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started)

---

## ¿Preguntas?

1. Leer **INSTAGRAM_SETUP.md** (guía completa)
2. Revisar logs del backend
3. DevTools → Network tab (ver requests)
4. Verificar variables en `.env`

---

**Status**: ✅ Production Ready  
**Last Updated**: February 16, 2026  
**Version**: 2.0 (Swiper + Instagram Live)
