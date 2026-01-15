import mongoose from "mongoose";

const sizeTableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  sizes: [{
    type: String,
    required: true,
  }],
  measurements: [{
    name: {
      type: String,
      required: true,
    },
    values: {
      type: Map,
      of: String,
      required: true,
    }
  }],
  note: {
    type: String,
    default: "",
  },
  active: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SizeTable", sizeTableSchema);
