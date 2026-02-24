import express from "express";
import {
	listSubcategories,
	createSubcategory,
	updateSubcategory,
	deleteSubcategory,
	restoreSubcategory,
	permanentDeleteSubcategory,
	reorderSubcategories,
	syncSubcategories,
} from "../controllers/subcategoryController.js";

const router = express.Router();

router.get("/", listSubcategories);
router.post("/", createSubcategory);
router.post("/sync", syncSubcategories);
router.put("/reorder/all", reorderSubcategories);
router.put("/:id", updateSubcategory);
router.put("/:id/restore", restoreSubcategory);
router.delete("/:id", deleteSubcategory);
router.delete("/:id/permanent", permanentDeleteSubcategory);

export default router;
