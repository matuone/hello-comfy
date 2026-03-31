import Product from "../models/Product.js";
import Subcategory from "../models/Subcategory.js";
import {
  clearCategoryFiltersCache,
  getCachedCategoryFilters,
  setCachedCategoryFilters,
} from "../services/categoryFiltersCache.js";

// ============================
// Helper → Normalizar strings
// ============================
const normalize = (str) => {
  if (!str) return "";
  // Eliminar espacios extras alrededor de caracteres especiales
  const clean = str.trim().replace(/\s*\/\s*/g, " / ");
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

const ALLOWED_CATEGORIES = ["Indumentaria", "Cute items", "Merch"];

// ============================
// Helper → extraer talles desde StockColor
// ============================
const extraerSizes = (product) => {
  if (!product.stockColorId || !product.stockColorId.talles) return [];

  const tallesObj = product.stockColorId.talles;

  return Object.entries(tallesObj)
    .filter(([talle, cantidad]) => cantidad > 0)
    .map(([talle]) => talle);
};

// ============================
// GET → obtener todos los productos (con filtros, orden y paginación)
// ============================
export const getAllProducts = async (req, res) => {
  try {
    const { category, subcategory, sort, page, limit, search } = req.query;

    const filtros = {};

    if (category) {
      // Buscar productos que tengan al menos una categoría coincidente
      filtros.category = { $in: Array.isArray(category) ? category : [category] };
    }
    if (subcategory) {
      // Buscar productos que tengan al menos una subcategoría coincidente
      const normalizedSubcategory = normalize(subcategory);
      filtros.subcategory = { $in: [normalizedSubcategory] };
    }

    // Búsqueda por nombre o descripción
    if (search) {
      filtros.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { cardDescription: { $regex: search, $options: "i" } },
      ];
    }

    // ORDEN
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "sold_desc") sortOption = { sold: -1 };

    // Si NO hay paginación, devolver todo
    if (!page || !limit) {
      let products = await Product.find(filtros)
        .sort(sortOption)
        .populate("stockColorId")
        .lean({ flattenMaps: true });

      products = products.map((p) => {
        p.sizes = extraerSizes(p);
        return p;
      });

      return res.json(products);
    }

    // Paginación real
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    let [products, total] = await Promise.all([
      Product.find(filtros)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("stockColorId")
        .lean({ flattenMaps: true }),

      Product.countDocuments(filtros),
    ]);

    products = products.map((p) => {
      p.sizes = extraerSizes(p);
      return p;
    });

    const hasMore = pageNum * limitNum < total;

    res.json({ products, total, hasMore });
  } catch (err) {
    console.error("Error al obtener productos");
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// ============================
// GET → obtener un producto por ID
// ============================
export const getProductById = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id)
      .populate("stockColorId");

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    product = product.toObject({ flattenMaps: true });
    product.sizes = extraerSizes(product);

    res.json(product);
  } catch (err) {
    console.error("Error al obtener producto");
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

// ============================
// GET → productos más vendidos
// ============================
export const getBestSellers = async (req, res) => {
  try {
    let productos = await Product.find()
      .sort({ sold: -1 })
      .limit(12)
      .populate("stockColorId");

    productos = productos.map((p) => {
      p = p.toObject({ flattenMaps: true });
      p.sizes = extraerSizes(p);
      return p;
    });

    res.json(productos);
  } catch (err) {
    console.error("Error al obtener best sellers");
    res.status(500).json({ error: "Error al obtener best sellers" });
  }
};

// ============================
// GET → últimos productos agregados
// ============================
export const getNewProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;
    let productos = await Product.find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .populate("stockColorId");

    productos = productos.map((p) => {
      p = p.toObject({ flattenMaps: true });
      p.sizes = extraerSizes(p);
      return p;
    });

    res.json(productos);
  } catch (err) {
    console.error("Error al obtener nuevos productos");
    res.status(500).json({ error: "Error al obtener nuevos productos" });
  }
};

// ============================
// GET -> productos Comfy Geek para Home
// ============================
export const getGeekProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const geekRegex = /comfy\s*geek!?/i;

    let productos = await Product.find({
      $or: [
        { category: { $elemMatch: { $regex: geekRegex } } },
        { subcategory: { $elemMatch: { $regex: geekRegex } } },
      ],
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .populate("stockColorId");

    productos = productos.map((p) => {
      p = p.toObject({ flattenMaps: true });
      p.sizes = extraerSizes(p);
      return p;
    });

    res.json(productos);
  } catch (err) {
    console.error("Error al obtener productos Comfy Geek");
    res.status(500).json({ error: "Error al obtener productos Comfy Geek" });
  }
};

