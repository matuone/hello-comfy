// services/shipping/correoArgentinoApi.js
import axios from "axios";
import { calculatePackage } from "./utils.js";

// URLs base según ambiente
const BASE_URLS = {
  test: "https://apitest.correoargentino.com.ar/micorreo/v1",
  prod: "https://api.correoargentino.com.ar/micorreo/v1"
};

/** Resuelve la URL base en cada llamada (no al importar el módulo) */
function getBaseUrl() {
  return BASE_URLS[process.env.CORREO_ARG_ENV || "test"];
}

/**
 * Obtener token JWT de autenticación
 */
async function getAuthToken() {
  const user = process.env.CORREO_ARG_USER;
  const password = process.env.CORREO_ARG_PASSWORD;

  if (!user || !password) {
    throw new Error("Credenciales de Correo Argentino no configuradas");
  }

  try {
    const auth = Buffer.from(`${user}:${password}`).toString("base64");

    // console.log(`📡 Intentando autenticar en ${getBaseUrl()}/token`);
    // console.log(`   Usuario: ${user}`);
    // console.log(`   Ambiente: ${process.env.CORREO_ARG_ENV || "test"}`);
    const response = await axios.post(
      `${getBaseUrl()}/token`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    return response.data.token;
  } catch (error) {
    console.error("❌ Error obteniendo token:", error.response?.status, error.response?.data || error.message);
    throw new Error("No se pudo autenticar con Correo Argentino");
  }
}

/**
 * Cotizar envío con API de Correo Argentino
 */
export async function cotizarCorreoArgentino({ postalCode, products }) {
  const customerId = process.env.CORREO_ARG_CUSTOMER_ID;
  const originCP = process.env.CORREO_ARG_ORIGIN_CP || "1425";

  // Si no hay credenciales configuradas, devolver placeholder
  if (!process.env.CORREO_ARG_USER || !customerId) {
    // console.log("⚠️ Correo Argentino API no configurado, usando tarifas locales");
    return {
      pendingCredentials: true,
      home: { available: false },
      branch: { available: false }
    };
  }

  try {
    const token = await getAuthToken();
    const { weight, height, width, length } = calculatePackage(products);

    // Convertir peso de kg a gramos
    const weightInGrams = Math.ceil(weight * 1000);

    // Dimensiones en cm (redondeadas)
    const dimensions = {
      weight: Math.max(1, Math.min(25000, weightInGrams)), // min 1g, max 25kg
      height: Math.min(150, Math.ceil(height)),
      width: Math.min(150, Math.ceil(width)),
      length: Math.min(150, Math.ceil(length))
    };

    // Pedir ambas cotizaciones (domicilio y sucursal) omitiendo deliveredType
    const response = await axios.post(
      `${getBaseUrl()}/rates`,
      {
        customerId,
        postalCodeOrigin: originCP,
        postalCodeDestination: postalCode,
        dimensions
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { rates } = response.data;

    if (!rates || rates.length === 0) {
      return {
        home: { available: false },
        branch: { available: false }
      };
    }

    const result = {
      validTo: response.data.validTo
    };

    // Procesar tarifas — la API devuelve deliveredType, productType, productName, price,
    // deliveryTimeMin y deliveryTimeMax.
    // Puede haber múltiples productos (Clásico CP y Expreso EP) por tipo de entrega.
    // Tomamos el más barato (Clásico) para home/branch y guardamos todos en allRates.
    result.allRates = rates;

    rates.forEach(rate => {
      const eta = `${rate.deliveryTimeMin} a ${rate.deliveryTimeMax} días hábiles`;

      if (rate.deliveredType === "D") {
        // Si aún no hay tarifa domicilio, o esta es más barata, usarla como principal
        if (!result.home || !result.home.available || rate.price < result.home.price) {
          result.home = {
            price: rate.price,
            eta,
            productName: rate.productName,
            productType: rate.productType,
            available: true
          };
        }
        // Guardar expreso por separado si existe
        if (rate.productType === "EP") {
          result.homeExpress = {
            price: rate.price,
            eta,
            productName: rate.productName,
            productType: rate.productType,
            available: true
          };
        }
      } else if (rate.deliveredType === "S") {
        if (!result.branch || !result.branch.available || rate.price < result.branch.price) {
          result.branch = {
            price: rate.price,
            eta,
            productName: rate.productName,
            productType: rate.productType,
            available: true
          };
        }
        if (rate.productType === "EP") {
          result.branchExpress = {
            price: rate.price,
            eta,
            productName: rate.productName,
            productType: rate.productType,
            available: true
          };
        }
      }
    });

    // Asegurar que home y branch existan aunque no vengan
    if (!result.home) result.home = { available: false };
    if (!result.branch) result.branch = { available: false };

    return result;
  } catch (error) {
    console.error("⚠️ Error en cotización Correo Argentino:", error.response?.status, error.response?.data || error.message);

    // Fallback silencioso a tarifas locales si la API falla
    return {
      apiError: true,
      home: { available: false },
      branch: { available: false }
    };
  }
}

/**
 * Obtener sucursales de Correo Argentino por provincia
 */
export async function getAgencies(provinceCode) {
  const customerId = process.env.CORREO_ARG_CUSTOMER_ID;

  if (!process.env.CORREO_ARG_USER || !customerId) {
    throw new Error("Correo Argentino no configurado");
  }

  try {
    const token = await getAuthToken();

    const response = await axios.get(`${getBaseUrl()}/agencies`, {
      params: {
        customerId,
        provinceCode
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error obteniendo sucursales:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Registrar/Importar envío en Correo Argentino
 */
export async function importShipping(orderData) {
  const customerId = process.env.CORREO_ARG_CUSTOMER_ID;

  if (!process.env.CORREO_ARG_USER || !customerId) {
    throw new Error("Correo Argentino no configurado");
  }

  try {
    const token = await getAuthToken();

    const isHome = orderData.shipping.method === "home";
    const deliveryType = isHome ? "D" : "S";

    // Construir dirección de envío
    // Para domicilio (D): los campos de dirección son obligatorios
    // Para sucursal (S): los campos de dirección NO son obligatorios
    const shippingAddress = {
      streetName: orderData.shipping.streetName || "",
      streetNumber: orderData.shipping.streetNumber || "",
      floor: (orderData.shipping.floor || "").substring(0, 3),       // API trunca a 3 chars
      apartment: (orderData.shipping.apartment || "").substring(0, 3), // API trunca a 3 chars
      city: orderData.shipping.city || "",
      provinceCode: orderData.shipping.provinceCode || "",
      postalCode: orderData.shipping.postalCode || ""
    };

    const payload = {
      customerId,
      extOrderId: String(orderData.code),
      orderNumber: String(orderData.code),
      sender: {
        name: process.env.CORREO_ARG_SENDER_NAME || "Hello Comfy",
        phone: process.env.CORREO_ARG_SENDER_PHONE || null,
        cellPhone: process.env.CORREO_ARG_SENDER_CELL || null,
        email: process.env.CORREO_ARG_SENDER_EMAIL || null,
        originAddress: {
          streetName: process.env.CORREO_ARG_ORIGIN_STREET || null,
          streetNumber: process.env.CORREO_ARG_ORIGIN_NUMBER || null,
          floor: null,
          apartment: null,
          city: process.env.CORREO_ARG_ORIGIN_CITY || null,
          provinceCode: process.env.CORREO_ARG_ORIGIN_PROVINCE || null,
          postalCode: process.env.CORREO_ARG_ORIGIN_CP || null
        }
      },
      recipient: {
        name: orderData.customer.name,
        phone: orderData.customer.phone || "",
        cellPhone: orderData.customer.cellPhone || "",
        email: orderData.customer.email
      },
      shipping: {
        deliveryType,
        agency: !isHome ? (orderData.shipping.agency || null) : null,
        address: shippingAddress,
        weight: Math.max(1, Math.round(orderData.shipping.weight || 1000)), // gramos, entero, min 1g
        declaredValue: orderData.totals.total,
        height: Math.min(255, Math.max(1, Math.round(orderData.shipping.height || 20))),
        length: Math.min(255, Math.max(1, Math.round(orderData.shipping.length || 30))),
        width: Math.min(255, Math.max(1, Math.round(orderData.shipping.width || 20)))
      }
    };

    const response = await axios.post(
      `${getBaseUrl()}/shipping/import`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    // La API solo devuelve createdAt. El extOrderId sirve como referencia.
    return {
      success: true,
      createdAt: response.data.createdAt,
      extOrderId: String(orderData.code)
    };
  } catch (error) {
    console.error("Error importando envío a Correo Argentino:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al registrar envío");
  }
}

/**
 * Obtener tracking de un envío
 * NOTA: Este endpoint (/shipping/tracking) no está documentado en la API oficial
 * de MiCorreo v1. Puede no existir o requerir parámetros diferentes.
 * Mantener como referencia para futuras versiones de la API.
 */
export async function getTracking(shippingId) {
  if (!process.env.CORREO_ARG_USER) {
    throw new Error("Correo Argentino no configurado");
  }

  try {
    const token = await getAuthToken();

    const response = await axios.get(`${getBaseUrl()}/shipping/tracking`, {
      params: {
        shippingId
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error obteniendo tracking:", error.response?.data || error.message);
    throw error;
  }
}
