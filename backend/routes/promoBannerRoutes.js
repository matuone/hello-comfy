import express from 'express';
import promoBannerController from '../controllers/promoBannerController.js';
import { verifyAdmin } from '../middleware/adminMiddleware.js';
import upload, { uploadBannerMiddleware } from '../middleware/upload.js';

const router = express.Router();

// Rutas públicas
router.get('/', promoBannerController.getBanner);

// Rutas protegidas (solo admin)
router.put('/', verifyAdmin, promoBannerController.updateBanner);
router.post('/images', verifyAdmin, uploadBannerMiddleware.single('image'), promoBannerController.addImage);
router.delete('/images/:imageId', verifyAdmin, promoBannerController.deleteImage);
router.put('/images/:imageId/position', verifyAdmin, promoBannerController.updateImagePosition);
router.put('/images/reorder', verifyAdmin, promoBannerController.reorderImages);

export default router;
