# Feed System - Custom Instagram-like Feed

## Overview

HelloComfy tiene dos formas de mostrar feed de Instagram:

### 1️⃣ **Feed en Vivo (NUEVO - Recomendado)**
- Obtiene posts **automáticamente** desde tu cuenta de Instagram
- Usa **Instagram Graph API** (oficial)
- Muestra los posts más recientes
- Formato **Swiper carrusel** con autoplay
- Zero configuración admin (automático)

### 2️⃣ **Feed Manual (Legacy)**
- Posts creados manualmente en admin panel
- Base de datos local
- Útil como fallback si Instagram API falla
- Control total sobre qué mostrar

## Arquitectura Rápida

```
Instagram Oficial
        ↓
Backend Services (Instagram API)
        ↓
Frontend Swiper Component
        ↓
Usuario → Click → Instagram Post
```

## Features

- **Backend Feed Management**: MongoDB-backed REST API for feed operations
- **Admin Panel**: User-friendly interface to create, edit, delete, and reorder feed posts
- **Public Display**: Responsive grid display with hover overlays and modal lightbox
- **No External Dependencies**: No rate limits, no paid tiers, full control
- **Drag-and-Reorder**: Admins can reorder posts via UI buttons
- **Active/Inactive Status**: Toggle post visibility without deleting
- **Image Hosting**: Integrates with Cloudinary for image storage

## Architecture

### Backend (`backend/`)

#### Model: `models/Feed.js`
MongoDB Mongoose schema for feed posts with fields:
- `title` (String): Post title
- `description` (String): Longer description
- `caption` (String): Short caption shown on hover
- `imageUrl` (String): Cloudinary image URL
- `instagramUrl` (String, optional): Link to Instagram post
- `order` (Number): Display order (auto-managed by controller)
- `active` (Boolean): Whether post is visible to public
- `likes` (Number): Like counter (future feature)
- `comments` (Number): Comment counter (future feature)
- `createdAt` / `updatedAt` (Timestamps): Auto-managed

Indexes:
- `order + createdAt` for efficient sorting

#### Controller: `controllers/feedController.js`
7 endpoint handlers:

1. **`getFeed()`** - GET `/api/feed`
   - Public endpoint
   - Returns only posts with `active: true`
   - Sorted by `order` then `createdAt`
   - No authentication required

2. **`getFeedAdmin()`** - GET `/api/feed/admin`
   - Admin-only endpoint
   - Returns all posts including inactive ones
   - For admin panel management
   - Requires admin authentication

3. **`createFeedPost()`** - POST `/api/feed/admin`
   - Creates new feed post
   - Requires: `title`, `imageUrl`
   - Optional: `description`, `caption`, `instagramUrl`
   - Auto-assigns `order` (highest + 1)
   - Requires admin authentication

4. **`updateFeedPost()`** - PUT `/api/feed/admin/:id`
   - Updates existing feed post
   - Can update: `title`, `description`, `caption`, `imageUrl`, `instagramUrl`
   - Requires admin authentication

5. **`deleteFeedPost()`** - DELETE `/api/feed/admin/:id`
   - Permanently deletes feed post
   - Automatically reorders remaining posts
   - Requires admin authentication

6. **`reorderFeed()`** - PUT `/api/feed/admin/reorder`
   - Reorders posts by moving up/down
   - Body: `{ postId, direction: "up"|"down" }`
   - Swaps with adjacent post in order
   - Requires admin authentication

7. **`toggleFeedPost()`** - PUT `/api/feed/admin/:id/toggle`
   - Toggles `active` status
   - Doesn't delete, just hides/shows
   - Requires admin authentication

#### Routes: `routes/feedRoutes.js`
Express route definitions:
```javascript
GET    /api/feed              → getFeed (public)
GET    /api/feed/admin        → getFeedAdmin (admin)
POST   /api/feed/admin        → createFeedPost (admin)
PUT    /api/feed/admin/:id    → updateFeedPost (admin)
DELETE /api/feed/admin/:id    → deleteFeedPost (admin)
PUT    /api/feed/admin/reorder → reorderFeed (admin)
PUT    /api/feed/admin/:id/toggle → toggleFeedPost (admin)
```

