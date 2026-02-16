/**
 * instagramRoutes.js
 * Rutas para integración de Instagram
 */

import express from "express";
import Feed from "../models/Feed.js";
import { fetchInstagramPosts } from "../services/instagramService.js";
import { verifyAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * POST /api/instagram/sync
 * Sincroniza posts de Instagram con la BD
 * Solo admin
 */
router.post("/sync", verifyAdmin, async (req, res) => {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!accessToken || !businessAccountId) {
      return res.status(400).json({
        error: "Instagram credentials not configured",
        message:
          "INSTAGRAM_ACCESS_TOKEN y INSTAGRAM_BUSINESS_ACCOUNT_ID son requeridos",
      });
    }

    // Obtener posts de Instagram
    const instagramPosts = await fetchInstagramPosts(
      accessToken,
      businessAccountId
    );

    if (instagramPosts.length === 0) {
      return res.json({
        success: true,
        synced: 0,
        message: "No hay posts nuevos en Instagram",
      });
    }

    // Para cada post de Instagram, verificar si ya existe en BD
    let synced = 0;
    for (const igPost of instagramPosts) {
      // Buscar si ya existe este post usando externalId
      const existingPost = await Feed.findOne({
        externalId: igPost.externalId,
      });

      if (!existingPost) {
        // Obtener el siguiente número de orden
        const lastPost = await Feed.findOne().sort({ order: -1 });
        const nextOrder = (lastPost?.order || 0) + 1;

        // Crear nuevo post
        const newPost = new Feed({
          ...igPost,
          order: nextOrder,
          externalId: igPost.externalId,
        });

        await newPost.save();
        synced++;
      }
    }

    res.json({
      success: true,
      synced,
      total: instagramPosts.length,
      message: `${synced} posts sincronizados desde Instagram`,
    });
  } catch (error) {
    console.error("Error syncing Instagram posts:", error);
    res.status(500).json({
      error: "Error al sincronizar posts de Instagram",
      message: error.message,
    });
  }
});

/**
 * GET /api/instagram/feed
 * Obtiene feed de Instagram en tiempo real (sin sincronización)
 * Público
 */
router.get("/feed", async (req, res) => {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!accessToken || !businessAccountId) {
      return res.status(400).json({
        error: "Instagram credentials not configured",
      });
    }

    const instagramPosts = await fetchInstagramPosts(
      accessToken,
      businessAccountId
    );

    // Limitar a los últimos 12 posts
    const limitedPosts = instagramPosts.slice(0, 12);

    res.json(limitedPosts);
  } catch (error) {
    console.error("Error fetching Instagram feed:", error);
    res.status(500).json({
      error: "Error al obtener feed de Instagram",
      message: error.message,
    });
  }
});

/**
 * GET /api/instagram/status
 * Obtiene estado de la configuración de Instagram
 * Admin only
 */
router.get("/status", verifyAdmin, async (req, res) => {
  try {
    const hasAccessToken = !!process.env.INSTAGRAM_ACCESS_TOKEN;
    const hasAccountId = !!process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    res.json({
      configured: hasAccessToken && hasAccountId,
      accessTokenSet: hasAccessToken,
      accountIdSet: hasAccountId,
      credentialsNeeded: [
        !hasAccessToken && "INSTAGRAM_ACCESS_TOKEN",
        !hasAccountId && "INSTAGRAM_BUSINESS_ACCOUNT_ID",
      ].filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({ error: "Error checking Instagram status" });
  }
});

export default router;
