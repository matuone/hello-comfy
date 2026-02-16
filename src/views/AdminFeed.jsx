import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/adminfeed.css";

export default function AdminFeed() {
  const { adminFetch } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    caption: "",
    imageUrl: "",
    instagramUrl: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    cargarFeed();
  }, []);

  const cargarFeed = async () => {
    try {
      setLoading(true);
      const response = await adminFetch("/api/feed/admin", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setFeed(data);
        setError(null);
      } else {
        setError("Error cargando feed");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({
          ...prev,
          imageUrl: result.secure_url,
        }));
      } else {
        setError("Error subiendo imagen a Cloudinary");
      }
    } catch (err) {
      setError("Error en carga de imagen");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      setError("Debes subir una imagen");
      return;
    }

    try {
      const url = editingId
        ? `/api/feed/admin/${editingId}`
        : "/api/feed/admin";
      const method = editingId ? "PUT" : "POST";

      const response = await adminFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await cargarFeed();
        resetForm();
        setError(null);
      } else {
        setError("Error guardando post");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    }
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      description: post.description || "",
      caption: post.caption || "",
      imageUrl: post.imageUrl,
      instagramUrl: post.instagramUrl || "",
    });
    setEditingId(post._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este post?")) return;

    try {
      const response = await adminFetch(`/api/feed/admin/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await cargarFeed();
      } else {
        setError("Error eliminando post");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await adminFetch(`/api/feed/admin/${id}/toggle`, {
        method: "PUT",
      });

      if (response.ok) {
        await cargarFeed();
      } else {
        setError("Error actualizando estado");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    }
  };

  const handleReorder = async (id, direction) => {
    try {
      const response = await adminFetch("/api/feed/admin/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: id, direction }),
      });

      if (response.ok) {
        await cargarFeed();
      } else {
        setError("Error reordenando posts");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      caption: "",
      imageUrl: "",
      instagramUrl: "",
    });
    setEditingId(null);
  };

  if (loading) return <LoadingSpinner message="Cargando feed..." />;

  return (
    <div className="admin-feed-container">
      <h1>Gestionar Feed</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Formulario de crear/editar */}
      <div className="feed-form-section">
        <h2>{editingId ? "Editar Post" : "Crear Nuevo Post"}</h2>

        <form onSubmit={handleSubmit} className="feed-form">
          {/* Upload de imagen */}
          <div className="form-group">
            <label htmlFor="image-upload">Imagen del Post</label>
            <div className="image-upload-area">
              {formData.imageUrl && (
                <div className="uploaded-image-preview">
                  <img src={formData.imageUrl} alt="Preview" />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: "",
                      }))
                    }
                    className="btn-remove-image"
                  >
                    Remover imagen
                  </button>
                </div>
              )}
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage || !!formData.imageUrl}
              />
              {uploadingImage && <p className="uploading">Subiendo...</p>}
            </div>
          </div>

          {/* Título */}
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Capsula Nueva Invierno"
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="description">Descripción (opcional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe el producto o contenido..."
              rows="3"
            />
          </div>

          {/* Caption */}
          <div className="form-group">
            <label htmlFor="caption">Caption (mostrado en hover)</label>
            <textarea
              id="caption"
              name="caption"
              value={formData.caption}
              onChange={handleInputChange}
              placeholder="Texto visible al pasar el mouse..."
              rows="2"
            />
          </div>

          {/* URL Instagram */}
          <div className="form-group">
            <label htmlFor="instagramUrl">URL Instagram (opcional)</label>
            <input
              type="url"
              id="instagramUrl"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleInputChange}
              placeholder="https://instagram.com/tu-post"
            />
          </div>

          {/* Botones */}
          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Guardar cambios" : "Crear post"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Galería de posts */}
      <div className="feed-gallery-section">
        <h2>Posts del Feed ({feed.length})</h2>

        {feed.length === 0 ? (
          <p className="no-posts">No hay posts en el feed aún.</p>
        ) : (
          <div className="feed-gallery">
            {feed.map((post, index) => (
              <div
                key={post._id}
                className={`feed-post-card ${post.active ? "active" : "inactive"}`}
              >
                {/* Orden */}
                <div className="post-order">#{post.order}</div>

                {/* Estado activo/inactivo */}
                <div className={`post-status ${post.active ? "activo" : "inactivo"}`}>
                  {post.active ? "Activo" : "Inactivo"}
                </div>

                {/* Imagen */}
                <div className="post-image-wrapper">
                  <img src={post.imageUrl} alt={post.title} />
                </div>

                {/* Información */}
                <div className="post-info">
                  <h3>{post.title}</h3>
                  {post.caption && <p className="post-caption">{post.caption}</p>}
                </div>

                {/* Acciones */}
                <div className="post-actions">
                  <button
                    onClick={() => handleToggleActive(post._id, post.active)}
                    className={`btn-toggle ${post.active ? "btn-deactivate" : "btn-activate"}`}
                  >
                    {post.active ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    onClick={() => handleEdit(post)}
                    className="btn-edit"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(post._id)}
                    className="btn-delete"
                  >
                    Eliminar
                  </button>

                  {/* Botones de reorden */}
                  <div className="reorder-buttons">
                    {index > 0 && (
                      <button
                        onClick={() => handleReorder(post._id, "up")}
                        className="btn-reorder"
                        title="Mover arriba"
                      >
                        ↑
                      </button>
                    )}
                    {index < feed.length - 1 && (
                      <button
                        onClick={() => handleReorder(post._id, "down")}
                        className="btn-reorder"
                        title="Mover abajo"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
