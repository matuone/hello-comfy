/**
 * instagramSyncService.js
 * Sincronización automática del feed de Instagram.
 * Se ejecuta al arrancar el servidor y cada 6 horas.
 */

import cron from "node-cron";
import Feed from "../models/Feed.js";
import { fetchInstagramPosts } from "./instagramService.js";

const SYNC_CRON = "0 */6 * * *"; // Cada 6 horas

async function syncInstagramFeed() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !businessAccountId) {
    console.log(
      "[Instagram Sync] Variables de entorno no configuradas, saltando sync."
    );
    return;
  }

  try {
    console.log("[Instagram Sync] Iniciando sincronización automática...");
    const instagramPosts = await fetchInstagramPosts(
      accessToken,
      businessAccountId
    );

    if (!instagramPosts.length) {
      console.log("[Instagram Sync] No hay posts para sincronizar.");
      return;
    }

    let synced = 0;
    for (let i = 0; i < instagramPosts.length; i++) {
      const igPost = instagramPosts[i];
      const existingPost = await Feed.findOne({ externalId: igPost.externalId });

      if (!existingPost) {
        await new Feed({
          ...igPost,
          order: i, // orden = posición en el feed de Instagram (0 = más reciente)
          externalId: igPost.externalId,
        }).save();

        synced++;
      } else {
        // Actualizar imageUrl por si la URL de CDN de Instagram cambió
        if (existingPost.imageUrl !== igPost.imageUrl) {
          existingPost.imageUrl = igPost.imageUrl;
          await existingPost.save();
        }
      }
    }

    console.log(
      `[Instagram Sync] Completado: ${synced} nuevos posts, ${instagramPosts.length} revisados.`
    );
  } catch (error) {
    console.error("[Instagram Sync] Error durante la sincronización:", error.message);
  }
}

// Ejecutar al arrancar el servidor (con pequeño delay para que Mongoose esté listo)
setTimeout(() => {
  syncInstagramFeed();
}, 5000);

// Cron: cada 6 horas
cron.schedule(SYNC_CRON, () => {
  syncInstagramFeed();
});

export { syncInstagramFeed };
