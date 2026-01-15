import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    category: { type: String, required: true },
    subcategory: { type: String, required: true },

    price: { type: Number, required: true },

    // ⭐ DESCUENTO
    discount: { type: Number, default: 0 },

    // ⭐ STOCK REAL POR COLOR (StockColor)
    stockColorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockColor",
      default: null,
      required: true,
    },

    images: {
      type: [String],
      default: []
    },

    // ⭐ DESCRIPCIÓN LARGA (para el detalle)
    description: {
      type: String,
      default: ""
    },

    // ⭐ DESCRIPCIÓN CORTA (para las cards)
    cardDescription: {
      type: String,
      default: "",
      trim: true
    },

    // ⭐ GUÍA DE TALLES
    sizeGuide: {
      type: String,
      default: "none"
    },

    // ⭐ NECESARIO PARA BEST SELLERS
    sold: { type: Number, default: 0 }
  },

  { timestamps: true }
);

/* ============================================================
   🧼 NORMALIZACIÓN AUTOMÁTICA DE CATEGORY Y SUBCATEGORY
   ============================================================ */

function normalize(str) {
  if (!str) return str;
  const clean = str.trim().toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

productSchema.pre("save", async function () {
  if (this.category) {
    this.category = normalize(this.category);
  }
  if (this.subcategory) {
    this.subcategory = normalize(this.subcategory);
  }
});

export default mongoose.model("Product", productSchema);
