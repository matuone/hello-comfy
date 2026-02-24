import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  // ...otros campos previos...
  // ⭐ Opción de regalo
  isGift: {
    type: Boolean,
    default: false,
  },
  giftMessage: {
    type: String,
    default: "",
  },
  // ⭐ Comentarios del cliente (editable por admin)
  comentarios: {
    type: String,
    default: "",
  },
  // ...resto de los campos...

  // ⭐ Usuario vinculado (si la compra fue con cuenta o se creó cuenta después)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
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
    enum: ["mercadopago", "gocuotas", "modo", "transfer", "cuentadni"],
    default: "mercadopago",
  },

  // ⭐ Estado del envío
  envioEstado: {
    type: String,
    enum: ["pendiente", "enviado"],
    default: "pendiente",
  },

  // ⭐ Número de factura (formato: B-0001-00000123)
  facturaNumero: {
    type: String,
  },

  // ⭐ CAE de AFIP
  facturaCae: {
    type: String,
  },

  // ⭐ Vencimiento del CAE
  facturaVencimientoCAE: {
    type: String,
  },

  // ⭐ Fecha de emisión de factura
  facturaFecha: {
    type: String,
  },

  timeline: [
    {
      status: { type: String },
      date: { type: String },
    },
  ],

  shipping: {
    method: { type: String, enum: ["home", "pickup", "correo-home", "correo-branch"], required: true },
    address: { type: String },
    pickPoint: { type: String },
    eta: { type: String },

    // ⭐ Código de seguimiento
    tracking: { type: String },
  },

  // ⭐ Opción de regalo
  isGift: {
    type: Boolean,
    default: false,
  },

  giftMessage: {
    type: String,
    default: "",
  },

  // ⭐ Tracking de Correo Argentino
  correoArgentinoTracking: {
    type: String,
  },

  correoArgentinoRegisteredAt: {
    type: String,
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

  // ⭐ Comprobante de pago (para transferencias)
  paymentProof: {
    type: String, // Base64 del archivo
  },

  paymentProofName: {
    type: String, // Nombre del archivo
  },

  date: {
    type: String,
    required: true,
  },

  // ⭐ Notificación de retiro enviada
  pickupNotificado: {
    type: Boolean,
    default: false,
  },
},
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", OrderSchema);
