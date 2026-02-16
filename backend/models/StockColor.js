import mongoose from "mongoose";

const StockColorSchema = new mongoose.Schema({
  color: { type: String, required: true },
  colorHex: { type: String, required: true },
  talles: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  talleUnico: { type: Boolean, default: false },
  paused: { type: Boolean, default: false }
});

export default mongoose.model("StockColor", StockColorSchema);
