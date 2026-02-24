// ...existing code...
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

    birthdate: {
      type: Date,
      required: false,
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

    // Verificación de email
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // Wishlist (favoritos)
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
