import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    nombre: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Admin", adminSchema);
