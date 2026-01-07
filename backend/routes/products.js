import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellers,
  getNewProducts,
  getProductsBySubcategory,
  getCategoriesAndSubcategories,
} from "../controllers/productController.js";

import upload, { uploadMultipleToCloudinary } from "../middleware/upload.js";

const router = express.Router();

// ============================
// RUTAS ESPECÍFICAS
// ============================
router.get("/bestsellers", getBestSellers);
router.get("/new", getNewProducts);
router.get("/subcategory/:name", getProductsBySubcategory);
router.get("/filters/data", getCategoriesAndSubcategories);

// ============================
// SUBIR IMÁGENES A CLOUDINARY
// ============================
router.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se enviaron imágenes" });
    }

    const urls = await uploadMultipleToCloudinary(req.files);
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
