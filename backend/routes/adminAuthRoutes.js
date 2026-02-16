import express from "express";
import { adminLogin, verifyAdminToken } from "../controllers/adminAuthController.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/verify", verifyAdmin, verifyAdminToken);

export default router;
