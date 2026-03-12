// backend/services/validateCartPrices.js
import Product from "../models/Product.js";
import StockColor from "../models/StockColor.js";
import DiscountRule from "../models/DiscountRule.js";
import PromoCode from "../models/PromoCode.js";
import SiteConfig from "../models/SiteConfig.js";

function getItemCategories(value) {
  return Array.isArray(value) ? value : [value];
}

function findCategoryPercentageRule(item, discountRules) {
  const itemCats = getItemCategories(item.category);
  const itemSubs = getItemCategories(item.subcategory);

  return discountRules.find(
    (rule) =>
      itemCats.includes(rule.category) &&
      (rule.subcategory === "none" || itemSubs.includes(rule.subcategory)) &&
      rule.type === "percentage"
  );
}

function getEffectiveDiscountPercent(item, discountRules) {
  const categoryRule = findCategoryPercentageRule(item, discountRules);
  const productDiscount = item.discount || 0;

  if (productDiscount > 0) {
    return productDiscount;
  }

  return categoryRule?.discount || 0;
}

function getDiscountedUnitPrice(item, discountRules) {
  const discountPercent = getEffectiveDiscountPercent(item, discountRules);
  const basePrice = item.price;

  if (discountPercent <= 0) {
    return Math.round(basePrice * 100) / 100;
  }

  return Math.round((basePrice - (basePrice * discountPercent) / 100) * 100) / 100;
}

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
  let validatedItems = [];

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
      const tallesRaw = dbProduct.stockColorId.talles;
      // Convertir a objeto plano, funciona con Mongoose Map y con objetos comunes
      let tallesObj;
      try {
        tallesObj = tallesRaw instanceof Map || typeof tallesRaw.entries === "function"
          ? Object.fromEntries(tallesRaw)
          : (tallesRaw.toObject ? tallesRaw.toObject() : Object.fromEntries(Object.entries(tallesRaw)));
      } catch {
        tallesObj = {};
      }
      const realStock = tallesObj[size] ?? 0;
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
      const tallesRawSC = sc.talles;
      let tallesObjSC;
      try {
        tallesObjSC = tallesRawSC instanceof Map || typeof tallesRawSC.entries === "function"
          ? Object.fromEntries(tallesRawSC)
          : (tallesRawSC?.toObject ? tallesRawSC.toObject() : Object.fromEntries(Object.entries(tallesRawSC ?? {})));
      } catch {
        tallesObjSC = {};
      }
      const available = tallesObjSC[group.size] ?? 0;
      if (group.totalQty > available) {
        throw new Error(
          `Stock insuficiente para el color "${sc.color}" talle ${group.size}: ` +
          `solicitaste ${group.totalQty} unidad(es) en total entre los productos [${group.names.join(", ")}], ` +
          `pero solo hay ${available} disponible(s). Por favor revisá tu carrito.`
        );
      }
    }
  }

  validatedItems = validatedItems.map((item) => ({
    ...item,
    appliedDiscount: getEffectiveDiscountPercent(item, discountRules),
    unitPrice: getDiscountedUnitPrice(item, discountRules),
  }));

  // 5) Calcular subtotal con descuentos de producto y categoría
  let subtotal = 0;

  validatedItems.forEach((item) => {
    subtotal += item.unitPrice * item.quantity;
  });

  // 6) Aplicar promociones 3x2 — pool unificado entre todas las reglas
  // (remeras + merch + etc. se cuentan juntos si cada una tiene su regla 3x2)
  let promo3x2Discount = 0;
  const rules3x2 = discountRules.filter((r) => r.type === "3x2");

  if (rules3x2.length > 0) {
    const matched3x2Keys = new Set();
    rules3x2.forEach((rule) => {
      validatedItems.forEach((item) => {
        const iCats = Array.isArray(item.category) ? item.category : [item.category];
        const iSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
        if (
          iCats.includes(rule.category) &&
          (rule.subcategory === "none" || iSubs.includes(rule.subcategory))
        ) {
          // Usar productId+size como key único
          matched3x2Keys.add(`${item.productId}-${item.size || "nosize"}`);
        }
      });
    });

    const pool = validatedItems.filter((item) =>
      matched3x2Keys.has(`${item.productId}-${item.size || "nosize"}`)
    );
    const totalQty = pool.reduce((acc, i) => acc + i.quantity, 0);

    if (totalQty >= 3) {
      const freeUnits = Math.floor(totalQty / 3);
      // Expandir por cantidad y ordenar: las unidades gratis son las más baratas
      const expanded = pool.flatMap((item) => Array(item.quantity).fill(item.price));
      expanded.sort((a, b) => a - b);
      promo3x2Discount = expanded.slice(0, freeUnits).reduce((s, p) => s + p, 0);
    }
  }

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
      // Verificar que no sea de un solo uso ya utilizado
      if (promo.singleUse && promo.usedAt) {
        warnings.push(`Código promocional "${promoCode}" ya fue utilizado`);
      } else {
        const applicableItems = validatedItems.filter((item) => {
          const iCats = Array.isArray(item.category) ? item.category : [item.category];
          const iSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
          const matchCategory = promo.category === "all" || iCats.includes(promo.category);
          const matchSub = promo.subcategory === "all" || iSubs.includes(promo.subcategory);
          return matchCategory && matchSub;
        });

        const promoSubtotal = applicableItems.reduce(
          (acc, item) => {
            return acc + item.unitPrice * item.quantity;
          },
          0
        );

        promoDiscount = (promoSubtotal * promo.discount) / 100;
        total -= promoDiscount;
      }
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

  // 9) Detectar envío gratis — dos fuentes:
  //    a) DiscountRule tipo free_shipping por categoría
  //    b) SiteConfig threshold: si el total supera el monto mínimo configurado en el panel

  // a) Reglas por categoría
  const freeShippingRules = discountRules.filter((r) => r.type === "free_shipping");
  const hasFreeShippingByRule = validatedItems.some((item) => {
    const iCats = Array.isArray(item.category) ? item.category : [item.category];
    const iSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
    return freeShippingRules.some(
      (r) =>
        iCats.includes(r.category) &&
        (r.subcategory === "none" || iSubs.includes(r.subcategory))
    );
  });

  // b) Threshold por monto mínimo (configurado en panel admin → Discounts)
  let hasFreeShippingByThreshold = false;
  try {
    const thresholdConfig = await SiteConfig.findOne({ key: "freeShippingThreshold" }).lean();
    const thresholdValue = thresholdConfig?.value;
    if (thresholdValue?.isActive && thresholdValue?.threshold > 0) {
      // Comparar contra el subtotal antes de promos (igual que lo hace el frontend)
      hasFreeShippingByThreshold = subtotal >= thresholdValue.threshold;
      if (hasFreeShippingByThreshold) {
        console.log(`✅ Envío gratis por monto mínimo: subtotal $${subtotal} >= threshold $${thresholdValue.threshold}`);
      }
    }
  } catch (e) {
    console.warn("⚠️ No se pudo leer freeShippingThreshold desde SiteConfig:", e.message);
  }

  const hasFreeShipping = hasFreeShippingByRule || hasFreeShippingByThreshold;

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
