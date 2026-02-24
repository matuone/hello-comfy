import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

/**
 * Hook para cargar las reglas de descuento del admin
 */
export function useDiscountRules() {
  const [discountRules, setDiscountRules] = useState([]);

  useEffect(() => {
    fetch(apiPath("/discounts"))
      .then((res) => res.json())
      .then((data) => setDiscountRules(Array.isArray(data) ? data : []))
      .catch(() => setDiscountRules([]));
  }, []);

  return discountRules;
}

/**
 * Obtener el porcentaje de descuento efectivo para un producto.
 * Prioridad: descuento propio del producto > regla por categoría/subcategoría
 */
export function getEffectiveDiscount(product, discountRules) {
  // Si el producto tiene descuento propio, usarlo
  if (product.discount && product.discount > 0) {
    return product.discount;
  }

  // Buscar regla de descuento por categoría/subcategoría
  const rule = discountRules.find(
    (r) =>
      r.type === "percentage" &&
      r.category === product.category &&
      (r.subcategory === "none" || r.subcategory === product.subcategory)
  );

  return rule ? rule.discount : 0;
}

/**
 * Calcula todos los precios para mostrar en la tarjeta:
 * - precioOriginal: precio base
 * - descuento: porcentaje de descuento (0 si no hay)
 * - precioFinal: precio con descuento aplicado
 * - precioTransferencia: precioFinal - 10%
 * - precioCuota: precioFinal / 3 (cuotas sin interés)
 */
export function calcularPrecios(product, discountRules) {
  const precioOriginal = product.price || 0;
  const descuento = getEffectiveDiscount(product, discountRules);
  const precioFinal = descuento > 0
    ? Math.round(precioOriginal * (1 - descuento / 100))
    : precioOriginal;

  // 10% de descuento adicional por transferencia
  const precioTransferencia = Math.round(precioFinal * 0.9);

  // 3 cuotas sin interés sobre el precio final (sin el dto de transferencia)
  const precioCuota = Math.round(precioFinal / 3);

  return {
    precioOriginal,
    descuento,
    precioFinal,
    precioTransferencia,
    precioCuota
  };
}

/**
 * Verifica si algún producto del carrito tiene una regla de envío gratis.
 * @param {Array} items - Items del carrito (cada uno con category y subcategory)
 * @param {Array} discountRules - Reglas de descuento
 * @returns {Boolean}
 */
export function hasFreeShippingRule(items, discountRules) {
  if (!items || !discountRules) return false;
  return items.some((item) =>
    discountRules.some(
      (r) =>
        r.type === "free_shipping" &&
        r.category === item.category &&
        (r.subcategory === "none" || r.subcategory === item.subcategory)
    )
  );
}
