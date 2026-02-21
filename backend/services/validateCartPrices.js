// backend/services/validateCartPrices.js
import Product from "../models/Product.js";
import DiscountRule from "../models/DiscountRule.js";
import PromoCode from "../models/PromoCode.js";

/**
 * Valida y recalcula los precios del carrito usando los datos reales de la BD.
 * NUNCA confiar en los precios enviados desde el frontend.
 *
 * @param {Array} clientItems - Items del carrito enviados por el frontend
 * @param {Object} options - Opciones adicionales
 * @param {String} options.promoCode - Código promocional (opcional)
 * @param {String} options.paymentMethod - Método de pago (para descuento por transferencia)
 * @returns {Object} { validatedItems, totals, warnings }
 */
export async function validateCartPrices(clientItems, options = {}) {
  const { promoCode, paymentMethod } = options;
  const warnings = [];

  if (!clientItems || !Array.isArray(clientItems) || clientItems.length === 0) {
    throw new Error("El carrito está vacío o es inválido");
  }

  // 1) Obtener todos los productIds del carrito
  const productIds = [...new Set(clientItems.map((item) => item.productId))];

  // 2) Buscar todos los productos en la BD de una sola vez
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  // 3) Obtener reglas de descuento activas
  const discountRules = await DiscountRule.find({});

  // 4) Validar cada item y recalcular con precios reales
  const validatedItems = [];

  for (const clientItem of clientItems) {
    const dbProduct = productMap[clientItem.productId];

    if (!dbProduct) {
      warnings.push(`Producto ${clientItem.productId} no encontrado en la BD, se omite`);
      continue;
    }

    // Detectar manipulación de precio
    if (clientItem.price !== dbProduct.price) {
      warnings.push(
        `Precio manipulado detectado para "${dbProduct.name}": ` +
        `cliente envió $${clientItem.price}, precio real $${dbProduct.price}`
      );
    }

    // Detectar manipulación de descuento
    if (clientItem.discount !== (dbProduct.discount || 0)) {
      warnings.push(
        `Descuento manipulado detectado para "${dbProduct.name}": ` +
        `cliente envió ${clientItem.discount}%, descuento real ${dbProduct.discount || 0}%`
      );
    }

    validatedItems.push({
      productId: dbProduct._id,
      name: dbProduct.name,
      category: dbProduct.category,
      subcategory: dbProduct.subcategory,
      price: dbProduct.price, // ← PRECIO REAL de la BD
      discount: dbProduct.discount || 0, // ← DESCUENTO REAL de la BD
      image: clientItem.image || dbProduct.images?.[0] || "",
      size: clientItem.size || null,
      color: clientItem.color || null,
      quantity: Math.max(1, parseInt(clientItem.quantity) || 1),
    });
  }

  if (validatedItems.length === 0) {
    throw new Error("Ningún producto del carrito es válido");
  }

  // 5) Calcular subtotal con descuentos de producto y categoría
  let subtotal = 0;

  validatedItems.forEach((item) => {
    const base = item.price;

    // Buscar regla de descuento por categoría/subcategoría
    const categoryRule = discountRules.find(
      (r) =>
        r.category === item.category &&
        (r.subcategory === item.subcategory || r.subcategory === "none") &&
        r.type === "percentage"
    );

    // El descuento propio del producto tiene prioridad
    let discountPercent = item.discount;
    if (discountPercent === 0 && categoryRule) {
      discountPercent = categoryRule.discount;
    }

    const finalPrice =
      discountPercent > 0
        ? base - (base * discountPercent) / 100
        : base;

    subtotal += finalPrice * item.quantity;
  });

  // 6) Aplicar promociones 3x2
  let promo3x2Discount = 0;
  const rules3x2 = discountRules.filter((r) => r.type === "3x2");

  rules3x2.forEach((rule) => {
    const group = validatedItems.filter(
      (item) =>
        item.category === rule.category &&
        item.subcategory === rule.subcategory
    );

    const totalQty = group.reduce((acc, i) => acc + i.quantity, 0);

    if (totalQty >= 3) {
      const freeUnits = Math.floor(totalQty / 3);
      const sorted = [...group].sort((a, b) => a.price - b.price);
      const cheapest = sorted[0];
      promo3x2Discount += cheapest.price * freeUnits;
    }
  });

  let total = subtotal - promo3x2Discount;

  // 7) Aplicar código promocional (validar en BD)
  let promoDiscount = 0;
  if (promoCode) {
    const promo = await PromoCode.findOne({
      code: promoCode.toUpperCase(),
      active: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (promo) {
      const applicableItems = validatedItems.filter((item) => {
        const matchCategory = promo.category === "all" || item.category === promo.category;
        const matchSub = promo.subcategory === "all" || item.subcategory === promo.subcategory;
        return matchCategory && matchSub;
      });

      const promoSubtotal = applicableItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      promoDiscount = (promoSubtotal * promo.discount) / 100;
      total -= promoDiscount;
    } else {
      warnings.push(`Código promocional "${promoCode}" inválido o expirado`);
    }
  }

  // 8) Aplicar descuento por transferencia (10%)
  let transferDiscount = 0;
  if (paymentMethod === "transfer") {
    transferDiscount = total * 0.1;
    total -= transferDiscount;
  }

  // Asegurar que el total no sea negativo
  total = Math.max(0, Math.round(total * 100) / 100);

  return {
    validatedItems,
    totals: {
      subtotal: Math.round(subtotal * 100) / 100,
      promo3x2Discount: Math.round(promo3x2Discount * 100) / 100,
      promoDiscount: Math.round(promoDiscount * 100) / 100,
      transferDiscount: Math.round(transferDiscount * 100) / 100,
      shipping: 0,
      total,
    },
    warnings,
  };
}
