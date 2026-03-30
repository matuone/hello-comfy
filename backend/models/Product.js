import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    category: { type: [String], required: true, default: [] },
    subcategory: { type: [String], required: true, default: [] },

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

    // ⭐ PESO Y DIMENSIONES (para envío Correo Argentino)
    weight: { type: Number, default: 0.3 }, // kg
    dimensions: {
      height: { type: Number, default: 5 }, // cm
      width: { type: Number, default: 5 },  // cm
      length: { type: Number, default: 5 },  // cm
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


// Normalizar cada categoría y subcategoría a capitalizado
productSchema.pre("save", async function () {
  if (Array.isArray(this.category)) {
    this.category = this.category.map(normalize);
  } else if (this.category) {
    this.category = [normalize(this.category)];
  }
  if (Array.isArray(this.subcategory)) {
    this.subcategory = this.subcategory.map(normalize);
  } else if (this.subcategory) {
    this.subcategory = [normalize(this.subcategory)];
  }
});

productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ name: "text" });

export default mongoose.model("Product", productSchema);
