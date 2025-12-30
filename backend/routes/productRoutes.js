import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellers,
  getNewProducts,
} from "../controllers/productController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// ============================
// RUTAS ESPECÍFICAS (IMPORTANTE: VAN PRIMERO)
// ============================
router.get("/bestsellers", getBestSellers);
router.get("/new", getNewProducts);

// ============================
// SUBIR IMAGEN (TAMBIÉN ES ESPECÍFICA → VA ARRIBA)
// ============================
router.post("/upload", upload.single("image"), (req, res) => {
  res.json({ url: req.file.path });
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
