import mongoose from "mongoose";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/hellocomfy/image/upload/v173/avatar-default.png";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    number: { type: String, required: true },
    floor: { type: String, default: "" }, // opcional
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // Datos principales
    name: {
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

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: DEFAULT_AVATAR, // avatar genérico comfy
    },

    // Datos personales
    dni: {
      type: String,
      required: false,
      trim: true,
    },

    whatsapp: {
      type: String,
      required: false,
      trim: true,
    },

    // Dirección completa
    address: {
      type: addressSchema,
      required: false,
    },

    // Flags
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Datos internos
    method: {
      type: String,
      default: "email", // email | google | etc.
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // Recuperación de contraseña
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
