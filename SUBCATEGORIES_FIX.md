# Solución: Subcategorías Dinámicas en Admin

## Problema Identificado

El usuario reportó tres problemas relacionados con las subcategorías en el panel de administración:

1. **Al agregar una nueva subcategoría, no aparecía en el selector cuando se editan productos**
2. **Al cambiar de categoría, se eliminaban las subcategorías previamente seleccionadas**
3. **Inconsistencias entre lo que mostraba el frontend y lo que había en la BD**

## Causa Raíz

El selector de subcategorías en `AdminProductDetail.jsx` estaba **hardcodeado** con opciones fijas:

```jsx
// ❌ ANTES (línea 466-488)
{producto.categoria === "Indumentaria" && (
  <>
    <option>Remeras</option>
    <option>Buzos</option>
    <option>Pijamas</option>
    <option>Shorts</option>
    <option>Totes</option>
    <option>Outlet</option>
  </>
)}
{producto.categoria === "Cute Items" && <option>Vasos</option>}
{producto.categoria === "Merch" && (
  <>
    <option>Artistas nacionales</option>
    <option>Artistas internacionales</option>
  </>
)}
```

**Problemas:**
- Cuando el usuario agregaba una nueva subcategoría desde `AdminSubcategories.jsx`, nunca aparecía en este selector
- El handler de cambio de categoría asignaba automáticamente una subcategoría por defecto ("Remeras", "Vasos", etc.), pisando la que el usuario había seleccionado
- El estado inicial forzaba "Remeras" como subcategoría, causando inconsistencias

---

## Solución Implementada

### 1. Cargar Subcategorías Dinámicamente ✅

Agregué un nuevo state y un useEffect para obtener las subcategorías desde el backend:

```jsx
// Estado para almacenar subcategorías dinámicas
const [groupedSubcategories, setGroupedSubcategories] = useState({});

// UseEffect para cargar dinámicamente
useEffect(() => {
  fetch(apiPath("/products/filters/data"))
    .then((res) => res.json())
    .then((data) => {
      setGroupedSubcategories(data.groupedSubcategories || {});
    })
    .catch((err) => console.error("Error cargando subcategorías:", err));
}, []);
```

**Beneficio:** El selector siempre muestra las subcategorías más actuales de la BD, sin importar si se agregaron nuevas desde `AdminSubcategories`.

---

### 2. Cambiar Selector a Dinámico ✅

```jsx
// ✅ DESPUÉS: Dinámico
<label className="input-label">Subcategoría</label>
<select
  className={`input-field ${errores.subcategoria ? "input-error" : ""}`}
  value={producto.subcategoria}
  onChange={(e) => actualizarCampo("subcategoria", e.target.value)}
>
  <option value="">Seleccionar subcategoría...</option>
  {(groupedSubcategories[producto.categoria] || []).map((sub) => (
    <option key={sub} value={sub}>
      {sub}
    </option>
  ))}
</select>
```

**Beneficio:** El dropdown muestra TODAS las subcategorías disponibles para la categoría seleccionada, incluyendo las nuevas que se agreguen.

---

### 3. Corregir Handler de Cambio de Categoría ✅

Antes:
```javascript
if (campo === "categoria") {
  let sub = "";
  if (valor === "Indumentaria") sub = "Remeras";
  else if (valor === "Cute Items") sub = "Vasos";
  else if (valor === "Merch") sub = "Artistas nacionales";
  // ❌ Esto pisaba la subcategoría seleccionada
}
```

Después:
```javascript
if (campo === "categoria") {
  const subsDisponibles = groupedSubcategories[valor] || [];
  let nuevaSub = producto.subcategoria;
  
  // Solo limpiar si la subcategoría actual NO es válida para la nueva categoría
  if (!subsDisponibles.includes(producto.subcategoria)) {
    nuevaSub = "";
  }
  // NO pisar la subcategoría sin motivo
}
```

**Beneficio:** Al cambiar de categoría, se preserva la subcategoría seleccionada si es válida, o se limpia solo si no aplica.

---

