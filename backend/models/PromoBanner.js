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
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('PromoBanner', promoBannerSchema);
