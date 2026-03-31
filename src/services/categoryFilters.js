const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CATEGORY_FILTERS_STORAGE_KEY = "hello-comfy.category-filters.v1";
const CATEGORY_FILTERS_CACHE_TTL_MS = 5 * 60 * 1000;

let memoryCache = null;
let memoryCacheExpiresAt = 0;
let inflightRequest = null;

function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

function clearExpiredMemoryCache() {
  if (memoryCache && Date.now() < memoryCacheExpiresAt) {
    return;
  }

  memoryCache = null;
  memoryCacheExpiresAt = 0;
}

function readSessionCache() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(CATEGORY_FILTERS_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.expiresAt || Date.now() >= parsed.expiresAt) {
      window.sessionStorage.removeItem(CATEGORY_FILTERS_STORAGE_KEY);
      return null;
    }

    memoryCache = parsed.data;
    memoryCacheExpiresAt = parsed.expiresAt;
    return parsed.data;
  } catch {
    return null;
  }
}

function persistCache(data) {
  const expiresAt = Date.now() + CATEGORY_FILTERS_CACHE_TTL_MS;

  memoryCache = data;
  memoryCacheExpiresAt = expiresAt;

  if (typeof window === "undefined") {
    return data;
  }

  try {
    window.sessionStorage.setItem(
      CATEGORY_FILTERS_STORAGE_KEY,
      JSON.stringify({ data, expiresAt })
    );
  } catch {
    // Ignorar errores de storage y seguir con caché en memoria.
  }

  return data;
}

export function getCachedCategoryFilters() {
  clearExpiredMemoryCache();

  if (memoryCache) {
    return memoryCache;
  }

  return readSessionCache();
}

export function clearCategoryFiltersCache() {
  memoryCache = null;
  memoryCacheExpiresAt = 0;

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(CATEGORY_FILTERS_STORAGE_KEY);
  }
}

export async function getCategoryFilters() {
  const cached = getCachedCategoryFilters();
  if (cached) {
    return cached;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = fetch(apiPath("/products/filters/data"))
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("No se pudieron obtener las categorías");
      }

      const data = await res.json();
      if (!data?.groupedSubcategories) {
        throw new Error("Respuesta inválida de categorías");
      }

      return persistCache(data);
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}