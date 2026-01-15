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

    // ⭐ Estado del pago
    pagoEstado: {
      type: String,
      enum: ["pendiente", "recibido"],
      default: "pendiente",
    },

    // ⭐ Medio de pago
    paymentMethod: {
      type: String,
      enum: ["mercadopago", "gocuotas", "modo"],
      default: "mercadopago",
    },

    // ⭐ Estado del envío
    envioEstado: {
      type: String,
      enum: ["pendiente", "enviado"],
      default: "pendiente",
    },

    // ⭐ Número de factura (para Facturante)
    facturaNumero: {
      type: String,
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

      // ⭐ Código de seguimiento
      tracking: { type: String },
    },

    items: [
      {
        productId: { type: String },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        size: { type: String },
        color: { type: String },
      },
    ],

    totals: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    // ⭐ Comentarios del cliente
    comentarios: {
      type: String,
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
