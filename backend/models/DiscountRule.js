import mongoose from "mongoose";

const discountRuleSchema = new mongoose.Schema(
  {
    // Categoría a la que aplica el descuento
    category: { type: String, required: true },

    // Subcategoría (puede ser "none" si aplica a toda la categoría)
    subcategory: { type: String, default: "none" },

    // Tipo de descuento: porcentaje o promoción 3x2
    type: {
      type: String,
      enum: ["percentage", "3x2"],
      required: true
    },

    // Solo se usa si type === "percentage"
    discount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("DiscountRule", discountRuleSchema);
