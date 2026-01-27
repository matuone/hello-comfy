import express from "express";
import SiteConfig from "../models/SiteConfig.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import stockAlertService from '../services/stockAlertService.js';

const router = express.Router();

// Endpoint temporal para forzar el envío del email de bajo stock SOLO para admins
router.post("/force-stock-alert", verifyAdmin, async (req, res) => {
  try {
    // Forzar ejecución del envío (ignora la fecha)
    const lista = await stockAlertService.getLowStockList();
    if (!lista.length) return res.status(400).json({ ok: false, message: "No hay productos con bajo stock" });
    await stockAlertService.sendStockAlertEmail(lista);
    // Actualizar la fecha de último envío
    let config = await SiteConfig.findOne({ key: "lastStockAlert" });
    if (!config) {
      config = new SiteConfig({ key: "lastStockAlert", value: new Date().toISOString() });
    } else {
      config.value = new Date().toISOString();
    }
    await config.save();
    res.json({ ok: true, message: "Email de bajo stock enviado" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Obtener el estado de mantenimiento (público)
router.get("/maintenance", async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ key: "maintenanceMode" });
    if (!config) {
      // Si la colección no existe o está vacía, crear el valor por defecto
      try {
        config = await SiteConfig.create({
          key: "maintenanceMode",
          value: false,
        });
      } catch (err) {
        // Si hay un error de índice duplicado, buscar de nuevo
        config = await SiteConfig.findOne({ key: "maintenanceMode" });
      }
    }
    res.json({ maintenanceMode: config?.value ?? false });
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
});

// Actualizar el estado de mantenimiento (solo admin)
router.put("/maintenance", verifyAdmin, async (req, res) => {
  try {
    const { maintenanceMode } = req.body;

    let config = await SiteConfig.findOne({ key: "maintenanceMode" });

    if (!config) {
      config = await SiteConfig.create({
        key: "maintenanceMode",
        value: maintenanceMode,
      });
    } else {
      config.value = maintenanceMode;
      config.updatedAt = Date.now();
      await config.save();
    }

    res.json({ maintenanceMode: config.value });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
});

// Obtener configuración de home copy (público)
router.get("/home-copy", async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ key: "homeCopy" });

    if (!config) {
      config = await SiteConfig.create({
        key: "homeCopy",
        value: {
          title: "Bienvenid@ a Hello-Comfy",
          description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt aliquam accusantium porro, quidem nisi ad error quibusdam illum mollitia, magnam quasi animi, hic quis laudantium? Quisquam reprehenderit excepturi magni quasi?"
        },
      });
    }

    res.json(config.value);
  } catch (error) {
    console.error("Error al obtener home copy:", error);
    res.status(500).json({ error: "Error al obtener home copy" });
  }
});

// Actualizar configuración de home copy (solo admin)
router.put("/home-copy", verifyAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;

    let config = await SiteConfig.findOne({ key: "homeCopy" });

    if (!config) {
      config = await SiteConfig.create({
        key: "homeCopy",
        value: { title, description },
      });
    } else {
      config.value = { title, description };
      config.updatedAt = Date.now();
      await config.save();
    }

    res.json(config.value);
  } catch (error) {
    console.error("Error al actualizar home copy:", error);
    res.status(500).json({ error: "Error al actualizar home copy" });
  }
});

// Nueva ruta para AnnouncementBar messages
router.get("/announcement-bar-messages", async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ key: "announcementBarMessages" });
    if (!config) {
      config = await SiteConfig.create({
        key: "announcementBarMessages",
        value: [
          "¡Envío gratis en compras +$190.000! 🤑",
          "10% OFF X TRANSFERENCIA 💳",
          "3x2 en remeras sólo hoy 🧸"
        ]
      });
    }
    res.json({ messages: config.value });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mensajes AnnouncementBar" });
  }
});

router.put("/announcement-bar-messages", verifyAdmin, async (req, res) => {
  try {
    const { messages } = req.body;
    let config = await SiteConfig.findOne({ key: "announcementBarMessages" });
    if (!config) {
      config = await SiteConfig.create({ key: "announcementBarMessages", value: messages });
    } else {
      config.value = messages;
      config.updatedAt = Date.now();
      await config.save();
    }
    res.json({ messages: config.value });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar mensajes AnnouncementBar" });
  }
});

export default router;
