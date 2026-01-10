// services/shipping/correo.js
import { calculatePackage } from "./utils.js";
import { tarifasCorreo } from "./correoData.js";
import { zonasCorreo } from "./correoZonas.js";

export function cotizarCorreo({ postalCode, products }) {
  const { weight } = calculatePackage(products);

  // Si no encontramos el CP, asumimos "interior" como fallback
  const zona = zonasCorreo[postalCode] || "interior";

  const rango = tarifasCorreo[zona].find((r) => weight <= r.max);

  if (!rango) {
    return {
      home: { available: false },
      branch: { available: false },
    };
  }

  return {
    home: {
      price: rango.domicilio,
      eta: "4 a 7 días hábiles",
      available: true,
    },
    branch: {
      price: rango.sucursal,
      eta: "4 a 7 días hábiles",
      available: true,
    },
  };
}
