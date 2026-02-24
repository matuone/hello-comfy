import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SubcategorySchema.index({ category: 1, name: 1 }, { unique: true });

const Subcategory = mongoose.model("Subcategory", SubcategorySchema);

export default Subcategory;
