import { useState, useEffect, useRef } from "react";
import "../styles/adminmarketing.css";
import NotificationModal from "../components/NotificationModal";
import ConfirmModal from "../components/ConfirmModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminMarketing() {
  const defaultMessage = "Aprovechá hoy 3x2 en remeras 🧸";
  const defaultBearMessage = "HELLOCOMFY10";

  const [message, setMessage] = useState("");
  const [bearMessage, setBearMessage] = useState("");
  
  // Estado para gestión de imágenes del banner
  const [bannerImages, setBannerImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [newImagePosition, setNewImagePosition] = useState("center");
  const [loading, setLoading] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [interval, setInterval] = useState(5000);
  
  // Estado para preview de imagen
  const [imagePreview, setImagePreview] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef(null);
  
  // Estado para modales
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Estado para drag & drop de imágenes
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Cargar mensajes guardados y configuración del banner
  useEffect(() => {
    const savedBanner = localStorage.getItem("promoMessage");
    const savedBear = localStorage.getItem("bearMessage");

    setMessage(savedBanner || defaultMessage);
    setBearMessage(savedBear || defaultBearMessage);

    // Cargar configuración del banner desde el backend
    loadBannerConfig();
  }, []);

  async function loadBannerConfig() {
    try {
      const response = await fetch(`${API_URL}/promo-banner`);
      const data = await response.json();
      
      if (data) {
        setBannerImages(data.images || []);
        if (data.message) setMessage(data.message);
        setAutoplay(data.autoplay !== undefined ? data.autoplay : true);
        setInterval(data.interval || 5000);
      }
    } catch (error) {
      console.error('Error cargando configuración del banner:', error);
    }
  }

  async function loadBannerConfig() {
    try {
      const response = await fetch(`${API_URL}/promo-banner`);
      const data = await response.json();
      
      if (data) {
        setBannerImages(data.images || []);
        if (data.message) setMessage(data.message);
        setAutoplay(data.autoplay !== undefined ? data.autoplay : true);
        setInterval(data.interval || 5000);
      }
    } catch (error) {
      console.error('Error cargando configuración del banner:', error);
    }
  }

  async function guardar() {
    setLoading(true);
    try {
      // Actualizar configuración del banner en el backend
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/promo-banner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, autoplay, interval })
      });

      if (!response.ok) throw new Error('Error al actualizar');

      localStorage.setItem("promoMessage", message);
      localStorage.setItem("bearMessage", bearMessage);

      // 🔥 Notificar al osito que el mensaje cambió
      window.dispatchEvent(new Event("bearMessageUpdated"));

      setNotification({ mensaje: "Mensajes actualizados correctamente", tipo: "success" });
    } catch (error) {
      console.error('Error guardando:', error);
      setNotification({ mensaje: "Error al guardar los cambios", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }

  function resetear() {
    setMessage(defaultMessage);
    setBearMessage(defaultBearMessage);

    localStorage.setItem("promoMessage", defaultMessage);
    localStorage.setItem("bearMessage", defaultBearMessage);

    // 🔥 Notificar al osito
    window.dispatchEvent(new Event("bearMessageUpdated"));
  }

  async function handleImageUpload() {
    if (!newImage) {
      setNotification({ mensaje: "Por favor selecciona una imagen", tipo: "error" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('image', newImage);
      const positionCSS = convertPositionToCSS(previewPosition);
      formData.append('objectPosition', positionCSS);

      console.log('📤 Enviando imagen con posición:', positionCSS);
      console.log('📍 Preview position:', previewPosition);

      const response = await fetch(`${API_URL}/promo-banner/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const data = await response.json();
      console.log('✅ Respuesta del backend:', data);
      console.log('📷 Imágenes recibidas:', data.banner.images);
      
      setBannerImages(data.banner.images);
      setNewImage(null);
      setImagePreview(null);
      setPreviewPosition({ x: 50, y: 50 });
      setNewImagePosition("center");
      
      // Limpiar el input
      document.getElementById('imageInput').value = '';
      
      setNotification({ mensaje: "Imagen agregada correctamente", tipo: "success" });
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setNotification({ mensaje: "Error al subir la imagen", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteImage(imageId) {
    setConfirmDelete(imageId);
  }

  async function confirmDeleteImage() {
    const imageId = confirmDelete;
    setConfirmDelete(null);

    console.log('🗑️ Eliminando imagen con ID:', imageId);

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/promo-banner/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar imagen');

      const data = await response.json();
      setBannerImages(data.banner.images);
      
      setNotification({ mensaje: "Imagen eliminada correctamente", tipo: "success" });
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      setNotification({ mensaje: "Error al eliminar la imagen", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePosition(imageId, position) {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/promo-banner/images/${imageId}/position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ objectPosition: position })
      });

      if (!response.ok) throw new Error('Error al actualizar posición');

      const data = await response.json();
      setBannerImages(data.banner.images);
      
      setNotification({ mensaje: "Posición actualizada", tipo: "success" });
    } catch (error) {
      console.error('Error actualizando posición:', error);
      setNotification({ mensaje: "Error al actualizar la posición", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }

  // Funciones para el preview interactivo
  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handlePreviewMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    updatePreviewPosition(e);
  }

  function handlePreviewMouseMove(e) {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      updatePreviewPosition(e);
    }
  }

  function handlePreviewMouseUp() {
    setIsDragging(false);
  }

  function updatePreviewPosition(e) {
    if (!previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPreviewPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  }

  function convertPositionToCSS(pos) {
    return `${pos.x}% ${pos.y}%`;
  }

  // Drag & drop handlers
  function handleDragStart(index) {
    setDraggedIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  async function handleDrop(e, dropIndex) {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reordenar array localmente
    const newImages = [...bannerImages];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    
    setBannerImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Actualizar orden en el backend
    try {
      const token = localStorage.getItem('adminToken');
      const imageIds = newImages.map(img => img._id);
      
      const response = await fetch(`${API_URL}/promo-banner/images/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageIds })
      });

      if (!response.ok) throw new Error('Error al reordenar');
      
      setNotification({ mensaje: "Orden actualizado correctamente", tipo: "success" });
    } catch (error) {
      console.error('Error reordenando:', error);
      setNotification({ mensaje: "Error al actualizar el orden", tipo: "error" });
      // Recargar para restaurar orden original
      loadBannerConfig();
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePreviewMouseMove);
      window.addEventListener('mouseup', handlePreviewMouseUp);
      return () => {
        window.removeEventListener('mousemove', handlePreviewMouseMove);
        window.removeEventListener('mouseup', handlePreviewMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Marketing</h2>
      <p className="admin-section-text">
        Personalizá los mensajes promocionales de la tienda.
      </p>

      {/* Configuración general del banner */}
      <div className="marketing-box">
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Configuración del Banner</h3>
        
        {/* Mensaje del banner */}
        <label className="marketing-label">Mensaje del banner</label>
        <textarea
          className="marketing-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />

        {/* Vista previa del mensaje */}
        <div style={{ marginTop: '15px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px', color: '#555' }}>Vista previa del mensaje</h3>
          <div className="marketing-preview-box">{message}</div>
        </div>

        {/* Mensaje del osito */}
        <label className="marketing-label" style={{ marginTop: "20px" }}>
          Mensaje del osito flotante
        </label>
        <input
          className="marketing-textarea"
          value={bearMessage}
          onChange={(e) => setBearMessage(e.target.value)}
        />

        {/* Autoplay y velocidad */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
            />
            Autoplay
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Intervalo (ms):
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              style={{ width: '100px', padding: '5px' }}
              min="1000"
              step="500"
            />
          </label>
        </div>

        <div className="marketing-actions">
          <button 
            className="btn-guardar" 
            onClick={guardar}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar configuración'}
          </button>

          <button className="btn-resetear" onClick={resetear}>
            Resetear a default
          </button>
        </div>
      </div>

      {/* Gestión de imágenes del banner */}
      <div className="marketing-box" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Imágenes del Banner</h3>

        {/* Agregar nueva imagen */}
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '8px' }}>
          <label className="marketing-label">Agregar nueva imagen</label>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="imageInput" className="file-input-label">
              📁 Seleccionar imagen
            </label>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            {newImage && (
              <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                {newImage.name}
              </span>
            )}
          </div>

          {/* Preview interactivo */}
          {imagePreview && (
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>Preview:</strong> Haz clic y arrastra sobre la imagen para ajustar la posición
              </p>
              <div
                style={{
                  width: '100%',
                  height: '0',
                  paddingBottom: '31.25%', // Proporción 1920:600 = 31.25%
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid #667eea',
                  position: 'relative',
                  background: '#f3f3f3'
                }}
              >
                <div 
                  ref={previewRef}
                  className="image-preview-container"
                  onMouseDown={handlePreviewMouseDown}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: convertPositionToCSS(previewPosition),
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: `${previewPosition.y}%`,
                      left: `${previewPosition.x}%`,
                      width: '12px',
                      height: '12px',
                      background: '#fff',
                      border: '2px solid #667eea',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Posición: {previewPosition.x.toFixed(0)}% horizontal, {previewPosition.y.toFixed(0)}% vertical
              </p>
            </div>
          )}

          <button
            onClick={handleImageUpload}
            disabled={loading || !newImage}
            style={{ 
              marginTop: '10px',
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading || !newImage ? 'not-allowed' : 'pointer',
              opacity: loading || !newImage ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading && newImage) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {loading ? '⏳ Subiendo...' : '📤 Subir imagen'}
          </button>
        </div>

        {/* Lista de imágenes actuales */}
        <div>
          <h4 style={{ marginBottom: '10px' }}>Imágenes actuales ({bannerImages.length})</h4>
          {bannerImages.length > 0 && (
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
              💡 Arrastra las imágenes para cambiar el orden
            </p>
          )}
          
          {bannerImages.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic' }}>No hay imágenes. El banner usará las imágenes por defecto.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {bannerImages.map((img, index) => (
                <div
                  key={img._id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: 'flex',
                    gap: '15px',
                    padding: '15px',
                    border: dragOverIndex === index ? '2px solid #667eea' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: draggedIndex === index ? '#f0f0f0' : '#fafafa',
                    opacity: draggedIndex === index ? 0.5 : 1,
                    cursor: 'grab',
                    transition: 'all 0.2s',
                    transform: dragOverIndex === index ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '20px',
                    color: '#999',
                    cursor: 'grab',
                    userSelect: 'none'
                  }}>
                    ⋮⋮
                  </div>

                  <img
                    src={img.url}
                    alt={`Banner ${index + 1}`}
                    style={{
                      width: '200px',
                      height: '80px',
                      objectFit: 'cover',
                      objectPosition: img.objectPosition || 'center center',
                      borderRadius: '4px',
                      pointerEvents: 'none'
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                      Imagen {index + 1}
                    </p>

                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                      <strong>Posición:</strong> {img.objectPosition}
                    </p>

                    <button
                      onClick={() => handleDeleteImage(img._id)}
                      disabled={loading}
                      style={{
                        marginTop: '10px',
                        padding: '8px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {notification && (
        <NotificationModal
          mensaje={notification.mensaje}
          tipo={notification.tipo}
          onClose={() => setNotification(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          titulo="Confirmar eliminación"
          mensaje="¿Estás seguro de que deseas eliminar esta imagen del banner?"
          onConfirm={confirmDeleteImage}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