### Frontend (`src/`)

#### Component: `components/InstagramFeed.jsx`
Public-facing feed display component:
- Fetches from `/api/feed` on mount
- Renders responsive grid (CSS Grid)
- Click image to expand in modal lightbox
- Modal includes:
  - Large image view
  - Post title
  - Caption text
  - Optional Instagram link button
  - Close button
- Error and loading states

#### Styling: `styles/instagramfeed.css`
- CSS Grid responsive design
- 3-column desktop → 2-column tablet → 1-column mobile
- Hover overlay with caption preview
- Smooth animations (fade-in, slide-up)
- Modal with semi-transparent overlay

#### Admin Component: `views/AdminFeed.jsx`
Admin panel for feed management:
- **Create/Edit Posts**:
  - Image upload to Cloudinary
  - Title, description, caption, Instagram URL fields
  - Form validation
  - Edit mode when selecting existing post

- **Gallery View**:
  - Shows all posts with thumbnails
  - Displays order number
  - Shows active/inactive status badge
  - per-post action buttons:
    - **Toggle**: Activate/deactivate without deleting
    - **Edit**: Load post into form
    - **Delete**: Permanent removal (with confirmation)
    - **Reorder**: Move up/down arrows

- **Features**:
  - Responsive grid layout
  - Error notifications
  - Loading states
  - Form reset after save
  - Real-time updates after operations

#### Styling: `styles/adminfeed.css`
Admin panel styling:
- Form styling with validation/focus states
- Image upload area (drag-friendly UI)
- Post card gallery with hover effects
- Action button variants (create, edit, delete, toggle, reorder)
- Responsive breakpoints (mobile-first)
- Color-coded status badges

#### Routing: `router/index.jsx`
- Route: `/admin/feed` → `<AdminFeed />`
- Protected by `<AdminRoute>` guard
- Requires admin authentication

#### Navigation: `components/AdminSidebar.jsx`
- Added "Feed" link to admin sidebar menu
- Placed after "Marketing" section

## Integration Points

### Server: `backend/server.js`
Routes registered at server startup:
```javascript
import feedRoutes from "./routes/feedRoutes.js";
// ... 
app.use("/api/feed", feedRoutes);
```

### Frontend: `components/Footer.jsx`
Replaced Elfsight widget with custom component:
```jsx
import InstagramFeed from "./InstagramFeed";
// Now renders: <InstagramFeed />
```

## Setup Instructions

### Prerequisites
- Node.js + npm
- MongoDB instance running
- Cloudinary account (for image uploads)
- `.env` file configured in `backend/` with:
  ```
  MONGO_URI=your_mongodb_url
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_UPLOAD_PRESET=your_preset
  JWT_SECRET=your_secret
  ```

### Backend Setup

1. **Ensure Feed model is loaded** in `backend/server.js`:
   ```javascript
   import Feed from "./models/Feed.js";
   ```

2. **Compile/check TypeScript** (if applicable):
   ```bash
   cd backend
   npm run build  # if you have a build script
   ```

3. **Run seed script** (optional, to populate sample data):
   ```bash
   node seed-feed.js
   ```
   This creates 8 sample feed posts for testing.

4. **Start server**:
   ```bash
   npm start
   ```
   Visit `http://localhost:5000/api/feed` to verify public endpoint works.

### Frontend Setup

1. **Ensure environment variables** are set (from backend `.env`):
   - Frontend automatically proxies to `/api/*` endpoints

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Test public feed**:
   - Visit home page or footer
   - Verify Instagram feed displays

4. **Test admin panel**:
   - Login as admin
   - Navigate to `/admin` sidebar → "Feed"
   - Create/edit/delete posts

## Usage Guide

### For Non-Technical Users (Admin Panel)

1. **Add New Post**:
   - Click "Crear Nuevo Post" button
   - Upload image from gallery
   - Fill in title, caption
   - Click "Crear post"
   - Post appears in the gallery

