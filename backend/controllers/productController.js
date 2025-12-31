import Product from "../models/Product.js";

// ============================
// GET → obtener todos los productos
// ============================
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
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
    const product = new Product({
      ...req.body,
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
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
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
