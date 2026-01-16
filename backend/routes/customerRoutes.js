import express from "express";
import {
  getAllCustomers,
  getAllBuyers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/all-buyers", getAllBuyers);
router.get("/", getAllCustomers);
router.get("/:email", getCustomerById);
router.post("/", createCustomer);
router.put("/:email", updateCustomer);
router.delete("/:email", deleteCustomer);

export default router;
