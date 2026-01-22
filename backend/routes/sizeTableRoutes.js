import express from "express";
import SizeTable from "../models/SizeTable.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import {
  generateSizeTableComponent,
  deleteSizeTableComponent,
  updateSizeTableComponent,
} from "../services/sizeTableService.js";

const router = express.Router();

// Obtener todas las tablas de talles (público)
router.get("/", async (req, res) => {
  try {
    const tables = await SizeTable.find({ active: true }).sort({ order: 1, displayName: 1 });
    res.json(tables);
  } catch (error) {
    console.error("Error al obtener tablas de talles:", error);
    res.status(500).json({ error: "Error al obtener tablas de talles" });
  }
});

// Obtener todas las tablas (incluyendo inactivas) - Admin
router.get("/all", verifyAdmin, async (req, res) => {
  try {
    const tables = await SizeTable.find().sort({ order: 1, displayName: 1 });
    res.json(tables);
  } catch (error) {
    console.error("Error al obtener tablas:", error);
    res.status(500).json({ error: "Error al obtener tablas" });
  }
});

// Obtener una tabla por ID
router.get("/:id", async (req, res) => {
  try {
    const table = await SizeTable.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ error: "Tabla no encontrada" });
    }
    res.json(table);
  } catch (error) {
    console.error("Error al obtener tabla:", error);
    res.status(500).json({ error: "Error al obtener tabla" });
  }
});

// Crear nueva tabla de talles - Admin
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { name, displayName, sizes, measurements, note } = req.body;

    const existingTable = await SizeTable.findOne({ name });
    if (existingTable) {
      return res.status(400).json({ error: "Ya existe una tabla con ese nombre" });
    }

    const newTable = new SizeTable({
      name,
      displayName,
      sizes,
      measurements,
      note,
    });

    await newTable.save();

    // Generar el archivo JSX del componente
    try {
      const componentInfo = await generateSizeTableComponent(newTable);
      // console.log("Componente generado:", componentInfo);
    } catch (error) {
      console.error("Error generando componente JSX:", error);
      // No fallar la creación si el componente no se genera
    }
    res.status(201).json(newTable);
  } catch (error) {
    console.error("Error al crear tabla:", error);
    res.status(500).json({ error: "Error al crear tabla de talles" });
  }
});

// Actualizar tabla de talles - Admin
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { displayName, sizes, measurements, note, active } = req.body;

    // Actualizar el archivo JSX del componente
    try {
      await updateSizeTableComponent(table);
    } catch (error) {
      console.error("Error actualizando componente JSX:", error);
    }

    const table = await SizeTable.findByIdAndUpdate(
      req.params.id,
      { displayName, sizes, measurements, note, active },
      { new: true, runValidators: true }
    );

    if (!table) {

      // Eliminar el archivo JSX del componente
      try {
        await deleteSizeTableComponent(table.name);
      } catch (error) {
        console.error("Error eliminando componente JSX:", error);
      }

      return res.status(404).json({ error: "Tabla no encontrada" });
    }

    res.json(table);
  } catch (error) {
    console.error("Error al actualizar tabla:", error);
    res.status(500).json({ error: "Error al actualizar tabla" });
  }
});

// Reordenar tablas de talles - Admin
router.put("/reorder/all", verifyAdmin, async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Order debe ser un array de IDs" });
    }

    // Actualizar el order de cada tabla
    const updates = order.map((id, index) =>
      SizeTable.findByIdAndUpdate(id, { order: index + 1 })
    );

    await Promise.all(updates);

    res.json({ message: "Orden actualizado" });
  } catch (error) {
    console.error("Error al reordenar tablas:", error);
    res.status(500).json({ error: "Error al reordenar tablas" });
  }
});

// Eliminar tabla de talles - Admin
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const table = await SizeTable.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ error: "Tabla no encontrada" });
    }
    res.json({ message: "Tabla eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar tabla:", error);
    res.status(500).json({ error: "Error al eliminar tabla" });
  }
});

export default router;
