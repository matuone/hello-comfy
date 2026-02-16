import Feed from "../models/Feed.js";

// ===============================
// OBTENER FEED (PÚBLICO)
// ===============================
export async function getFeed(req, res) {
  try {
    const feed = await Feed.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(12); // Mostrar últimos 12 posts

    res.json(feed);
  } catch (error) {
    console.error("Error al obtener feed:", error);
    res.status(500).json({ error: "Error al obtener feed" });
  }
}

// ===============================
// OBTENER FEED COMPLETO (ADMIN)
// ===============================
export async function getFeedAdmin(req, res) {
  try {
    const feed = await Feed.find().sort({ order: 1, createdAt: -1 });
    res.json(feed);
  } catch (error) {
    console.error("Error al obtener feed:", error);
    res.status(500).json({ error: "Error al obtener feed" });
  }
}

// ===============================
// CREAR NUEVO POST DE FEED (ADMIN)
// ===============================
export async function createFeedPost(req, res) {
  try {
    const { title, description, imageUrl, caption, instagramUrl, order } =
      req.body;

    if (!title || !imageUrl) {
      return res
        .status(400)
        .json({ error: "Título e imagen son requeridos" });
    }

    const newPost = new Feed({
      title,
      description,
      imageUrl,
      caption,
      instagramUrl,
      order: order || 0,
      active: true,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error al crear post:", error);
    res.status(500).json({ error: "Error al crear post" });
  }
}

// ===============================
// ACTUALIZAR POST DE FEED (ADMIN)
// ===============================
export async function updateFeedPost(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await Feed.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error al actualizar post:", error);
    res.status(500).json({ error: "Error al actualizar post" });
  }
}

// ===============================
// ELIMINAR POST DE FEED (ADMIN)
// ===============================
export async function deleteFeedPost(req, res) {
  try {
    const { id } = req.params;

    const post = await Feed.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json({ message: "Post eliminado correctamente", post });
  } catch (error) {
    console.error("Error al eliminar post:", error);
    res.status(500).json({ error: "Error al eliminar post" });
  }
}

// ===============================
// REORDENAR POSTS (ADMIN)
// ===============================
export async function reorderFeed(req, res) {
  try {
    const { order } = req.body; // Array de IDs en nuevo orden

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Order debe ser un array" });
    }

    // Actualizar el orden de cada post
    for (let i = 0; i < order.length; i++) {
      await Feed.findByIdAndUpdate(order[i], { order: i });
    }

    const feed = await Feed.find().sort({ order: 1 });
    res.json(feed);
  } catch (error) {
    console.error("Error al reordenar feed:", error);
    res.status(500).json({ error: "Error al reordenar feed" });
  }
}

// ===============================
// TOGGLE ACTIVAR/DESACTIVAR POST (ADMIN)
// ===============================
export async function toggleFeedPost(req, res) {
  try {
    const { id } = req.params;

    const post = await Feed.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    post.active = !post.active;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Error al toggle post:", error);
    res.status(500).json({ error: "Error al toggle post" });
  }
}
