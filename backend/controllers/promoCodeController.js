import PromoCode from "../models/PromoCode.js";

// 📌 Obtener todos los códigos
export const getPromoCodes = async (req, res) => {
  try {
    const codes = await PromoCode.find().sort({ createdAt: -1 });
    res.json(codes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener códigos promocionales" });
  }
};

// 📌 Crear un nuevo código
export const createPromoCode = async (req, res) => {
  try {
    const code = new PromoCode(req.body);
    await code.save();
    res.json(code);
  } catch (err) {
    res.status(500).json({ error: "Error al crear el código promocional" });
  }
};

// 📌 Editar un código
export const updatePromoCode = async (req, res) => {
  try {
    const code = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(code);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el código promocional" });
  }
};

// 📌 Eliminar un código
export const deletePromoCode = async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ message: "Código promocional eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el código promocional" });
  }
};

// 📌 Validar un código (para el carrito)
export const validatePromoCode = async (req, res) => {
  try {
    const { code } = req.body;

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!promo) {
      return res.status(404).json({ valid: false, message: "Código inválido" });
    }

    const now = new Date();

    if (now < promo.validFrom || now > promo.validUntil) {
      return res.status(400).json({
        valid: false,
        message: "Código expirado o aún no disponible"
      });
    }

    if (promo.singleUse && promo.usedAt) {
      return res.status(400).json({
        valid: false,
        message: "Este código ya fue utilizado"
      });
    }

    res.json({
      valid: true,
      discount: promo.discount,
      category: promo.category,
      subcategory: promo.subcategory
    });
  } catch (err) {
    res.status(500).json({ error: "Error al validar el código promocional" });
  }
};
