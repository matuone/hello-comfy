// services/shipping/correoArgentinoApi.js
import axios from "axios";
import { calculatePackage } from "./utils.js";

// URLs base según ambiente
const BASE_URLS = {
  test: "https://apitest.correoargentino.com.ar/micorreo/v1",
  prod: "https://api.correoargentino.com.ar/micorreo/v1"
};

const BASE_URL = BASE_URLS[process.env.CORREO_ARG_ENV || "test"];

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

    console.log(`📡 Intentando autenticar en ${BASE_URL}/token`);
    console.log(`   Usuario: ${user}`);
    console.log(`   Ambiente: ${process.env.CORREO_ARG_ENV || "test"}`);
    const response = await axios.post(
      `${BASE_URL}/token`,
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
    console.log("⚠️ Correo Argentino API no configurado, usando tarifas locales");
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

    const response = await axios.post(
      `${BASE_URL}/rates`,
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

    // Procesar tarifas
    rates.forEach(rate => {
      const eta = `${rate.deliveryTimeMin} a ${rate.deliveryTimeMax} días hábiles`;

      if (rate.deliveredType === "D") {
        result.home = {
          price: rate.price,
          eta,
          productName: rate.productName,
          available: true
        };
      } else if (rate.deliveredType === "S") {
        result.branch = {
          price: rate.price,
          eta,
          productName: rate.productName,
          available: true
        };
      }
    });

    return result;
  } catch (error) {
    console.log("⚠️ No se pudo conectar a API de Correo Argentino, usando tarifas locales");

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

    const response = await axios.get(`${BASE_URL}/agencies`, {
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

    const payload = {
      customerId,
      extOrderId: orderData.code, // Código único de la orden
      orderNumber: orderData.code,
      sender: {
        name: process.env.CORREO_ARG_SENDER_NAME || "Hello Comfy",
        phone: process.env.CORREO_ARG_SENDER_PHONE || "",
        cellPhone: process.env.CORREO_ARG_SENDER_CELL || "",
        email: process.env.CORREO_ARG_SENDER_EMAIL || "",
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
        deliveryType: orderData.shipping.method === "home" ? "D" : "S",
        productType: "CP",
        agency: orderData.shipping.method === "pickup" ? orderData.shipping.agency : null,
        address: orderData.shipping.method === "home" ? {
          streetName: orderData.shipping.streetName,
          streetNumber: orderData.shipping.streetNumber,
          floor: orderData.shipping.floor || "",
          apartment: orderData.shipping.apartment || "",
          city: orderData.shipping.city,
          provinceCode: orderData.shipping.provinceCode,
          postalCode: orderData.shipping.postalCode
        } : null,
        weight: orderData.shipping.weight || 1000, // gramos
        declaredValue: orderData.totals.total,
        height: orderData.shipping.height || 20,
        length: orderData.shipping.length || 30,
        width: orderData.shipping.width || 20
      }
    };

    const response = await axios.post(
      `${BASE_URL}/shipping/import`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return {
      success: true,
      createdAt: response.data.createdAt,
      trackingNumber: orderData.code // Correo usa el extOrderId para tracking
    };
  } catch (error) {
    console.error("Error importando envío a Correo Argentino:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Error al registrar envío");
  }
}

/**
 * Obtener tracking de un envío
 */
export async function getTracking(shippingId) {
  if (!process.env.CORREO_ARG_USER) {
    throw new Error("Correo Argentino no configurado");
  }

  try {
    const token = await getAuthToken();

    const response = await axios.get(`${BASE_URL}/shipping/tracking`, {
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
