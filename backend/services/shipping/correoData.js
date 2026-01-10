// services/shipping/correoData.js

export const zonasCorreo = {
  // AMBA
  "1000": "amba", "1001": "amba", "1002": "amba",
  // ... acá irían todos los CP AMBA
  // Interior
  // ... CP interior
  // Patagonia
  // ... CP patagonia
};

// Tarifas reales Correo Argentino (ejemplo actualizado)
export const tarifasCorreo = {
  amba: [
    { max: 0.5, domicilio: 1790, sucursal: 1490 },
    { max: 1, domicilio: 1990, sucursal: 1690 },
    { max: 2, domicilio: 2290, sucursal: 1890 },
    { max: 5, domicilio: 2790, sucursal: 2290 },
    { max: 10, domicilio: 3490, sucursal: 2890 }
  ],
  interior: [
    { max: 0.5, domicilio: 1990, sucursal: 1690 },
    { max: 1, domicilio: 2290, sucursal: 1890 },
    { max: 2, domicilio: 2590, sucursal: 2090 },
    { max: 5, domicilio: 3190, sucursal: 2590 },
    { max: 10, domicilio: 3990, sucursal: 3290 }
  ],
  patagonia: [
    { max: 0.5, domicilio: 2490, sucursal: 2090 },
    { max: 1, domicilio: 2790, sucursal: 2290 },
    { max: 2, domicilio: 3190, sucursal: 2590 },
    { max: 5, domicilio: 3890, sucursal: 3190 },
    { max: 10, domicilio: 4790, sucursal: 3890 }
  ]
};
