import express from "express";
import {
	listSubcategories,
	createSubcategory,
	updateSubcategory,
	deleteSubcategory,
	reorderSubcategories,
} from "../controllers/subcategoryController.js";

const router = express.Router();

router.get("/", listSubcategories);
router.post("/", createSubcategory);
router.put("/:id", updateSubcategory);
router.delete("/:id", deleteSubcategory);
router.put("/reorder/all", reorderSubcategories);

export default router;
