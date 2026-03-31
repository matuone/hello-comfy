const CATEGORY_FILTERS_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedCategoryFilters = null;
let cachedCategoryFiltersExpiresAt = 0;

export function getCachedCategoryFilters() {
  if (!cachedCategoryFilters || Date.now() >= cachedCategoryFiltersExpiresAt) {
    cachedCategoryFilters = null;
    cachedCategoryFiltersExpiresAt = 0;
    return null;
  }

  return cachedCategoryFilters;
}

export function setCachedCategoryFilters(value) {
  cachedCategoryFilters = value;
  cachedCategoryFiltersExpiresAt = Date.now() + CATEGORY_FILTERS_CACHE_TTL_MS;
  return value;
}

export function clearCategoryFiltersCache() {
  cachedCategoryFilters = null;
  cachedCategoryFiltersExpiresAt = 0;
}