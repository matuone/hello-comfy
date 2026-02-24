// routes/correoArgentinoRoutes.js
import express from "express";
const router = express.Router();
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import Order from "../models/Order.js";
import {
  cotizarCorreoArgentino,
  getAgencies,
  importShipping,
  getTracking
} from "../services/shipping/correoArgentinoApi.js";

/**
 * POST /api/correo-argentino/quote
 * Cotizar envío con API de Correo Argentino
 */
router.post("/correo-argentino/quote", async (req, res) => {
  try {
    const { postalCode, products } = req.body;

    if (!postalCode || !products) {
      return res.status(400).json({ error: "Faltan parámetros requeridos" });
    }

    const result = await cotizarCorreoArgentino({ postalCode, products });
    res.json(result);
  } catch (error) {
    console.error("Error cotizando con Correo Argentino:", error);
    res.status(500).json({
      error: "Error al cotizar envío",
      message: error.message
    });
  }
});

/**
 * GET /api/correo-argentino/agencies
 * Obtener sucursales por provincia
 */
router.get("/correo-argentino/agencies", async (req, res) => {
  try {
    const { provinceCode } = req.query;

    if (!provinceCode) {
      return res.status(400).json({ error: "Se requiere código de provincia" });
    }

    const agencies = await getAgencies(provinceCode);
    res.json(agencies);
  } catch (error) {
    console.error("Error obteniendo sucursales:", error);
    res.status(500).json({
      error: "Error al obtener sucursales",
      message: error.message
    });
  }
});

/**
 * Mapa de rangos de código postal → código de provincia (letra ISO)
 * Fuente: Correo Argentino — tabla oficial de códigos postales
 */
const cpToProvinceCode = (cp) => {
  const n = parseInt(cp);
  if (isNaN(n)) return null;
  // CABA
  if (n >= 1000 && n <= 1499) return "C";
  // Buenos Aires
  if (n >= 1500 && n <= 1999) return "B";
  if (n >= 2800 && n <= 2999) return "B";
  if (n >= 6000 && n <= 8199) return "B";
  // Catamarca
  if (n >= 4700 && n <= 4751) return "K";
  // Chaco
  if (n >= 3500 && n <= 3749) return "H";
  // Chubut
  if (n >= 9000 && n <= 9220) return "U";
  // Córdoba
  if (n >= 5000 && n <= 5999) return "X";
  // Corrientes
  if (n >= 3400 && n <= 3499) return "W";
  // Entre Ríos
  if (n >= 3100 && n <= 3299) return "E";
  // Formosa
  if (n >= 3600 && n <= 3699) return "P";
  // Jujuy
  if (n >= 4600 && n <= 4699) return "Y";
  // La Pampa
  if (n >= 6200 && n <= 6399) return "L";
  // La Rioja
  if (n >= 5300 && n <= 5399) return "F";
  // Mendoza
  if (n >= 5500 && n <= 5699) return "M";
  // Misiones
  if (n >= 3300 && n <= 3399) return "N";
  // Neuquén
  if (n >= 8300 && n <= 8399) return "Q";
  // Río Negro
  if (n >= 8400 && n <= 8599) return "R";
  // Salta
  if (n >= 4400 && n <= 4599) return "A";
  // San Juan
  if (n >= 5400 && n <= 5499) return "J";
  // San Luis
  if (n >= 5700 && n <= 5799) return "D";
  // Santa Cruz
  if (n >= 9300 && n <= 9499) return "Z";
  // Santa Fe
  if (n >= 2000 && n <= 2699) return "S";
  if (n >= 3000 && n <= 3099) return "S";
  // Santiago del Estero
  if (n >= 4200 && n <= 4399) return "G";
  // Tierra del Fuego
  if (n >= 9400 && n <= 9499) return "V";
  if (n >= 9410 && n <= 9420) return "V";
  // Tucumán
  if (n >= 4000 && n <= 4199) return "T";
  // Fallback Buenos Aires (rango general)
  if (n >= 1500 && n < 2000) return "B";
  return null;
};

