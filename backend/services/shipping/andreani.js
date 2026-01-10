// services/shipping/andreani.js
import axios from "axios";
import { calculatePackage } from "./utils.js";

const LOGIN_URL = "https://apisqa.andreani.com/login";
const RATE_URL = "https://apisqa.andreani.com/v2/tarifas";

export async function cotizarAndreani({ postalCode, products }) {
  const { weight, volume } = calculatePackage(products);

  // Si no hay credenciales → devolvemos placeholder
  if (!process.env.ANDREANI_USER) {
    return {
      pendingCredentials: true,
      home: { available: false },
      branch: { available: false }
    };
  }

  // 1) Login
  const auth = Buffer.from(
    `${process.env.ANDREANI_USER}:${process.env.ANDREANI_PASSWORD}`
  ).toString("base64");

  const loginRes = await axios.get(LOGIN_URL, {
    headers: { Authorization: `Basic ${auth}` }
  });

  const token = loginRes.data?.access_token;

  // 2) Cotización real
  const rateRes = await axios.post(
    RATE_URL,
    {
      cpDestino: postalCode,
      cpOrigen: process.env.ANDREANI_ORIGIN_CP,
      peso: weight,
      volumen: volume,
      contrato: process.env.ANDREANI_CONTRACT_NUMBER,
      cliente: process.env.ANDREANI_CLIENT_ID
    },
    {
      headers: {
        "x-authorization-token": token
      }
    }
  );

  const data = rateRes.data;

  return {
    home: {
      price: data?.tarifa?.precioPuertaAPuerta || null,
      eta: data?.tarifa?.plazoEntrega || null,
      available: !!data?.tarifa?.precioPuertaAPuerta
    },
    branch: {
      price: data?.tarifa?.precioPuertaASucursal || null,
      eta: data?.tarifa?.plazoEntrega || null,
      available: !!data?.tarifa?.precioPuertaASucursal
    }
  };
}
