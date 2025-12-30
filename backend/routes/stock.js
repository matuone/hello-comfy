import mongoose from "mongoose";

const StockColorSchema = new mongoose.Schema({
  color: { type: String, required: true },
  colorHex: { type: String, required: true },
  talles: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
    XXL: { type: Number, default: 0 },
    "3XL": { type: Number, default: 0 }
  }
});

export default mongoose.model("StockColor", StockColorSchema);