// ============================
// GET → obtener productos por subcategoría
// ============================
export const getProductsBySubcategory = async (req, res) => {
  try {
    const rawName = req.params.name;
    // Normalizar el parámetro igual que cuando se guarda
    const name = rawName.trim().replace(/\s*\/\s*/g, " / ");

    let productos = await Product.find({
      subcategory: { $in: [name] }
    }).populate("stockColorId");

    productos = productos.map((p) => {
      p = p.toObject({ flattenMaps: true });
      p.sizes = extraerSizes(p);
      return p;
    });

    res.json(productos);
  } catch (err) {
    console.error("Error al obtener productos por subcategoría");
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// ============================
// POST → crear un producto
// ============================
export const createProduct = async (req, res) => {
  try {
    // Permitir arrays o strings para category/subcategory
    const categories = Array.isArray(req.body.category) ? req.body.category : [req.body.category];
    const subcategories = Array.isArray(req.body.subcategory) ? req.body.subcategory : [req.body.subcategory];

    const product = new Product({
      name: req.body.name,
      category: categories,
      subcategory: subcategories,
      price: req.body.price,
      discount: req.body.discount || 0,
      stockColorId: req.body.stockColorId,
      images: req.body.images || [],
      description: req.body.description || "",
      cardDescription: req.body.cardDescription || "",
      sizeGuide: req.body.sizeGuide || "none",
      weight: req.body.weight || 0,
      dimensions: {
        height: req.body.dimensions?.height || 0,
        width: req.body.dimensions?.width || 0,
        length: req.body.dimensions?.length || 0,
      },
    });

    await product.save();
    clearCategoryFiltersCache();
    res.json(product);
  } catch (err) {
    console.error("Error al crear producto");
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// ============================
// PUT → actualizar un producto
// ============================
export const updateProduct = async (req, res) => {
  try {
    const categories = Array.isArray(req.body.category) ? req.body.category : [req.body.category];
    const subcategories = Array.isArray(req.body.subcategory) ? req.body.subcategory : [req.body.subcategory];

    let updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: categories,
        subcategory: subcategories,
        price: req.body.price,
        discount: req.body.discount || 0,
        stockColorId: req.body.stockColorId,
        images: req.body.images || [],
        description: req.body.description || "",
        cardDescription: req.body.cardDescription || "",
        sizeGuide: req.body.sizeGuide || "none",
        weight: req.body.weight || 0,
        dimensions: {
          height: req.body.dimensions?.height || 0,
          width: req.body.dimensions?.width || 0,
          length: req.body.dimensions?.length || 0,
        },
      },
      { new: true }
    ).populate("stockColorId");

    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    updated = updated.toObject();
    updated.sizes = extraerSizes(updated);

    clearCategoryFiltersCache();
    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar producto");
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// ============================
// DELETE → eliminar un producto
// ============================
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    clearCategoryFiltersCache();
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error("Error al eliminar producto");
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

// ============================
// GET → obtener categorías + subcategorías agrupadas
// ============================
export const getCategoriesAndSubcategories = async (req, res) => {
  try {
    const cachedResponse = getCachedCategoryFilters();
    if (cachedResponse) {
      res.set("Cache-Control", "public, max-age=300");
      return res.json(cachedResponse);
    }

    const [productos, subcategories] = await Promise.all([
      Product.find({}, { category: 1, subcategory: 1, _id: 0 }).lean(),
      Subcategory.find({}, { category: 1, name: 1, order: 1, hidden: 1, _id: 0 })
        .sort({ category: 1, order: 1, name: 1 })
        .lean(),
    ]);

    const categoriasSet = new Set(ALLOWED_CATEGORIES);
    const hiddenSet = new Set();
    const grouped = {};
    const subToCategoryMap = {};

    subcategories.forEach((sub) => {
      const categoryName = normalize(sub.category);
      const subcategoryName = normalize(sub.name);

      categoriasSet.add(categoryName);

      if (sub.hidden) {
        hiddenSet.add(`${categoryName}||${subcategoryName}`);
        return;
      }

      subToCategoryMap[subcategoryName] = categoryName;

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }

      if (!grouped[categoryName].includes(subcategoryName)) {
        grouped[categoryName].push(subcategoryName);
      }
    });

    const productSubsMap = {};
    productos.forEach((product) => {
      const categories = Array.isArray(product.category)
        ? product.category
        : (product.category ? [product.category] : []);
      const subcategoriesFromProduct = Array.isArray(product.subcategory)
        ? product.subcategory
        : (product.subcategory ? [product.subcategory] : []);

      categories.forEach((category) => {
        if (category) {
          categoriasSet.add(normalize(category));
        }
      });

      subcategoriesFromProduct.forEach((sub) => {
        if (!sub) {
          return;
        }

        const normalizedSub = normalize(sub);
        const realCategory = subToCategoryMap[normalizedSub];

        if (realCategory) {
          if (!productSubsMap[realCategory]) {
            productSubsMap[realCategory] = new Set();
          }

          productSubsMap[realCategory].add(normalizedSub);
          return;
        }

        categories.forEach((category) => {
          if (!category) {
            return;
          }

          const normalizedCategory = normalize(category);
          if (!productSubsMap[normalizedCategory]) {
            productSubsMap[normalizedCategory] = new Set();
          }

          productSubsMap[normalizedCategory].add(normalizedSub);
        });
      });
    });

    const categorias = Array.from(categoriasSet);
    categorias.forEach((category) => {
      if (!grouped[category]) {
        grouped[category] = [];
      }

      const fromProducts = productSubsMap[category] || new Set();
      fromProducts.forEach((sub) => {
        if (!grouped[category].includes(sub) && !hiddenSet.has(`${category}||${sub}`)) {
          grouped[category].push(sub);
        }
      });
    });

    const response = setCachedCategoryFilters({
      categories: categorias,
      groupedSubcategories: grouped,
    });

    res.set("Cache-Control", "public, max-age=300");
    res.json(response);
  } catch (err) {
    console.error("Error al obtener categorías");
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};
