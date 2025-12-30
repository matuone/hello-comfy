import express from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// ============================
// RUTAS CRUD DE PRODUCTOS
// ============================
router.get("/", getAllProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// ============================
// SUBIR IMAGEN A CLOUDINARY
// ============================
router.post("/upload", upload.single("image"), (req, res) => {
  res.json({ url: req.file.path });
});

export default router;
