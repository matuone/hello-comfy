import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },

  colors: {
    type: [String],
    default: []
  },

  sizes: {
    type: [String],
    default: ["S", "M", "L", "XL", "2XL", "3XL"]
  },

  // 🟦 STOCK REAL DESDE S HASTA 3XL
  stock: {
    type: Map,
    of: Number,
    default: {
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      "2XL": 0,
      "3XL": 0
    }
  },

  images: {
    type: [String],
    default: []
  },

  description: {
    type: String,
    default: ""
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