/**
 * GET /api/correo-argentino/agencies-by-cp
 * Obtener sucursales cercanas a un código postal
 */
router.get("/correo-argentino/agencies-by-cp", async (req, res) => {
  try {
    const { postalCode } = req.query;

    if (!postalCode || postalCode.length < 4) {
      return res.status(400).json({ error: "Se requiere código postal válido" });
    }

    const provinceCode = cpToProvinceCode(postalCode);
    if (!provinceCode) {
      return res.status(400).json({ error: "No se pudo determinar la provincia para ese CP" });
    }

    const allAgencies = await getAgencies(provinceCode);

    // Filtrar solo las activas con servicio de retiro
    const active = allAgencies.filter(a =>
      a.status === "ACTIVE" &&
      a.services?.pickupAvailability
    );

    const cpNum = parseInt(postalCode);

    // Extraer el CP numérico de un CPA (ej: "B1834FPU" → 1834)
    const extractCPFromCPA = (cpa) => {
      if (!cpa || typeof cpa !== "string") return NaN;
      const match = cpa.match(/\d{4}/);
      return match ? parseInt(match[0]) : NaN;
    };

    // Obtener todos los CPs asociados a una sucursal:
    // 1. nearByPostalCode (comma-separated list de CPs numéricos)
    // 2. postalCode del domicilio de la sucursal (formato CPA → extraer 4 dígitos)
    const getAgencyAllCPs = (a) => {
      const cps = [];
      if (a.nearByPostalCode) {
        a.nearByPostalCode.split(",").forEach(c => {
          const n = parseInt(c.trim());
          if (!isNaN(n)) cps.push(n);
        });
      }
      const ownCP = extractCPFromCPA(a.location?.address?.postalCode);
      if (!isNaN(ownCP) && !cps.includes(ownCP)) cps.push(ownCP);
      return cps;
    };

    // Buscar sucursales cercanas: rango ±50 del CP consultado
    const nearby = active.filter(a => {
      const agencyCPs = getAgencyAllCPs(a);
      return agencyCPs.some(cp => Math.abs(cp - cpNum) <= 50);
    });

    // Ordenar: primero las que tienen el CP exacto, luego por cercanía
    nearby.sort((a, b) => {
      const aCPs = getAgencyAllCPs(a);
      const bCPs = getAgencyAllCPs(b);
      const aExact = aCPs.includes(cpNum) ? 0 : 1;
      const bExact = bCPs.includes(cpNum) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      const aMin = Math.min(...aCPs.map(cp => Math.abs(cp - cpNum)));
      const bMin = Math.min(...bCPs.map(cp => Math.abs(cp - cpNum)));
      return aMin - bMin;
    });

    // Limitar a 20 resultados
    const result = nearby.length > 0 ? nearby.slice(0, 20) : active.slice(0, 20);

    // Formatear respuesta para el frontend
    const formatted = result.map(a => ({
      code: a.code,
      name: a.name,
      address: `${a.location?.address?.streetName || ""} ${a.location?.address?.streetNumber || ""}`.trim(),
      locality: a.location?.address?.locality || a.location?.address?.city || "",
      postalCode: a.location?.address?.postalCode || "",
      phone: a.phone || "",
      hours: a.hours,
      latitude: a.location?.latitude,
      longitude: a.location?.longitude,
    }));

    res.json({
      provinceCode,
      total: formatted.length,
      agencies: formatted
    });
  } catch (error) {
    console.error("Error obteniendo sucursales por CP:", error);
    res.status(500).json({
      error: "Error al obtener sucursales",
      message: error.message
    });
  }
});

/**
 * POST /api/correo-argentino/import/:orderId
 * Registrar orden en Correo Argentino (requiere autenticación admin)
 */
