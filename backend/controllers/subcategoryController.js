import Subcategory from "../models/Subcategory.js";

const normalize = (str = "") => {
  const clean = str.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

const ALLOWED_CATEGORIES = ["Indumentaria", "Cute items", "Merch"];

export const listSubcategories = async (_req, res) => {
  try {
    const subs = await Subcategory.find().sort({ category: 1, order: 1, name: 1 });
    res.json(subs);
  } catch (err) {
    console.error("Error al listar subcategorías");
    res.status(500).json({ error: "Error al listar subcategorías" });
  }
};

export const createSubcategory = async (req, res) => {
  try {
    const { category, name } = req.body || {};

    if (!category || !name) {
      return res.status(400).json({ error: "Categoría y nombre son requeridos" });
    }

    const normalizedCategory = normalize(category);
    const normalizedName = normalize(name);

    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({ error: "Categoría no permitida" });
    }

    const last = await Subcategory.find({ category: normalizedCategory })
      .sort({ order: -1 })
      .limit(1);

    const nextOrder = (last[0]?.order ?? 0) + 1;

    const created = await Subcategory.create({
      category: normalizedCategory,
      name: normalizedName,
      order: nextOrder,
    });

    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "La subcategoría ya existe en esa categoría" });
    }
    console.error("Error al crear subcategoría");
    res.status(500).json({ error: "Error al crear subcategoría" });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name } = req.body || {};

    if (!category || !name) {
      return res.status(400).json({ error: "Categoría y nombre son requeridos" });
    }

    const normalizedCategory = normalize(category);
    const normalizedName = normalize(name);

    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({ error: "Categoría no permitida" });
    }

    const updated = await Subcategory.findByIdAndUpdate(
      id,
      { category: normalizedCategory, name: normalizedName },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }

    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Ya existe esa subcategoría en la categoría" });
    }
    console.error("Error al actualizar subcategoría");
    res.status(500).json({ error: "Error al actualizar subcategoría" });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subcategory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }

    res.json({ message: "Subcategoría eliminada" });
  } catch (err) {
    console.error("Error al eliminar subcategoría");
    res.status(500).json({ error: "Error al eliminar subcategoría" });
  }
};

export const reorderSubcategories = async (req, res) => {
  try {
    const { category, order } = req.body || {};

    if (!category || !Array.isArray(order)) {
      return res.status(400).json({ error: "Categoría y orden son requeridos" });
    }

    const normalizedCategory = normalize(category);
    if (!ALLOWED_CATEGORIES.includes(normalizedCategory)) {
      return res.status(400).json({ error: "Categoría no permitida" });
    }

    const updates = order.map((id, idx) =>
      Subcategory.findOneAndUpdate(
        { _id: id, category: normalizedCategory },
        { order: idx + 1 },
        { new: true }
      )
    );

    await Promise.all(updates);

    res.json({ message: "Orden actualizado" });
  } catch (err) {
    console.error("Error al reordenar subcategorías");
    res.status(500).json({ error: "Error al reordenar subcategorías" });
  }
};
