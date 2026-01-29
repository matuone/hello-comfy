import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    direccion: {
      type: String,
      trim: true,
    },
    ciudad: {
      type: String,
      trim: true,
    },
    codigoPostal: {
      type: String,
      trim: true,
    },
    notas: {
      type: String,
      trim: true,
    },
    birthdate: {
      type: Date,
      required: false,
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo"],
      default: "activo",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "customers" }
);

export default mongoose.model("Customer", customerSchema);
