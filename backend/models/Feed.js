import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    // URL del post en Instagram (opcional)
    instagramUrl: {
      type: String,
      trim: true,
    },
    // Orden de visualización
    order: {
      type: Number,
      default: 0,
    },
    // Activa/Desactiva el post
    active: {
      type: Boolean,
      default: true,
    },
    // Estadísticas (opcional)
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    // ID externo de Instagram para sincronización
    externalId: {
      type: String,
      unique: true,
      sparse: true, // Permite null para posts creados manualmente
    },
    // Timestamp del post original en Instagram
    timestamp: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para ordenamiento
feedSchema.index({ order: 1, createdAt: -1 });

export default mongoose.model("Feed", feedSchema);
