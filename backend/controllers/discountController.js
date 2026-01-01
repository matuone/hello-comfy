import DiscountRule from "../models/DiscountRule.js";

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
    const rule = new DiscountRule(req.body);
    await rule.save();
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: "Error al crear la regla" });
  }
};

// 📌 Editar una regla
export const updateDiscountRule = async (req, res) => {
  try {
    const rule = await DiscountRule.findByIdAndUpdate(
      req.params.id,
      req.body,
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
