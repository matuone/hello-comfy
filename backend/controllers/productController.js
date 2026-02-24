import Product from "../models/Product.js";
import Subcategory from "../models/Subcategory.js";

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

    if (category) filtros.category = category;
    if (subcategory) {
      const normalizedSubcategory = normalize(subcategory);
      filtros.subcategory = { $regex: `^${normalizedSubcategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" };
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
    let sortOption = {};
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "sold_desc") sortOption = { sold: -1 };

    // Si NO hay paginación, devolver todo
    if (!page || !limit) {
      let products = await Product.find(filtros)
        .sort(sortOption)
        .populate("stockColorId");

      products = products.map((p) => {
        p = p.toObject({ flattenMaps: true });
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
        .populate("stockColorId"),

      Product.countDocuments(filtros),
    ]);

    products = products.map((p) => {
      p = p.toObject({ flattenMaps: true });
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
// GET → obtener productos por subcategoría
// ============================
export const getProductsBySubcategory = async (req, res) => {
  try {
    const rawName = req.params.name;
    // Normalizar el parámetro igual que cuando se guarda
    const name = rawName.trim().replace(/\s*\/\s*/g, " / ");

    let productos = await Product.find({
      subcategory: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
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
    const normalizedCategory = normalize(req.body.category);
    const normalizedSubcategory = normalize(req.body.subcategory);

    const product = new Product({
      name: req.body.name,
      category: normalizedCategory,
      subcategory: normalizedSubcategory,
      price: req.body.price,
      discount: req.body.discount || 0,
      stockColorId: req.body.stockColorId,
      images: req.body.images || [],
      description: req.body.description || "",
      cardDescription: req.body.cardDescription || "",
      sizeGuide: req.body.sizeGuide || "none",
    });

    await product.save();
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
    const normalizedCategory = normalize(req.body.category);
    const normalizedSubcategory = normalize(req.body.subcategory);

    let updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: normalizedCategory,
        subcategory: normalizedSubcategory,
        price: req.body.price,
        discount: req.body.discount || 0,
        stockColorId: req.body.stockColorId,
        images: req.body.images || [],
        description: req.body.description || "",
        cardDescription: req.body.cardDescription || "",
        sizeGuide: req.body.sizeGuide || "none",
      },
      { new: true }
    ).populate("stockColorId");

    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    updated = updated.toObject();
    updated.sizes = extraerSizes(updated);

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
    const categoriasDeProductos = await Product.distinct("category");
    const categorias = Array.from(new Set([...ALLOWED_CATEGORIES, ...categoriasDeProductos]));

    const grouped = {};
    categorias.forEach((cat) => {
      grouped[cat] = [];
    });

    const [productos, subsManual, subsHidden] = await Promise.all([
      Product.find(),
      Subcategory.find({ hidden: { $ne: true } }).sort({ category: 1, order: 1, name: 1 }),
      Subcategory.find({ hidden: true }),
    ]);

    // Set de subcategorías ocultas para excluirlas
    const hiddenSet = new Set(
      subsHidden.map((s) => `${s.category}||${s.name}`)
    );

    // Recopilar subcategorías únicas de productos
    const productSubsMap = {}; // { category: Set<name> }
    productos.forEach((p) => {
      if (p.category && p.subcategory) {
        const sub = normalize(p.subcategory);
        if (!productSubsMap[p.category]) productSubsMap[p.category] = new Set();
        productSubsMap[p.category].add(sub);
      }
    });

    // Construir resultado: primero las manuales (respetando order), luego las de productos no registradas ni ocultas
    categorias.forEach((cat) => {
      const manualNames = subsManual
        .filter((s) => s.category === cat)
        .map((s) => s.name);

      // Empezar con las manuales en su orden
      grouped[cat] = [...manualNames];

      // Agregar las de productos que no estén ya en manuales ni ocultas
      const fromProducts = productSubsMap[cat] || new Set();
      fromProducts.forEach((sub) => {
        if (!grouped[cat].includes(sub) && !hiddenSet.has(`${cat}||${sub}`)) {
          grouped[cat].push(sub);
        }
      });
    });

    res.json({
      categories: categorias,
      groupedSubcategories: grouped,
    });
  } catch (err) {
    console.error("Error al obtener categorías");
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};
