// src/services/shippingApi.js

const API_URL = import.meta.env.VITE_API_URL;

export async function calcularEnvio(postalCode, products) {
  const body = { postalCode, products };

  try {
    const [andreaniRes, correoRes] = await Promise.all([
      fetch(`${API_URL}/api/shipping/andreani`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),

      fetch(`${API_URL}/api/shipping/correo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    ]);

    return {
      andreani: andreaniRes,
      correo: correoRes,
    };
  } catch (error) {
    console.error("Error calculando envío:", error);
    throw error;
  }
}
