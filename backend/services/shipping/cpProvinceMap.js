// services/shipping/cpProvinceMap.js

// Tabla unica de rangos CP -> provincia (codigo ISO de Correo Argentino)
// Se evita solapar rangos para que el resultado no dependa del orden.
export const CP_PROVINCE_RANGES = [
  { from: 1000, to: 1499, code: "C", name: "CABA" },
  { from: 1500, to: 1999, code: "B", name: "Buenos Aires" },
  { from: 2000, to: 2699, code: "S", name: "Santa Fe" },
  { from: 2800, to: 2999, code: "B", name: "Buenos Aires" },
  { from: 3000, to: 3099, code: "S", name: "Santa Fe" },
  { from: 3100, to: 3299, code: "E", name: "Entre Rios" },
  { from: 3300, to: 3399, code: "N", name: "Misiones" },
  { from: 3400, to: 3499, code: "W", name: "Corrientes" },
  { from: 3500, to: 3599, code: "H", name: "Chaco" },
  { from: 3600, to: 3699, code: "P", name: "Formosa" },
  { from: 3700, to: 3749, code: "H", name: "Chaco" },
  { from: 4000, to: 4199, code: "T", name: "Tucuman" },
  { from: 4200, to: 4399, code: "G", name: "Santiago del Estero" },
  { from: 4400, to: 4599, code: "A", name: "Salta" },
  { from: 4600, to: 4699, code: "Y", name: "Jujuy" },
  { from: 4700, to: 4751, code: "K", name: "Catamarca" },
  { from: 5000, to: 5299, code: "X", name: "Cordoba" },
  { from: 5300, to: 5399, code: "F", name: "La Rioja" },
  { from: 5400, to: 5499, code: "J", name: "San Juan" },
  { from: 5500, to: 5699, code: "M", name: "Mendoza" },
  { from: 5700, to: 5799, code: "D", name: "San Luis" },
  { from: 5800, to: 5999, code: "X", name: "Cordoba" },
  { from: 6000, to: 6199, code: "B", name: "Buenos Aires" },
  { from: 6200, to: 6399, code: "L", name: "La Pampa" },
  { from: 6400, to: 8199, code: "B", name: "Buenos Aires" },
  { from: 8300, to: 8399, code: "Q", name: "Neuquen" },
  { from: 8400, to: 8599, code: "R", name: "Rio Negro" },
  { from: 9000, to: 9220, code: "U", name: "Chubut" },
  { from: 9300, to: 9399, code: "Z", name: "Santa Cruz" },
  { from: 9400, to: 9499, code: "V", name: "Tierra del Fuego" },
];

export const cpToProvinceCode = (cp) => {
  const n = Number.parseInt(cp, 10);
  if (!Number.isInteger(n)) return null;

  const match = CP_PROVINCE_RANGES.find((r) => n >= r.from && n <= r.to);
  return match ? match.code : null;
};

export const findRangeOverlaps = (ranges = CP_PROVINCE_RANGES) => {
  const overlaps = [];

  for (let i = 0; i < ranges.length; i += 1) {
    for (let j = i + 1; j < ranges.length; j += 1) {
      const a = ranges[i];
      const b = ranges[j];
      const intersects = a.from <= b.to && b.from <= a.to;

      if (intersects) {
        overlaps.push({
          a,
          b,
          from: Math.max(a.from, b.from),
          to: Math.min(a.to, b.to),
        });
      }
    }
  }

  return overlaps;
};

export const validateCpProvinceRanges = (ranges = CP_PROVINCE_RANGES) => {
  const invalid = ranges.filter(
    (r) => !Number.isInteger(r.from) || !Number.isInteger(r.to) || r.from > r.to || !r.code
  );
  const overlaps = findRangeOverlaps(ranges);

  return {
    ok: invalid.length === 0 && overlaps.length === 0,
    invalid,
    overlaps,
  };
};
