import PromoBanner from '../models/PromoBanner.js';
import fs from 'fs';
import path from 'path';
import { getUploadUrl } from '../middleware/upload.js';

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

function isLocalBannerUrl(url) {
  return typeof url === 'string' && url.includes('/uploads/banners/');
}

function sanitizeBannerImages(images = []) {
  return images.filter((img) => {
    if (!img) return false;
    if (!img.publicId) return false;
    if (isCloudinaryUrl(img.url)) return false;
    return isLocalBannerUrl(img.url);
  });
}

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

    const sanitizedImages = sanitizeBannerImages(banner.images || []);
    if (sanitizedImages.length !== (banner.images || []).length) {
      banner.images = sanitizedImages;
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

    // Limpia entradas heredadas que no apuntan a archivos locales.
    banner.images = sanitizeBannerImages(banner.images || []);

    // Guardar imagen (ya fue guardada en disco por multer)
    const imageUrl = getUploadUrl(req.file, 'banners');

    banner.images.push({
      url: imageUrl,
      publicId: req.file.filename, // usamos el nombre de archivo como identificador
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

    // Eliminar archivo local
    try {
      const UPLOADS_BASE = process.env.UPLOADS_DIR
        ? path.resolve(process.env.UPLOADS_DIR)
        : path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '../../uploads');
      const filePath = path.join(UPLOADS_BASE, 'banners', image.publicId);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (deleteError) {
      console.error('Error al eliminar archivo de imagen local:', deleteError.message);
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
