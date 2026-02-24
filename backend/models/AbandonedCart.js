import mongoose from "mongoose";

/**
 * AbandonedCart — Carritos abandonados
 * 
 * Dos tipos:
 * - "registered"  → usuario logueado que tiene items en el carrito y no compró
 * - "guest"       → usuario sin cuenta que llegó al checkout (paso 1+) y no finalizó
 */
const abandonedCartSchema = new mongoose.Schema(
  {
    // Tipo de carrito abandonado
    type: {
      type: String,
      enum: ["registered", "guest"],
      required: true,
    },

    // Datos del contacto
    email: { type: String, required: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },

    // Referencia al usuario (solo para registered)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Productos en el carrito
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        image: { type: String },
        price: { type: Number },
        size: { type: String },
        color: { type: String },
        quantity: { type: Number, default: 1 },
      },
    ],

    // Paso del checkout en que abandonó (1-4, o 0 si no llegó al checkout)
    checkoutStep: { type: Number, default: 0 },

    // Total estimado del carrito
    totalEstimado: { type: Number, default: 0 },

    // Si ya se recuperó (completó la compra después)
    recovered: { type: Boolean, default: false },

    // Historial de emails enviados
    emailsSent: [
      {
        sentAt: { type: Date, default: Date.now },
        subject: { type: String },
        message: { type: String },
      },
    ],

    // Última actividad detectada
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para buscar rápido por email y tipo
abandonedCartSchema.index({ email: 1, type: 1 });
abandonedCartSchema.index({ recovered: 1, createdAt: -1 });

export default mongoose.model("AbandonedCart", abandonedCartSchema);
