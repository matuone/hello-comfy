import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellers,
  getNewProducts,
  getCategoriesAndSubcategories,
  getProductsBySubcategory, // ⭐ NUEVO CONTROLADOR
} from "../controllers/productController.js";

import upload, { uploadToCloudinary } from "../middleware/upload.js";

const router = express.Router();

// ============================
// RUTAS ESPECÍFICAS
// ============================
router.get("/bestsellers", getBestSellers);
router.get("/new", getNewProducts);

// ============================
// RUTA PARA FILTROS (categorías y subcategorías)
// ============================
router.get("/filters/data", getCategoriesAndSubcategories);

// ============================
// ⭐ RUTA: productos por subcategoría
// ⚠️ IMPORTANTE: debe ir ANTES de /:id
// ============================
router.get("/subcategory/:name", getProductsBySubcategory);

// ============================
// SUBIR MÚLTIPLES IMÁGENES A CLOUDINARY
// ============================
router.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    const urls = [];

    for (const file of req.files) {
      const url = await uploadToCloudinary(file);
      urls.push(url);
    }

    res.json({ urls });
  } catch (err) {
    console.error("Error al subir imágenes:", err);
    res.status(500).json({ error: "Error al subir imágenes" });
  }
});

// ============================
// CRUD GENERAL
// ============================
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
