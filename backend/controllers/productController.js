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
    if (subcategory) filtros.subcategory = subcategory;
    
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
        p = p.toObject();
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
      p = p.toObject();
      p.sizes = extraerSizes(p);
      return p;
    });

    const hasMore = pageNum * limitNum < total;

    res.json({ products, total, hasMore });
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
    let product = await Product.findById(req.params.id)
      .populate("stockColorId");

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    product = product.toObject();
    product.sizes = extraerSizes(product);

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
    let productos = await Product.find()
      .sort({ sold: -1 })
      .limit(8)
      .populate("stockColorId");

    productos = productos.map((p) => {
      p = p.toObject();
      p.sizes = extraerSizes(p);
      return p;
    });

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
    let productos = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("stockColorId");

    productos = productos.map((p) => {
      p = p.toObject();
      p.sizes = extraerSizes(p);
      return p;
    });

    res.json(productos);
  } catch (err) {
    console.error("Error al obtener nuevos productos:", err);
    res.status(500).json({ error: "Error al obtener nuevos productos" });
  }
};

// ============================
// GET → obtener productos por subcategoría
// ============================
export const getProductsBySubcategory = async (req, res) => {
  try {
    const name = req.params.name;

    let productos = await Product.find({
      subcategory: { $regex: new RegExp(`^${name}$`, "i") }
    }).populate("stockColorId");

    productos = productos.map((p) => {
      p = p.toObject();
      p.sizes = extraerSizes(p);
      return p;
    });

    res.json(productos);
  } catch (err) {
    console.error("Error al obtener productos por subcategoría:", err);
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
