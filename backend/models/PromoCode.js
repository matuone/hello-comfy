import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    // Código que ingresa el usuario (ej: VERANO2026)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    // Porcentaje de descuento (ej: 10)
    discount: {
      type: Number,
      required: true
    },

    // Fecha desde cuándo es válido
    validFrom: {
      type: Date,
      required: true
    },

    // Fecha hasta cuándo es válido
    validUntil: {
      type: Date,
      required: true
    },

    // Opcional: aplicar solo a una categoría
    category: {
      type: String,
      default: "all"
    },

    // Opcional: aplicar solo a una subcategoría
    subcategory: {
      type: String,
      default: "all"
    },

    // Estado del código
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("PromoCode", promoCodeSchema);
