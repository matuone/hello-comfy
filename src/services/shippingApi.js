// src/services/shippingApi.js

const API_URL = import.meta.env.VITE_API_URL;
const apiPath = (path) => `${API_URL}${path}`;

export async function calcularEnvio(postalCode, products) {
  const body = { postalCode, products };

  try {
    const correoRes = await fetch(apiPath("/shipping/correo"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());

    return {
      correo: correoRes,
    };
  } catch (error) {
    console.error("Error calculando envío:", error);
    throw error;
  }
}

/**
 * Obtener sucursales de Correo Argentino cercanas a un código postal
 */
export async function fetchAgenciesByCP(postalCode) {
  try {
    const res = await fetch(apiPath(`/correo-argentino/agencies-by-cp?postalCode=${postalCode}`));
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error obteniendo sucursales");

    return data.agencies || [];
  } catch (error) {
    console.error("Error obteniendo sucursales:", error);
    return [];
  }
}
