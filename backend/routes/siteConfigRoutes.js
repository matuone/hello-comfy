import express from "express";
import SiteConfig from "../models/SiteConfig.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Obtener el estado de mantenimiento (público)
router.get("/maintenance", async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ key: "maintenanceMode" });
    
    if (!config) {
      config = await SiteConfig.create({
        key: "maintenanceMode",
        value: false,
      });
    }

    res.json({ maintenanceMode: config.value });
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

export default router;
