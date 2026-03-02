// backend/services/validateCartPrices.js
import Product from "../models/Product.js";
import StockColor from "../models/StockColor.js";
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

  // 2) Buscar todos los productos en la BD de una sola vez (con stockColorId populado)
  const products = await Product.find({ _id: { $in: productIds } }).populate("stockColorId");
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

    // Detectar manipulación de precio (solo si el cliente envia un numero)
    if (typeof clientItem.price === "number" && clientItem.price !== dbProduct.price) {
      warnings.push(
        `Precio manipulado detectado para "${dbProduct.name}": ` +
        `cliente envió $${clientItem.price}, precio real $${dbProduct.price}`
      );
    }

    // Detectar manipulación de descuento (solo si el cliente envia un numero)
    if (typeof clientItem.discount === "number" && clientItem.discount !== (dbProduct.discount || 0)) {
      warnings.push(
        `Descuento manipulado detectado para "${dbProduct.name}": ` +
        `cliente envió ${clientItem.discount}%, descuento real ${dbProduct.discount || 0}%`
      );
    }

    // ⭐ VALIDAR CANTIDAD CONTRA STOCK INDIVIDUAL
    // Nunca confiar en la cantidad enviada por el cliente; verificar contra el stock real.
    const requestedQty = Math.max(1, parseInt(clientItem.quantity) || 1);
    const size = clientItem.size || null;
    if (size && dbProduct.stockColorId?.talles) {
      const tallesMap = dbProduct.stockColorId.talles;
      // talles es un Mongoose Map → usar .get(); si es objeto plano usar bracket
      const realStock = (typeof tallesMap.get === "function" ? tallesMap.get(size) : tallesMap[size]) ?? 0;
      if (realStock === 0) {
        throw new Error(
          `El producto "${dbProduct.name}" talle ${size} no tiene stock disponible.`
        );
      }
      if (requestedQty > realStock) {
        throw new Error(
          `Cantidad inválida para "${dbProduct.name}" talle ${size}: ` +
          `solicitaste ${requestedQty} pero solo hay ${realStock} en stock.`
        );
      }
    }
    // Límite absoluto anti-abuso (máx 50 unidades por ítem)
    if (requestedQty > 50) {
      throw new Error(`La cantidad máxima por producto es 50 unidades ("${dbProduct.name}").`);
    }

    validatedItems.push({
      productId: dbProduct._id,
      name: dbProduct.name,
      category: dbProduct.category,
      subcategory: dbProduct.subcategory,
      price: dbProduct.price, // ← PRECIO REAL de la BD
      discount: dbProduct.discount || 0, // ← DESCUENTO REAL de la BD
      image: clientItem.image || dbProduct.images?.[0] || "",
      size,
      color: clientItem.color || null,
      quantity: requestedQty,
      weight: dbProduct.weight || 0.3,
      dimensions: dbProduct.dimensions || { height: 5, width: 5, length: 5 },
      // ⭐ Para validación de stock compartido
      stockColorId: dbProduct.stockColorId?._id?.toString() || dbProduct.stockColorId?.toString() || null,
    });
  }

  if (validatedItems.length === 0) {
    throw new Error("Ningún producto del carrito es válido");
  }

  // ⭐ 4b) VALIDAR STOCK COMPARTIDO POR stockColorId + talle
  // Dos productos distintos pueden apuntar al mismo stockColorId (mismo color real).
  // Si la suma de cantidades pedidas supera el stock disponible → rechazar.
  {
    // Agrupar: { "<stockColorId>-<talle>": { totalQty, names[] } }
    const demandMap = {};
    for (const item of validatedItems) {
      if (!item.stockColorId || !item.size) continue;
      const key = `${item.stockColorId}-${item.size}`;
      if (!demandMap[key]) demandMap[key] = { totalQty: 0, names: [], stockColorId: item.stockColorId, size: item.size };
      demandMap[key].totalQty += item.quantity;
      demandMap[key].names.push(item.name);
    }

    // Obtener los stockColorIds únicos involucrados
    const uniqueStockColorIds = [...new Set(Object.values(demandMap).map((g) => g.stockColorId))];
    const stockColors = await StockColor.find({ _id: { $in: uniqueStockColorIds } });
    const stockColorMap = {};
    stockColors.forEach((sc) => { stockColorMap[sc._id.toString()] = sc; });

    for (const [, group] of Object.entries(demandMap)) {
      const sc = stockColorMap[group.stockColorId];
      if (!sc) continue;
      const tallesMapSC = sc.talles;
      const available = (tallesMapSC && typeof tallesMapSC.get === "function" ? tallesMapSC.get(group.size) : tallesMapSC?.[group.size]) ?? 0;
      if (group.totalQty > available) {
        throw new Error(
          `Stock insuficiente para el color "${sc.color}" talle ${group.size}: ` +
          `solicitaste ${group.totalQty} unidad(es) en total entre los productos [${group.names.join(", ")}], ` +
          `pero solo hay ${available} disponible(s). Por favor revisá tu carrito.`
        );
      }
    }
  }

  // 5) Calcular subtotal con descuentos de producto y categoría
  let subtotal = 0;

  validatedItems.forEach((item) => {
    const base = item.price;

    // Buscar regla de descuento por categoría/subcategoría
    const itemCats = Array.isArray(item.category) ? item.category : [item.category];
    const itemSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
    const categoryRule = discountRules.find(
      (r) =>
        itemCats.includes(r.category) &&
        (r.subcategory === "none" || itemSubs.includes(r.subcategory)) &&
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
      (item) => {
        const iCats = Array.isArray(item.category) ? item.category : [item.category];
        const iSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
        return iCats.includes(rule.category) && iSubs.includes(rule.subcategory);
      }
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
        const iCats = Array.isArray(item.category) ? item.category : [item.category];
        const iSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
        const matchCategory = promo.category === "all" || iCats.includes(promo.category);
        const matchSub = promo.subcategory === "all" || iSubs.includes(promo.subcategory);
        return matchCategory && matchSub;
      });

      const promoSubtotal = applicableItems.reduce(
        (acc, item) => {
          const base = item.price;
          const iCats = Array.isArray(item.category) ? item.category : [item.category];
          const iSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
          const catRule = discountRules.find(
            (r) =>
              iCats.includes(r.category) &&
              (r.subcategory === "none" || iSubs.includes(r.subcategory)) &&
              r.type === "percentage"
          );
          let discPct = item.discount || 0;
          if (discPct === 0 && catRule) discPct = catRule.discount;
          const finalPrice = discPct > 0 ? base - (base * discPct) / 100 : base;
          return acc + finalPrice * item.quantity;
        },
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

  // 9) Detectar reglas de envío gratis
  const freeShippingRules = discountRules.filter((r) => r.type === "free_shipping");
  const hasFreeShipping = validatedItems.some((item) => {
    const iCats = Array.isArray(item.category) ? item.category : [item.category];
    const iSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
    return freeShippingRules.some(
      (r) =>
        iCats.includes(r.category) &&
        (r.subcategory === "none" || iSubs.includes(r.subcategory))
    );
  });

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
    hasFreeShipping,
    warnings,
  };
}
