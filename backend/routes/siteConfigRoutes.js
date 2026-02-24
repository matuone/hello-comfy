import express from "express";
import SiteConfig from "../models/SiteConfig.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import { getLowStockList, sendStockAlertEmail } from '../services/stockAlertService.js';

const router = express.Router();

// Endpoint temporal para forzar el envío del email de bajo stock SOLO para admins
router.post("/force-stock-alert", verifyAdmin, async (req, res) => {
  try {
    // Forzar ejecución del envío (ignora la fecha)
    const lista = await getLowStockList();
    if (!lista.length) return res.status(400).json({ ok: false, message: "No hay productos con bajo stock" });
    await sendStockAlertEmail(lista);
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
    const config = await SiteConfig.findOne({ key: "maintenanceMode" });
    const maintenanceMode = config ? config.value : false;
    res.json({ maintenanceMode });
  } catch (error) {
    res.json({ maintenanceMode: false });
  }
});

// Actualizar el estado de mantenimiento (solo admin)
router.put("/maintenance", verifyAdmin, async (req, res) => {
  try {
    const { maintenanceMode } = req.body;
    console.log("PUT /maintenance:", { maintenanceMode, adminId: req.user?.id });

    let config = await SiteConfig.findOne({ key: "maintenanceMode" });

    if (!config) {
      config = new SiteConfig({
        key: "maintenanceMode",
        value: maintenanceMode,
      });
    } else {
      config.value = maintenanceMode;
      config.updatedAt = Date.now();
    }

    await config.save();
    console.log("Configuracion guardada:", config);

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

// ============================
// Discount Badge Style
// ============================
router.get("/discount-badge-style", async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ key: "discountBadgeStyle" });
    if (!config) {
      config = await SiteConfig.create({
        key: "discountBadgeStyle",
        value: {
          background: "#ff4444",
          color: "#ffffff",
        },
      });
    }
    res.json(config.value);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estilo de badge de descuento" });
  }
});

router.put("/discount-badge-style", verifyAdmin, async (req, res) => {
  try {
    const { background, color } = req.body;
    let config = await SiteConfig.findOne({ key: "discountBadgeStyle" });
    if (!config) {
      config = await SiteConfig.create({
        key: "discountBadgeStyle",
        value: { background, color },
      });
    } else {
      config.value = { background, color };
      config.updatedAt = Date.now();
      await config.save();
    }
    res.json(config.value);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estilo de badge de descuento" });
  }
});

export default router;
