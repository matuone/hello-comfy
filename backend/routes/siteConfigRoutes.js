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

export default router;
