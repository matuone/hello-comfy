import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },

    customer: {
      email: { type: String, required: true },
      name: { type: String },
    },

    status: {
      type: String,
      enum: [
        "recibido",
        "preparando",
        "en_camino",
        "listo_retirar",
        "entregado",
        "cancelado",
      ],
      default: "recibido",
    },

    timeline: [
      {
        status: { type: String },
        date: { type: String },
      },
    ],

    shipping: {
      method: { type: String, enum: ["home", "pickup"], required: true },
      address: { type: String },
      pickPoint: { type: String },
      eta: { type: String },
    },

    items: [
      {
        productId: { type: String },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],

    totals: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", OrderSchema);