### 4. Cambiar Estado Inicial ✅

```javascript
// ❌ ANTES
subcategoria: "Remeras"

// ✅ DESPUÉS
subcategoria: ""  // Vacía, fuerza al usuario a seleccionar explícitamente
```

**Beneficio:** Evita valores por defecto inconsistentes. El usuario debe seleccionar una subcategoría explícitamente.

---

### 5. Arreglar Inconsistencia de Capitalización ✅

El backend espera: `"Cute items"` (con i minúscula)  
El frontend enviaba: `"Cute Items"` (con I mayúscula)

```javascript
// ✅ ARREGLADO
const categoriasValidas = ["Indumentaria", "Cute items", "Merch"]; // i minúscula
```

Y en el select:
```jsx
<option>Indumentaria</option>
<option>Cute items</option>  {/* ✅ Ahora es "items" con i minúscula */}
<option>Merch</option>
```

**Beneficio:** Consistencia entre frontend y backend, evita rechazos de validación.

---

## Flujo Resultante

```
1. Usuario abre AdminProductDetail
   ↓
2. useEffect carga subcategorías dinámicamente desde `/api/products/filters/data`
   ↓
3. Usuario selecciona una categoría
   ↓
4. Selector muestra TODAS las subcategorías de esa categoría (incluyendo las nuevas)
   ↓
5. Usuario selecciona una subcategoría
   ↓
6. Si es edición y el producto tenía una subcategoría válida, se preserva
   ↓
7. Si es nuevo, se requiere seleccionar una explícitamente
```

---

## Archivos Modificados

- **`src/views/AdminProductDetail.jsx`**
  - Agregado estado: `groupedSubcategories`
  - Agregado useEffect para cargar subcategorías dinámicamente
  - Cambiado selector de hardcodeado a dinámico
  - Corregido handler de cambio de categoría
  - Cambiado estado inicial de subcategoría a vacío
  - Arreglada capitalización: "Cute Items" → "Cute items"

---

## Validación

### ¿Qué sucede ahora si...?

**Escenario 1: Usuario agrega nueva subcategoría**
- ✅ Aparece inmediatamente en el selector (porque se carga dinámicamente)

**Escenario 2: Usuario cambia de categoría**
- ✅ Se preserva la subcategoría si es válida para la nueva categoría
- ✅ Se limpia automáticamente si no aplica

**Escenario 3: Usuario edita un producto existente**
- ✅ Se carga la subcategoría guardada, aunque no esté en la lista hardcodeada anterior
- ✅ El selector muestra todas las subcategorías de esa categoría

**Escenario 4: Usuario crea nuevo producto**
- ✅ Debe seleccionar explícitamente una subcategoría
- ✅ No hay valores por defecto que podrían causar inconsistencias

---

## Testing Recomendado

1. Crear una nueva subcategoría en `AdminSubcategories` (ej: "Piyamas XL")
2. Ir a `AdminProducts` → Editar un producto → Cambiar de categoría
   - Verificar que aparece "Piyamas XL" en el selector
   - Verificar que la subcategoría se preserva si aplica a la nueva categoría
3. Crear un nuevo producto
   - Verificar que el selector está vacío inicialmente
   - Verificar que puedes seleccionar cualquier subcategoría disponible
4. Editar un producto antiguo
   - Verificar que carga la subcategoría original, aunque hay sido hardcodeada

---

## Notas Técnicas

- El endpoint `/api/products/filters/data` devuelve un objeto `groupedSubcategories` con la estructura:
  ```json
  {
    "Indumentaria": ["Remeras", "Buzos", "Pijamas", ...],
    "Cute items": ["Vasos", ...],
    "Merch": ["Artistas nacionales", ...]
  }
  ```
- Este endpoint combina subcategorías de dos fuentes:
  1. Subcategorías deducidas de los productos existentes
  2. Subcategorías manuales de la tabla `Subcategory`

---

**Resumen:** El selector de subcategorías ahora es completamente dinámico, reflejando todos los cambios en tiempo real sin requerer recargas.

