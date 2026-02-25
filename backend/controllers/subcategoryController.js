import Subcategory from "../models/Subcategory.js";
import Product from "../models/Product.js";

const normalize = (str = "") => {
  const clean = str.trim().replace(/\s*\/\s*/g, " / ");
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
    const sub = await Subcategory.findByIdAndUpdate(
      id,
      { hidden: true },
      { new: true }
    );

    if (!sub) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }

    res.json({ message: "Subcategoría oculta del menú" });
  } catch (err) {
    console.error("Error al ocultar subcategoría");
    res.status(500).json({ error: "Error al ocultar subcategoría" });
  }
};

export const restoreSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subcategory.findByIdAndUpdate(
      id,
      { hidden: false },
      { new: true }
    );

    if (!sub) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }

    res.json({ message: "Subcategoría restaurada", subcategory: sub });
  } catch (err) {
    console.error("Error al restaurar subcategoría");
    res.status(500).json({ error: "Error al restaurar subcategoría" });
  }
};

export const permanentDeleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subcategory.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Subcategoría no encontrada" });
    }

    res.json({ message: "Subcategoría eliminada permanentemente" });
  } catch (err) {
    console.error("Error al eliminar subcategoría permanentemente");
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

/**
 * Sincroniza subcategorías: crea documentos Subcategory para
 * cualquier subcategoría que exista en productos pero no en la colección.
 */
export const syncSubcategories = async (_req, res) => {
  try {
    const productos = await Product.find({}, "category subcategory");
    const existentes = await Subcategory.find();

    // Mapa de existentes: "Categoria||Nombre" => true
    const existenteSet = new Set(
      existentes.map((s) => `${s.category}||${s.name}`)
    );

    // Mapa de subcategorías existentes para resolver categoría correcta
    const subToCatMap = {};
    existentes.forEach((s) => {
      subToCatMap[s.name] = s.category;
    });

    // Recopilar pares únicos de productos
    // Usar la tabla Subcategory como fuente de verdad para la relación sub→categoría
    const pairsMap = new Map();
    productos.forEach((p) => {
      const subs = Array.isArray(p.subcategory) ? p.subcategory : [p.subcategory];
      subs.forEach((sub) => {
        if (!sub) return;
        const normalizedSub = normalize(sub);
        // Si ya existe en la tabla, sabemos su categoría real
        const realCat = subToCatMap[normalizedSub];
        if (realCat) {
          // Ya existe, no necesita crearse
          return;
        }
        // Si no existe, intentar asignarla a la primera categoría válida del producto
        const cats = Array.isArray(p.category) ? p.category : [p.category];
        const validCat = cats.find((c) => c && ALLOWED_CATEGORIES.includes(c));
        if (validCat) {
          const key = `${validCat}||${normalizedSub}`;
          if (!existenteSet.has(key) && !pairsMap.has(key)) {
            pairsMap.set(key, { category: validCat, name: normalizedSub });
          }
        }
      });
    });

    // Obtener el siguiente order por categoría
    const maxOrders = {};
    for (const cat of ALLOWED_CATEGORIES) {
      const last = await Subcategory.find({ category: cat })
        .sort({ order: -1 })
        .limit(1);
      maxOrders[cat] = last[0]?.order ?? 0;
    }

    // Crear las que faltan
    const toCreate = [];
    for (const [, pair] of pairsMap) {
      maxOrders[pair.category] += 1;
      toCreate.push({
        category: pair.category,
        name: pair.name,
        order: maxOrders[pair.category],
      });
    }

    let created = [];
    if (toCreate.length > 0) {
      created = await Subcategory.insertMany(toCreate, { ordered: false });
    }

    res.json({
      message: `Sincronización completa. ${created.length} subcategorías nuevas creadas.`,
      created: created.length,
      nuevas: created.map((s) => `${s.category}: ${s.name}`),
    });
  } catch (err) {
    console.error("Error al sincronizar subcategorías:", err);
    res.status(500).json({ error: "Error al sincronizar subcategorías" });
  }
};
