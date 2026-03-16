# HelloComfy — Documentación Completa

Este documento describe toda la arquitectura, estructura y funcionamiento del panel administrativo de HelloComfy. Está diseñado para que cualquier desarrollador o IA pueda entender, mantener y extender el proyecto sin explicaciones adicionales.

---

# 1. Introducción

HelloComfy es un e-commerce con:

- Frontend en React
- Backend en Node + Express + MongoDB
- Panel administrativo completo
- Gestión de productos, ventas, clientes, marketing y más

El proyecto está diseñado para ser modular, escalable y fácil de extender.

---

# 2. Arquitectura general

## Frontend
- React + Vite
- React Router
- CSS modular por vista
- Estado local por componente
- Fetch directo al backend
- Persistencia local para marketing

## Backend
- Node + Express
- MongoDB (Mongoose)
- Endpoints:
  - /api/products
  - /api/stock
  - /api/sales (futuro)
  - /api/customers (futuro)
- Upload de imágenes locales en /uploads

## Admin Panel
- Layout persistente
- Sidebar fijo
- Contenido dinámico con Outlet
- Módulos independientes

---

# 3. Convenciones internas

## Nombres
- Archivos en inglés
- Texto en español
- Variables en español
- Componentes en PascalCase
- CSS en kebab-case

## CSS
- Un archivo por vista
- Clases con prefijo del módulo
- Nada global salvo resets

## Fetch
- Siempre http://localhost:5000/api/...
- Adaptación de datos en el frontend
- Manejo de errores con notificaciones

## Estado
- useState por campo
- useEffect para cargar datos
- Validación manual por campo

---

# 4. Estructura de carpetas

src/
├─ components/
│    ├─ AdminSidebar.jsx
│    ├─ Notification.jsx
│    ├─ ConfirmModal.jsx
│    └─ FloatingBear.jsx
│
├─ views/
│    ├─ AdminLayout.jsx
│    ├─ AdminProducts.jsx
│    ├─ AdminProductDetail.jsx
│    ├─ AdminSales.jsx
│    ├─ AdminSaleDetail.jsx
│    ├─ AdminCustomers.jsx
│    ├─ AdminCustomerDetail.jsx
│    ├─ AdminMarketing.jsx
│    └─ NotFound.jsx
│
├─ styles/
│    ├─ admin.css
│    ├─ adminproducts.css
│    ├─ adminproductdetail.css
│    ├─ adminsaledetail.css
│    ├─ adminsales.css
│    ├─ admincustomers.css
│    ├─ admincustomerdetail.css
│    ├─ adminmarketing.css
│    └─ notfound.css
│
├─ data/
│    └─ salesData.js
│
└─ router/
└─ AppRouter.jsx


---

# 5. Mapa de rutas del Admin

/admin
/admin/sales
/admin/sales/:id
/admin/products
/admin/products/new
/admin/products/:id
/admin/stock
/admin/customers
/admin/customers/:email
/admin/customers/:email/edit
/admin/stats
/admin/marketing
/admin/discounts
/admin/promocodes


---

# 6. Mapa de componentes del Admin

AdminLayout
├─ AdminSidebar
└─ Outlet
├─ AdminSales
│    └─ AdminSaleDetail
├─ AdminProducts
│    └─ AdminProductDetail
├─ AdminCustomers
│    └─ AdminCustomerDetail
├─ AdminMarketing
├─ AdminStock (futuro)
├─ AdminStats (futuro)
├─ AdminDiscounts (futuro)
└─ AdminPromoCodes (futuro)


---

# 7. Módulos del Admin

## 7.1 AdminLayout
Layout base del panel:

- Sidebar fijo
- Header del admin
- Contenido dinámico con Outlet

Estructura:

admin-shell
├─ admin-sidebar
└─ admin-main
├─ header
└─ content


---

## 7.2 AdminSidebar
Navegación principal del admin.

Incluye:

- General
- Ventas
- Productos
- Stock
- Clientes
- Estadísticas
- Marketing
- Descuentos
- Códigos promocionales

Usa NavLink para resaltar la sección activa.

---

## 7.3 AdminProducts
Gestión completa del catálogo:

- Carga de productos
- Carga de stock
- Duplicación completa
- Eliminación
- Filtrado
- Modificación masiva de precios
- Filas expandibles
- Notificaciones

Incluye:

- Tabla con imagen, categoría, precio, stock
- Panel de aumento masivo
- Acciones: editar, duplicar, eliminar
- Detalle expandible con fotos y talles

---

## 7.4 AdminProductDetail
Módulo avanzado:

- Creación y edición
- Validación completa
- Subida de imágenes con compresión
- Drag and drop
- Marcar imagen principal
- Duplicar producto
- Eliminar producto

Campos:

- Nombre
- Categoría
- Subcategoría
- Color
- Precio
- Descripción
- Guía de talles
- Imágenes

---

## 7.5 AdminSales
Gestión de ventas:

- Buscador
- Selección masiva
- Dropdown de acciones
- Marcar pago recibido
- Agregar seguimiento
- Filas expandibles
- Métodos de envío con iconos

Acciones masivas:

- Cancelar
- Archivar
- Marcar pagos
- Empaquetar
- Notificar envío
- Imprimir
- Facturación masiva
- Registrar en Correo Argentino
- Descargar etiquetas Andreani

---

## 7.6 AdminSaleDetail
Detalle completo de una venta:

- Producto
- Cliente
- Dirección
- Envío
- Historial
- Comentarios
- Copiar código de seguimiento
- Dropdowns de acciones

---

## 7.7 AdminCustomers
CRM interno:

