/**
 * instagramService.js
 * Servicio para integración con Instagram Graph API
 * Obtiene posts automáticamente de la cuenta de Instagram configurada
 */

const INSTAGRAM_GRAPH_API = "https://graph.instagram.com";

/**
 * Obtiene posts de Instagram desde la API oficial
 * @param {String} accessToken - Token de acceso de Instagram Graph API
 * @param {String} businessAccountId - ID de la cuenta de negocio en Instagram
 * @returns {Array} Array de posts con formato normalizado
 */
export async function fetchInstagramPosts(accessToken, businessAccountId) {
  try {
    // Obtener media de la cuenta de negocio
    const response = await fetch(
      `${INSTAGRAM_GRAPH_API}/${businessAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data) {
      return [];
    }

    // Normalizar posts para que sean compatibles con nuestro sistema
    const normalizedPosts = data.data
      .filter((post) => {
        // Solo videos e imágenes, no carousel por ahora
        return post.media_type === "IMAGE" || post.media_type === "VIDEO";
      })
      .map((post) => ({
        id: post.id,
        title: post.caption ? post.caption.substring(0, 100) : "Sin título",
        caption: post.caption || "",
        description: post.caption || "",
        imageUrl: post.media_url || post.thumbnail_url,
        instagramUrl: post.permalink,
        order: 0, // Se asignará dinámicamente
        active: true,
        timestamp: post.timestamp,
        externalId: post.id, // Para rastrear si ya existe en BD
      }))
      // Ordenar por más reciente primero
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return normalizedPosts;
  } catch (error) {
    console.error("Error fetching Instagram posts:", error.message);
    throw error;
  }
}

/**
 * Valida si un token de Instagram es válido
 * @param {String} accessToken - Token a validar
 * @returns {Boolean} True si es válido
 */
export async function validateInstagramToken(accessToken) {
  try {
    const response = await fetch(
      `${INSTAGRAM_GRAPH_API}/me?fields=id,username&access_token=${accessToken}`
    );
    return response.ok;
  } catch (error) {
    console.error("Error validating Instagram token:", error.message);
    return false;
  }
}

/**
 * Obtiene información de la cuenta de Instagram
 * @param {String} accessToken - Token de acceso
 * @param {String} businessAccountId - ID de la cuenta
 * @returns {Object} Información de la cuenta
 */
export async function getInstagramAccountInfo(accessToken, businessAccountId) {
  try {
    const response = await fetch(
      `${INSTAGRAM_GRAPH_API}/${businessAccountId}?fields=id,username,name,profile_picture_url,biography&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting Instagram account info:", error.message);
    throw error;
  }
}

export default {
  fetchInstagramPosts,
  validateInstagramToken,
  getInstagramAccountInfo,
};