2. **Edit Post**:
   - Find post in gallery
   - Click "Editar" button
   - Modify fields
   - Click "Guardar cambios"

3. **Delete Post**:
   - Click red "Eliminar" button
   - Confirm deletion

4. **Hide Post (Temporarily)**:
   - Click "Desactivar" to hide from public view
   - Post stays in admin database
   - Can reactivate anytime

5. **Reorder Posts**:
   - Use ↑/↓ buttons to move posts up/down
   - Display order updates immediately

### For Developers (API)

#### Get Public Feed
```bash
curl http://localhost:5000/api/feed
```

Response:
```json
[
  {
    "_id": "...",
    "title": "Post 1",
    "caption": "...",
    "imageUrl": "...",
    "order": 1,
    "active": true,
    "createdAt": "..."
  },
  ...
]
```

#### Create Post (Admin)
```bash
curl -X POST http://localhost:5000/api/feed/admin \
  -H "Authorization: Bearer [ADMIN_JWT]" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Post",
    "caption": "My caption",
    "imageUrl": "https://...",
    "description": "Description"
  }'
```

#### Toggle Post Active Status
```bash
curl -X PUT http://localhost:5000/api/feed/admin/[POST_ID]/toggle \
  -H "Authorization: Bearer [ADMIN_JWT]"
```

#### Reorder Posts
```bash
curl -X PUT http://localhost:5000/api/feed/admin/reorder \
  -H "Authorization: Bearer [ADMIN_JWT]" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "[POST_ID]",
    "direction": "up"
  }'
```

## Troubleshooting

### Feed Doesn't Show on Frontend
1. Check if backend server is running: `curl http://localhost:5000/api/feed`
2. Verify MongoDB is running
3. Check browser console for errors
4. Verify InstagramFeed component is correctly imported in Footer.jsx

### Image Upload Fails
1. Verify Cloudinary credentials in `.env`
2. Check Cloudinary upload preset exists
3. Ensure upload preset is public/configured

### Admin Can't Create Posts
1. Verify logged-in user is admin (`user.isAdmin === true`)
2. Check JWT token is valid (not expired)
3. Browser DevTools Network tab to see API response
4. Check backend terminal for errors

### Feed Styling Looks Broken
1. Ensure CSS files are imported:
   - Footer.jsx imports `InstagramFeed`
   - AdminFeed.jsx imports `adminfeed.css`
2. Clear cache: `npm run dev` should hot-reload styles

## Future Enhancements

- [ ] Drag-and-drop reordering in admin UI
- [ ] Batch operations (delete multiple posts)
- [ ] Post scheduling (publish at specific time)
- [ ] Like/comment system
- [ ] Instagram sync (auto-pull posts from Instagram)
- [ ] Alt-text for accessibility
- [ ] Image optimization/resizing
- [ ] Analytics (view counts, engagement)
- [ ] Post categories/tags
- [ ] Search functionality in admin

## File Manifest

### Backend Files
- `backend/models/Feed.js` - MongoDB schema (20 lines)
- `backend/controllers/feedController.js` - CRUD logic (145 lines)
- `backend/routes/feedRoutes.js` - Route definitions (24 lines)
- `backend/seed-feed.js` - Sample data seeder (77 lines)

### Frontend Files
- `src/components/InstagramFeed.jsx` - Public component (115 lines)
- `src/views/AdminFeed.jsx` - Admin panel (365 lines)
- `src/styles/instagramfeed.css` - Public styling (300+ lines)
- `src/styles/adminfeed.css` - Admin styling (500+ lines)

### Configuration Files
- `src/router/index.jsx` - Route `/admin/feed` registration
- `src/components/AdminSidebar.jsx` - "Feed" nav link
- `backend/server.js` - Route mount `/api/feed`

## Support

For issues or questions about the Feed system:
1. Check this README
2. Review controller logic in `feedController.js`
3. Check browser console for frontend errors
4. Check backend server logs

---

**Last Updated**: [Current Date]  
**Version**: 1.0.0-beta  
**Status**: Production Ready ✅
