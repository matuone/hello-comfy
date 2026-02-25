// services/shipping/utils.js

/**
 * Calcula peso y dimensiones del paquete a partir de los productos.
 * Devuelve peso en kg y dimensiones en cm individuales (height, width, length).
 * Para múltiples productos apila por alto, y toma el máximo de ancho/largo.
 */
export function calculatePackage(products) {
  let totalWeight = 0; // kg
  let maxWidth = 0;    // cm
  let maxLength = 0;   // cm
  let totalHeight = 0; // cm (se apilan)

  products.forEach(p => {
    const qty = p.quantity || 1;
    const weight = (p.weight > 0) ? p.weight : 0.3; // fallback 300g
    const dims = p.dimensions || {};
    const width = (dims.width > 0) ? dims.width : 5;
    const height = (dims.height > 0) ? dims.height : 5;
    const length = (dims.length > 0) ? dims.length : 5;

    totalWeight += weight * qty;
    totalHeight += height * qty;        // apilamos los productos
    maxWidth = Math.max(maxWidth, width);
    maxLength = Math.max(maxLength, length);
  });

  return {
    weight: totalWeight,
    height: totalHeight || 5,   // fallback mínimo
    width: maxWidth || 5,
    length: maxLength || 5
  };
}
