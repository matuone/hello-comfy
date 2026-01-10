// services/shipping/utils.js

export function calculatePackage(products) {
  let totalWeight = 0; // kg
  let totalVolume = 0; // cm3

  products.forEach(p => {
    const weight = p.weight || 0.3; // fallback
    const { width = 20, height = 5, length = 30 } = p.dimensions || {};

    totalWeight += weight * p.quantity;
    totalVolume += (width * height * length) * p.quantity;
  });

  return {
    weight: totalWeight,
    volume: totalVolume
  };
}
