import express from "express";
import {
  getFeed,
  getFeedAdmin,
  createFeedPost,
  updateFeedPost,
  deleteFeedPost,
  reorderFeed,
  toggleFeedPost,
  uploadFeedImage,
} from "../controllers/feedController.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Rutas públicas
router.get("/", getFeed);

// Rutas protegidas (solo admin)
router.get("/admin/all", verifyAdmin, getFeedAdmin);
router.post("/admin/upload", verifyAdmin, upload.single("image"), uploadFeedImage);
router.post("/admin", verifyAdmin, createFeedPost);
router.put("/admin/:id", verifyAdmin, updateFeedPost);
router.delete("/admin/:id", verifyAdmin, deleteFeedPost);
router.put("/admin/:id/toggle", verifyAdmin, toggleFeedPost);
router.put("/admin/reorder", verifyAdmin, reorderFeed);

export default router;
