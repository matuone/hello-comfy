import PromoBanner from '../models/PromoBanner.js';
import cloudinary from '../config/cloudinary.js';

// Obtener configuración del banner
export const getBanner = async (req, res) => {
  try {
    let banner = await PromoBanner.findOne({ active: true });

    if (!banner) {
      // Crear banner por defecto si no existe
      banner = new PromoBanner({
        images: [],
        message: 'Aprovechá hoy 3x2 en remeras 🧸',
        autoplay: true,
        interval: 5000,
        fontSize: 64,
        active: true
      });
      await banner.save();
    }

    res.json(banner);
  } catch (error) {
    console.error('Error al obtener banner');
    res.status(500).json({ message: 'Error al obtener banner', error: error.message });
  }
};

// Actualizar configuración del banner
export const updateBanner = async (req, res) => {
  try {
    const { message, autoplay, interval, fontSize, mobileFontSize, mobileColor, textAlign, textColor, fontWeight, fontStyle, textTransform, topPercent, maxWidth, bearMessage } = req.body;

    let banner = await PromoBanner.findOne({ active: true });

    if (!banner) {
      banner = new PromoBanner({
        message,
        autoplay,
        interval,
        fontSize,
        mobileFontSize,
        mobileColor,
        textAlign,
        textColor,
        fontWeight,
        fontStyle,
        textTransform,
        topPercent,
        maxWidth,
        active: true
      });
    } else {
      if (message !== undefined) banner.message = message;
      if (autoplay !== undefined) banner.autoplay = autoplay;
      if (interval !== undefined) banner.interval = interval;
      if (fontSize !== undefined) banner.fontSize = fontSize;
      if (mobileFontSize !== undefined) banner.mobileFontSize = mobileFontSize;
      if (mobileColor !== undefined) banner.mobileColor = mobileColor;
      if (textAlign !== undefined) banner.textAlign = textAlign;
      if (textColor !== undefined) banner.textColor = textColor;
      if (fontWeight !== undefined) banner.fontWeight = fontWeight;
      if (fontStyle !== undefined) banner.fontStyle = fontStyle;
      if (textTransform !== undefined) banner.textTransform = textTransform;
      if (topPercent !== undefined) banner.topPercent = topPercent;
      if (maxWidth !== undefined) banner.maxWidth = maxWidth;
      if (bearMessage !== undefined) banner.bearMessage = bearMessage;
    }

    await banner.save();
    res.json({ message: 'Banner actualizado', banner });
  } catch (error) {
    console.error('Error al actualizar banner');
    res.status(500).json({ message: 'Error al actualizar banner', error: error.message });
  }
};

// Agregar imagen al banner
export const addImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
    }

    const { objectPosition } = req.body;

    let banner = await PromoBanner.findOne({ active: true });

    if (!banner) {
      banner = new PromoBanner({ active: true });
    }

    // Subir imagen a Cloudinary usando buffer (memoryStorage)
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'promo-banners',
      // Sin transformaciones - la imagen completa se sube para que object-position funcione
      quality: 'auto'
    });

    banner.images.push({
      url: result.secure_url,
      publicId: result.public_id,
      objectPosition: objectPosition || 'center center'
    });

    await banner.save();

    res.json({ message: 'Imagen agregada', banner });
  } catch (error) {
    console.error('Error al agregar imagen');
    res.status(500).json({ message: 'Error al agregar imagen', error: error.message });
  }
};

// Eliminar imagen del banner
export const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    let banner = await PromoBanner.findOne({ active: true });

    if (!banner) {
      return res.status(404).json({ message: 'Banner no encontrado' });
    }

    const image = banner.images.id(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    // Eliminar de Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (cloudError) {
      console.error('Error al eliminar de Cloudinary');
    }

    banner.images.pull(imageId);
    await banner.save();

    res.json({ message: 'Imagen eliminada', banner });
  } catch (error) {
    console.error('Error al eliminar imagen');
    res.status(500).json({ message: 'Error al eliminar imagen', error: error.message });
  }
};

// Actualizar posición de objeto de una imagen
export const updateImagePosition = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { objectPosition } = req.body;

    let banner = await PromoBanner.findOne({ active: true });

    if (!banner) {
      return res.status(404).json({ message: 'Banner no encontrado' });
    }

    const image = banner.images.id(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    image.objectPosition = objectPosition;
    await banner.save();

    res.json({ message: 'Posición actualizada', banner });
  } catch (error) {
    console.error('Error al actualizar posición');
    res.status(500).json({ message: 'Error al actualizar posición', error: error.message });
  }
};

// Reordenar imágenes
export const reorderImages = async (req, res) => {
  try {
    const { imageIds } = req.body;

    let banner = await PromoBanner.findOne({ active: true });

    if (!banner) {
      return res.status(404).json({ message: 'Banner no encontrado' });
    }

    // Reordenar las imágenes según el array de IDs
    const reorderedImages = imageIds.map(id =>
      banner.images.find(img => img._id.toString() === id)
    ).filter(Boolean);

    banner.images = reorderedImages;
    await banner.save();

    res.json({ message: 'Imágenes reordenadas', banner });
  } catch (error) {
    console.error('Error al reordenar imágenes');
    res.status(500).json({ message: 'Error al reordenar imágenes', error: error.message });
  }
};

export default {
  getBanner,
  updateBanner,
  addImage,
  deleteImage,
  updateImagePosition,
  reorderImages
};
