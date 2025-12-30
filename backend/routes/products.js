import express from "express";
import Product from "../models/Product.js";

// 👇 Importamos el upload y la función que sube a Cloudinary
import upload, { uploadToCloudinary } from "../middleware/upload.js";

const router = express.Router();

// ============================
// GET /api/products → obtener todos los productos
// ============================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// ============================
// GET /api/products/:id → obtener un producto por ID
// ============================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// ============================
// POST /api/products → crear un producto
// ============================
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// ============================
// PUT /api/products/:id → actualizar un producto
// ============================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// ============================
// DELETE /api/products/:id → eliminar un producto
// ============================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// ============================
// POST /api/products/upload → subir imagen a Cloudinary
// ============================
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const url = await uploadToCloudinary(req.file);
    res.json({ url });
  } catch (err) {
    console.error("Error al subir imagen:", err);
    res.status(500).json({ error: "Error al subir imagen" });
  }
});

export default router;
