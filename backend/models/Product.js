import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  subcategory: String,
  price: Number,
  colors: [String],
  sizes: [String],
  stock: {
    type: Map,
    of: Number
  },
  images: [String],
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
