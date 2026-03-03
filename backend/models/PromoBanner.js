import mongoose from 'mongoose';

const promoBannerSchema = new mongoose.Schema({
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    objectPosition: {
      type: String,
      default: 'center'
    }
  }],
  message: {
    type: String,
    default: 'Aprovechá hoy 3x2 en remeras 🧸'
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000
  },
  fontSize: {
    type: Number,
    default: 64
  },
  mobileFontSize: {
    type: Number,
    default: 28
  },
  mobileColor: {
    type: String,
    default: '#d72660'
  },
  // Estilos de texto del banner (desktop)
  textAlign: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'left'
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  fontWeight: {
    type: Number,
    default: 900
  },
  fontStyle: {
    type: String,
    enum: ['normal', 'italic'],
    default: 'normal'
  },
  textTransform: {
    type: String,
    enum: ['none', 'uppercase', 'lowercase', 'capitalize'],
    default: 'none'
  },
  // Posición libre del bloque de texto en el banner
  topPercent: {
    type: Number,
    default: 25
  },
  maxWidth: {
    type: Number,
    default: 100
  },
  active: {
    type: Boolean,
    default: true
  },
  bearMessage: {
    type: String,
    default: 'HELLOCOMFY10'
  }
}, {
  timestamps: true
});

export default mongoose.model('PromoBanner', promoBannerSchema);
