import Product from "../models/Product.js";

// ============================
// Helper → Normalizar strings
// ============================
const normalize = (str) => {
  if (!str) return "";
  const clean = str.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

// ============================
// GET → obtener todos los productos (con filtros, orden y paginación)
// ============================
export const getAllProducts = async (req, res) => {
  try {
    const { category, subcategory, sort, page, limit } = req.query;

    const filtros = {};

    if (category) filtros.category = category;
    if (subcategory) filtros.subcategory = subcategory;

    // ORDEN
    let sortOption = {};
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "sold_desc") {
      sortOption = { sold: -1 };
    }

    // Si NO hay paginación, devolver todo (lo usa allProducts en el front)
    if (!page || !limit) {
      const products = await Product.find(filtros).sort(sortOption);
      return res.json(products);
    }

    // Paginación real
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filtros).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filtros),
    ]);

    const hasMore = pageNum * limitNum < total;

    res.json({
      products,
      total,
      hasMore,
    });
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// ============================
// GET → obtener un producto por ID
// ============================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

// ============================
// GET → productos más vendidos
// ============================
export const getBestSellers = async (req, res) => {
  try {
    const productos = await Product.find()
      .sort({ sold: -1 })
      .limit(8);

    res.json(productos);
  } catch (err) {
    console.error("Error al obtener best sellers:", err);
    res.status(500).json({ error: "Error al obtener best sellers" });
  }
};

// ============================
// GET → últimos productos agregados
// ============================
export const getNewProducts = async (req, res) => {
  try {
    const productos = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json(productos);
  } catch (err) {
    console.error("Error al obtener nuevos productos:", err);
    res.status(500).json({ error: "Error al obtener nuevos productos" });
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
      ...req.body,
      category: normalizedCategory,
      subcategory: normalizedSubcategory,
      images: req.body.images || [], // URLs de Cloudinary
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error al crear producto:", err);
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

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        category: normalizedCategory,
        subcategory: normalizedSubcategory,
        images: req.body.images || [], // URLs nuevas
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar producto:", err);
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
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

// ============================
// GET → obtener categorías + subcategorías agrupadas
// ============================
export const getCategoriesAndSubcategories = async (req, res) => {
  try {
    const categorias = await Product.distinct("category");

    const grouped = {};
    categorias.forEach((cat) => {
      grouped[cat] = [];
    });

    const productos = await Product.find();

    productos.forEach((p) => {
      if (p.category && p.subcategory) {
        const sub = normalize(p.subcategory);
        if (!grouped[p.category].includes(sub)) {
          grouped[p.category].push(sub);
        }
      }
    });

    res.json({
      categories: categorias,
      groupedSubcategories: grouped,
    });
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};