router.post("/correo-argentino/import/:orderId", verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Verificar que no se haya registrado previamente
    if (order.correoArgentinoTracking) {
      return res.status(400).json({
        error: "Esta orden ya fue registrada en Correo Argentino",
        tracking: order.correoArgentinoTracking
      });
    }

    // Preparar datos de la orden
    const orderData = {
      code: order.code,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone || "",
        cellPhone: order.customer.cellPhone || ""
      },
      shipping: {
        method: order.shipping.method,
        streetName: order.shipping.address?.split(',')[0]?.trim() || "",
        streetNumber: order.shipping.address?.match(/\d+/)?.[0] || "S/N",
        floor: "",
        apartment: "",
        city: order.shipping.city || "",
        provinceCode: order.shipping.provinceCode || "C",
        postalCode: order.shipping.postalCode || "",
        agency: order.shipping.pickPoint || null,
        weight: order.shipping.weight || 1000,
        height: order.shipping.height || 20,
        width: order.shipping.width || 20,
        length: order.shipping.length || 30
      },
      totals: order.totals
    };

    // Registrar en Correo Argentino
    const result = await importShipping(orderData);

    // Actualizar orden con referencia de Correo Argentino
    // La API no devuelve tracking number — usamos extOrderId como referencia
    order.correoArgentinoTracking = result.extOrderId;
    order.correoArgentinoRegisteredAt = result.createdAt;
    order.timeline.push({
      status: "Registrado en Correo Argentino",
      date: new Date().toLocaleString("es-AR")
    });
    await order.save();

    res.json({
      success: true,
      message: "Orden registrada exitosamente en Correo Argentino",
      extOrderId: result.extOrderId,
      createdAt: result.createdAt
    });
  } catch (error) {
    console.error("Error registrando orden en Correo Argentino:", error);
    res.status(500).json({
      error: "Error al registrar orden",
      message: error.message
    });
  }
});

/**
 * GET /api/correo-argentino/tracking/:shippingId
 * Obtener tracking de un envío
 */
router.get("/correo-argentino/tracking/:shippingId", async (req, res) => {
  try {
    const { shippingId } = req.params;

    const tracking = await getTracking(shippingId);
    res.json(tracking);
  } catch (error) {
    console.error("Error obteniendo tracking:", error);
    res.status(500).json({
      error: "Error al obtener tracking",
      message: error.message
    });
  }
});

/**
 * POST /api/correo-argentino/import-batch
 * Registrar múltiples órdenes en Correo Argentino (requiere autenticación admin)
 */
router.post("/correo-argentino/import-batch", verifyAdmin, async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de IDs de órdenes" });
    }

    const results = [];
    const errors = [];

    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId);

        if (!order) {
          errors.push({ orderId, error: "Orden no encontrada" });
          continue;
        }

        if (order.correoArgentinoTracking) {
          errors.push({
            orderId,
            code: order.code,
            error: "Ya registrada",
            tracking: order.correoArgentinoTracking
          });
          continue;
        }

        const orderData = {
          code: order.code,
          customer: {
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone || "",
            cellPhone: order.customer.cellPhone || ""
          },
          shipping: {
            method: order.shipping.method,
            streetName: order.shipping.address?.split(',')[0]?.trim() || "",
            streetNumber: order.shipping.address?.match(/\d+/)?.[0] || "S/N",
            floor: "",
            apartment: "",
            city: order.shipping.city || "",
            provinceCode: order.shipping.provinceCode || "C",
            postalCode: order.shipping.postalCode || "",
            agency: order.shipping.pickPoint || null,
            weight: order.shipping.weight || 1000,
            height: order.shipping.height || 20,
            width: order.shipping.width || 20,
            length: order.shipping.length || 30
          },
          totals: order.totals
        };

        const result = await importShipping(orderData);

        // La API no devuelve tracking — usamos extOrderId como referencia
        order.correoArgentinoTracking = result.extOrderId;
        order.correoArgentinoRegisteredAt = result.createdAt;
        order.timeline.push({
          status: "Registrado en Correo Argentino",
          date: new Date().toLocaleString("es-AR")
        });
        await order.save();

        results.push({
          orderId,
          code: order.code,
          extOrderId: result.extOrderId
        });
      } catch (error) {
        errors.push({
          orderId,
          error: error.message
        });
      }
    }

    res.json({
      success: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error("Error en registro masivo:", error);
    res.status(500).json({
      error: "Error al registrar órdenes",
      message: error.message
    });
  }
});

export default router;
