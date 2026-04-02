// routes/correoArgentinoRoutes.js
import express from "express";
const router = express.Router();
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {
  cotizarCorreoArgentino,
  getAgencies,
  importShipping,
  getTracking
} from "../services/shipping/correoArgentinoApi.js";
import { calculatePackage } from "../services/shipping/utils.js";
import { cpToProvinceCode, validateCpProvinceRanges } from "../services/shipping/cpProvinceMap.js";

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

const cpMapValidation = validateCpProvinceRanges();
if (!cpMapValidation.ok) {
  console.error("[Correo Argentino] CP map invalido", cpMapValidation);
}

const normalizeProvince = (value) =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const provinceNameToCode = (name) => {
  const normalized = normalizeProvince(name);
  const map = {
    "caba": "C",
    "capital federal": "C",
    "ciudad autonoma de buenos aires": "C",
    "buenos aires": "B",
    "catamarca": "K",
    "chaco": "H",
    "chubut": "U",
    "cordoba": "X",
    "corrientes": "W",
    "entre rios": "E",
    "formosa": "P",
    "jujuy": "Y",
    "la pampa": "L",
    "la rioja": "F",
    "mendoza": "M",
    "misiones": "N",
    "neuquen": "Q",
    "rio negro": "R",
    "salta": "A",
    "san juan": "J",
    "san luis": "D",
    "santa cruz": "Z",
    "santa fe": "S",
    "santiago del estero": "G",
    "tierra del fuego": "V",
    "tucuman": "T"
  };
  return map[normalized] || null;
};

const normalizeProvinceCode = (value) => {
  const code = (value || "").toString().trim().toUpperCase();
  return /^[A-Z]$/.test(code) ? code : null;
};

const resolveProvinceCode = (orderShipping, orderCode = "N/A") => {
  if (!orderShipping) return null;
  const explicitCode = normalizeProvinceCode(orderShipping.provinceCode);
  const fromProvinceName = provinceNameToCode(orderShipping.province);
  const fromPostal = cpToProvinceCode(orderShipping.postalCode);

  if (fromProvinceName && fromPostal && fromProvinceName !== fromPostal) {
    console.warn(
      `[Correo Argentino] Conflicto provincia/CP en orden ${orderCode}: province="${orderShipping.province}", postalCode="${orderShipping.postalCode}", provinceByName=${fromProvinceName}, provinceByCP=${fromPostal}`
    );
  }

  return (
    explicitCode ||
    fromProvinceName ||
    fromPostal
  );
};

const buildOrderData = async (order) => {
  const orderProvinceCode = resolveProvinceCode(order.shipping, order.code) || "C";
  const productIds = (order.items || []).map((i) => i.productId).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  const packageProducts = (order.items || []).map((item) => {
    const dbProduct = productMap[item.productId?.toString?.() || item.productId] || {};
    return {
      quantity: item.quantity || 1,
      weight: dbProduct.weight,
      dimensions: dbProduct.dimensions,
    };
  });

  const { weight, height, width, length } = calculatePackage(packageProducts);

  return {
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
      city: order.shipping.localidad || order.shipping.city || "",
      provinceCode: orderProvinceCode,
      postalCode: order.shipping.postalCode || "",
      agency: order.shipping.branchCode || order.shipping.pickPoint || null,
      weight: Math.round((weight || 0.3) * 1000), // kg → gramos
      height: height || 5,
      width: width || 5,
      length: length || 5
    },
    totals: order.totals
  };
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
    const { agencyCode } = req.body || {};

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
    const orderData = await buildOrderData(order);

    // Permitir override del código de sucursal para órdenes sin branchCode guardado
    if (agencyCode) {
      orderData.shipping.agency = agencyCode;
    }

    // Validar que envíos a sucursal tengan código de sucursal
    const isBranchMethod = ["correo-branch", "branch"].includes(order.shipping?.method);
    if (isBranchMethod && !orderData.shipping.agency) {
      return res.status(400).json({
        error: "Falta código de sucursal. Ingresalo manualmente en el panel antes de registrar.",
        message: "Falta código de sucursal. Ingresalo manualmente en el panel antes de registrar."
      });
    }

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

        const orderData = await buildOrderData(order);

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