- Buscador
- Filtros avanzados
- Total consumido
- Última compra
- Ticket promedio
- Link al detalle del cliente

Cruza datos con salesData.

---

## 7.8 AdminCustomerDetail
Detalle del cliente:

- Datos personales
- Estadísticas
- Historial de compras
- Contacto directo (email / WhatsApp)
- Link a ventas

---

## 7.9 AdminMarketing
Gestión de mensajes promocionales:

- Banner principal
- Mensaje del osito flotante
- Persistencia en localStorage
- Evento global bearMessageUpdated
- Vista previa del banner

---

# 8. Flujo de datos entre módulos

## Productos
- AdminProducts → lista
- AdminProductDetail → edición
- Stock → /api/stock

## Ventas
- AdminSales → lista
- AdminSaleDetail → detalle
- AdminCustomers → cruza ventas por email
- AdminCustomerDetail → reconstruye cliente

## Marketing
- AdminMarketing → localStorage
- FloatingBear.jsx escucha cambios

---

# 9. Cómo extender el panel admin

## Agregar una nueva sección
1. Crear vista en /src/views/Nombre.jsx
2. Crear CSS en /src/styles/nombre.css
3. Agregar ruta en el router
4. Agregar link en AdminSidebar
5. Mantener estructura:
   - Título
   - Subtítulo
   - Toolbar
   - Tabla o formulario
   - Notificaciones

## Agregar un campo a productos
1. Agregar estado + input en AdminProductDetail
2. Agregar campo al payload
3. Mostrarlo en AdminProducts si corresponde
4. Actualizar backend

## Agregar método de envío
1. Agregar string en AdminSales
2. Agregar icono en AdminSaleDetail
3. Actualizar backend

---

# 10. IA Collaboration Mode

Reglas para IA:

1. Nunca inventar archivos
2. Respetar la estructura existente
3. Entregar archivos completos
4. Explicar cada cambio
5. Mantener el estilo HelloComfy

---

# 📁 Nuevos archivos incorporados

Durante esta iteración se añadieron archivos clave para mejorar la modularidad, escalabilidad y consistencia visual del proyecto. Cada uno cumple un rol específico dentro de la arquitectura del frontend.

---

## `src/styles/category-filters.css`
Archivo CSS dedicado exclusivamente a los estilos de la vista de categorías.

**Motivación:**  
Separar la lógica visual de Category.jsx del resto del proyecto, evitando mezclar estilos con `products.css` y manteniendo un enfoque modular.

**Incluye:**  
- Estilo del título de subcategoría (`.category-title`)  
- Layout del contenedor de filtros (`.category-filters`)  
- Estilos para mensajes vacíos y loaders  
- Reglas responsive específicas para esta vista  

Este archivo se mantiene liviano porque los estilos del dropdown se heredan directamente desde `products.css`, garantizando consistencia visual entre ambas secciones.

---

## Actualización de `Category.jsx`
La vista de categorías fue actualizada para utilizar las mismas clases y estructura de dropdown que `Products.jsx`, logrando una experiencia visual unificada en todo el sitio.

**Motivación:**  
- Reutilizar estilos existentes  
- Mantener coherencia visual  
- Evitar duplicación de CSS  
- Facilitar mantenimiento futuro  

**Cambios principales:**  
- Reemplazo del `<select>` por un dropdown idéntico al de `Products.jsx`  
- Incorporación de las clases `products__dropdown`, `products__dropdown-toggle`, `products__dropdown-menu` y `products__dropdown-item`  
- Implementación de cierre automático del menú al hacer click fuera (click‑outside)  
- Uso de `useRef` para detectar interacciones externas  

---

## Unificación visual de tarjetas de producto
`Category.jsx` ahora utiliza la misma estructura de tarjeta que `Products.jsx`:

- Imagen  
- Badge “Destacado”  
- Nombre, precio y descripción  
- Estrellas  
- Botones “Comprar”, “Agregar al carrito” y “Ver más”  

**Motivación:**  
Garantizar una experiencia consistente en todas las secciones del catálogo sin duplicar componentes ni estilos.

---

# ✔ Resultado final

Con estos cambios:

- La vista de categorías quedó completamente alineada con la estética de `Products.jsx`  
- El código es más modular, claro y fácil de mantener  
- Se eliminaron estilos obsoletos y se evitó duplicación innecesaria  
- El proyecto avanza hacia una arquitectura más escalable y profesional  


- Productdetail es el encargado de la apariencia de cada producto particular. 
# Fin del README



hacer mañana: 
Mañana seguimos con:

• Integración logística:
  - Terminar la estructura final de Correo Argentino (zonas, sucursales, tarifas y cálculo de envío).
  - Unificar el modelo de datos entre Andreani y Correo Argentino para que el checkout use una sola interfaz.
  - Ajustar los endpoints del backend para devolver tiempos, costos y sucursales de forma consistente.

• Facturante:
  - Implementar el flujo completo de emisión de factura desde el backend.
  - Crear el endpoint para generar comprobantes y guardar el CAE.
  - Integrar el frontend para que el admin pueda ver el estado de facturación.
  - Preparar manejo de errores y reintentos si Facturante no responde.

• Checkout:
  - Conectar el cálculo de envío real con el flujo de compra.
  - Validar que los datos del cliente coincidan con los requeridos por Facturante.
  - Ajustar UI para mostrar costos, tiempos y sucursales de forma clara.

• Infraestructura:
  - Dejar lista la estructura para agregar más operadores logísticos en el futuro.
  - Documentar todo en el README para onboarding y para que el flujo quede blindado.

