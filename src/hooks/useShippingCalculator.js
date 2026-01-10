// src/hooks/useShippingCalculator.js

import { useState } from "react";
import { calcularEnvio } from "../services/shippingApi";

export function useShippingCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function calcular(postalCode, products) {
    try {
      setLoading(true);
      setError(null);

      const data = await calcularEnvio(postalCode, products);
      setResult(data);
    } catch (err) {
      console.error("Error en cálculo de envío:", err);
      setError("No se pudo calcular el envío");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    result,
    error,
    calcular,
  };
}
