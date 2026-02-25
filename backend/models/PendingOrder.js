// backend/models/PendingOrder.js
import mongoose from "mongoose";

/**
 * Modelo para almacenar datos temporales de órdenes pendientes de pago.
 * Reemplaza el uso de global.gocuotasOrders (memoria volátil)
 * para que los datos sobrevivan reinicios del servidor.
 * Se eliminan automáticamente después de 24 horas (TTL index).
 */
const pendingOrderSchema = new mongoose.Schema(
  {
    checkoutId: { type: String, required: true, unique: true, index: true },
    paymentMethod: { type: String, required: true }, // "gocuotas", etc.
    orderReference: { type: String },
    customerData: { type: mongoose.Schema.Types.Mixed },
    items: [mongoose.Schema.Types.Mixed],
    totalPrice: { type: Number },
    shippingCost: { type: Number, default: 0 },
    shippingMethod: { type: String },
    postalCode: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // TTL: 24 horas
  }
);

export default mongoose.model("PendingOrder", pendingOrderSchema);
