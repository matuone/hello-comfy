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

    // Actualizar orden con tracking
    order.correoArgentinoTracking = result.trackingNumber;
    order.correoArgentinoRegisteredAt = result.createdAt;
    order.timeline.push({
      status: "Registrado en Correo Argentino",
      date: new Date().toLocaleString("es-AR")
    });
    await order.save();

    res.json({
      success: true,
      message: "Orden registrada exitosamente en Correo Argentino",
      tracking: result.trackingNumber,
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

        order.correoArgentinoTracking = result.trackingNumber;
        order.correoArgentinoRegisteredAt = result.createdAt;
        order.timeline.push({
          status: "Registrado en Correo Argentino",
          date: new Date().toLocaleString("es-AR")
        });
        await order.save();

        results.push({
          orderId,
          code: order.code,
          tracking: result.trackingNumber
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
