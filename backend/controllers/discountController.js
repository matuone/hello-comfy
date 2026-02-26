import DiscountRule from "../models/DiscountRule.js";
import SiteConfig from "../models/SiteConfig.js";

// 📌 Obtener todas las reglas
export const getDiscountRules = async (req, res) => {
  try {
    const rules = await DiscountRule.find().sort({ createdAt: -1 });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener reglas de descuento" });
  }
};

// 📌 Crear una nueva regla
export const createDiscountRule = async (req, res) => {
  try {
    const data = { ...req.body };
    // Normalizar subcategoría vacía a "none"
    if (!data.subcategory || data.subcategory.trim() === "") {
      data.subcategory = "none";
    }
    const rule = new DiscountRule(data);
    await rule.save();
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: "Error al crear la regla" });
  }
};

// 📌 Editar una regla
export const updateDiscountRule = async (req, res) => {
  try {
    const data = { ...req.body };
    // Normalizar subcategoría vacía a "none"
    if (!data.subcategory || data.subcategory.trim() === "") {
      data.subcategory = "none";
    }
    const rule = await DiscountRule.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar la regla" });
  }
};

// 📌 Eliminar una regla
export const deleteDiscountRule = async (req, res) => {
  try {
    await DiscountRule.findByIdAndDelete(req.params.id);
    res.json({ message: "Regla eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la regla" });
  }
};

// 📌 Obtener el threshold de envío gratis
export const getFreeShippingThreshold = async (req, res) => {
  try {
    const config = await SiteConfig.findOne({ key: "freeShippingThreshold" });
    const defaultValue = { threshold: 0, isActive: false };
    const configValue = config?.value || defaultValue;

    res.json({
      threshold: configValue.threshold || 0,
      isActive: configValue.isActive !== undefined ? configValue.isActive : false
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener threshold de envío gratis" });
  }
};

// 📌 Actualizar el threshold de envío gratis
export const updateFreeShippingThreshold = async (req, res) => {
  try {
    const { threshold, isActive } = req.body;
    if (typeof threshold !== "number" || threshold < 0) {
      return res.status(400).json({ error: "El threshold debe ser un número positivo" });
    }

    const config = await SiteConfig.findOneAndUpdate(
      { key: "freeShippingThreshold" },
      {
        value: { threshold, isActive: isActive === true },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      threshold: config.value.threshold,
      isActive: config.value.isActive
    });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar threshold de envío gratis" });
  }
};
