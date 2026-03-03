import { useState, useEffect, useRef } from "react";
import "../styles/adminmarketing.css";
import NotificationModal from "../components/NotificationModal";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

export default function AdminMarketing() {
  const { adminFetch } = useAuth();
  const defaultMessage = "Aprovechá hoy 3x2 en remeras 🧸";
  const defaultBearMessage = "HELLOCOMFY10";

  const [message, setMessage] = useState("");
  const [bearMessage, setBearMessage] = useState("");

  // Estado para home copy
  const [homeTitle, setHomeTitle] = useState("");
  const [homeDescription, setHomeDescription] = useState("");
  const [isEditingHome, setIsEditingHome] = useState(false);
  const [originalHomeTitle, setOriginalHomeTitle] = useState("");
  const [originalHomeDescription, setOriginalHomeDescription] = useState("");

  // Estado para estilos del home copy
  const [titleStyles, setTitleStyles] = useState({ maxWidth: "", fontSize: "", color: "#333333" });
  const [descriptionStyles, setDescriptionStyles] = useState({ maxWidth: "1000", fontSize: "", color: "#666666" });
  const [originalTitleStyles, setOriginalTitleStyles] = useState({ maxWidth: "", fontSize: "", color: "#333333" });
  const [originalDescriptionStyles, setOriginalDescriptionStyles] = useState({ maxWidth: "1000", fontSize: "", color: "#666666" });

  // Estado para gestión de imágenes del banner
  const [bannerImages, setBannerImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [newImagePosition, setNewImagePosition] = useState("center");
  const [loading, setLoading] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [interval, setInterval] = useState(5000);
  const [bannerFontSize, setBannerFontSize] = useState(64);

  // Estilos de texto del banner (desktop)
  const [bannerTextAlign, setBannerTextAlign] = useState('left');
  const [bannerTextColor, setBannerTextColor] = useState('#ffffff');
  const [bannerFontWeight, setBannerFontWeight] = useState(900);
  const [bannerFontStyle, setBannerFontStyle] = useState('normal');
  const [bannerTextTransform, setBannerTextTransform] = useState('none');

  // Estado para banner mobile
  const [mobileFontSize, setMobileFontSize] = useState(28);
  const [mobileColor, setMobileColor] = useState('#d72660');

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

    // Cargar home copy
    loadHomeCopy();
  }, []);

  async function loadBannerConfig() {
    try {
      const response = await fetch(apiPath('/promo-banner'));
      const data = await response.json();

      if (data) {
        setBannerImages(data.images || []);
        if (data.message) setMessage(data.message);
        setAutoplay(data.autoplay !== undefined ? data.autoplay : true);
        setInterval(data.interval || 5000);
        setBannerFontSize(data.fontSize || 64);
        setMobileFontSize(data.mobileFontSize || 28);
        setMobileColor(data.mobileColor || '#d72660');
        if (data.textAlign) setBannerTextAlign(data.textAlign);
        if (data.textColor) setBannerTextColor(data.textColor);
        if (data.fontWeight !== undefined) setBannerFontWeight(data.fontWeight);
        if (data.fontStyle) setBannerFontStyle(data.fontStyle);
        if (data.textTransform) setBannerTextTransform(data.textTransform);
      }
    } catch (error) {
      // Error cargando configuración del banner
    }
  }

  async function loadHomeCopy() {
    try {
      const response = await fetch(apiPath('/config/home-copy'));
      const data = await response.json();

      if (data) {
        const title = data.title || "Bienvenid@ a Hello-Comfy";
        const description = data.description || "";
        const ts = data.titleStyles || { maxWidth: "", fontSize: "", color: "#333333" };
        const ds = data.descriptionStyles || { maxWidth: "1000", fontSize: "", color: "#666666" };
        setHomeTitle(title);
        setHomeDescription(description);
        setOriginalHomeTitle(title);
        setOriginalHomeDescription(description);
        setTitleStyles(ts);
        setDescriptionStyles(ds);
        setOriginalTitleStyles(ts);
        setOriginalDescriptionStyles(ds);
      }
    } catch (error) {
      // Error cargando home copy
    }
  }

  async function guardar() {
    setLoading(true);
    try {
      // Actualizar configuración del banner
      const bannerResponse = await adminFetch(apiPath('/promo-banner'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, autoplay, interval, fontSize: bannerFontSize, mobileFontSize, mobileColor, textAlign: bannerTextAlign, textColor: bannerTextColor, fontWeight: bannerFontWeight, fontStyle: bannerFontStyle, textTransform: bannerTextTransform })
      });

      if (!bannerResponse.ok) throw new Error('Error al actualizar banner');

      // Actualizar home copy
      const homeCopyResponse = await adminFetch(apiPath('/config/home-copy'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: homeTitle, description: homeDescription, titleStyles, descriptionStyles })
      });

      if (!homeCopyResponse.ok) throw new Error('Error al actualizar home copy');

      localStorage.setItem("promoMessage", message);
      localStorage.setItem("bearMessage", bearMessage);

      // 🔥 Notificar al osito que el mensaje cambió
      window.dispatchEvent(new Event("bearMessageUpdated"));

      // Notificar al home que el copy cambió
      window.dispatchEvent(new Event("homeCopyUpdated"));

      setNotification({ mensaje: "Cambios guardados correctamente", tipo: "success" });
    } catch (error) {
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
      const formData = new FormData();
      formData.append('image', newImage);
      const positionCSS = convertPositionToCSS(previewPosition);
      formData.append('objectPosition', positionCSS);

      // Enviando imagen con posición

      const response = await adminFetch(apiPath('/promo-banner/images'), {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const data = await response.json();

      setBannerImages(data.banner.images);
      setNewImage(null);
      setImagePreview(null);
      setPreviewPosition({ x: 50, y: 50 });
      setNewImagePosition("center");

      // Limpiar el input
      document.getElementById('imageInput').value = '';

      setNotification({ mensaje: "Imagen agregada correctamente", tipo: "success" });
    } catch (error) {
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

    // Eliminando imagen con ID

    setLoading(true);
    try {
      const response = await adminFetch(apiPath(`/promo-banner/images/${imageId}`), {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar imagen');

      const data = await response.json();
      setBannerImages(data.banner.images);

      setNotification({ mensaje: "Imagen eliminada correctamente", tipo: "success" });
    } catch (error) {
      setNotification({ mensaje: "Error al eliminar la imagen", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePosition(imageId, position) {
    setLoading(true);
    try {
      const response = await adminFetch(apiPath(`/promo-banner/images/${imageId}/position`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objectPosition: position })
      });

      if (!response.ok) throw new Error('Error al actualizar posición');

      const data = await response.json();
      setBannerImages(data.banner.images);

      setNotification({ mensaje: "Posición actualizada", tipo: "success" });
    } catch (error) {
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

  // Funciones para edición de Home Copy
  function handleEditHome() {
    setIsEditingHome(true);
  }

  async function handleSaveHome() {
    setLoading(true);
    try {
      const response = await adminFetch(apiPath('/config/home-copy'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: homeTitle, description: homeDescription, titleStyles, descriptionStyles })
      });

      if (!response.ok) throw new Error('Error al actualizar home copy');

      // Actualizar valores originales
      setOriginalHomeTitle(homeTitle);
      setOriginalHomeDescription(homeDescription);
      setOriginalTitleStyles({ ...titleStyles });
      setOriginalDescriptionStyles({ ...descriptionStyles });
      setIsEditingHome(false);

      // Notificar al home que el copy cambió
      window.dispatchEvent(new Event("homeCopyUpdated"));

      setNotification({ mensaje: "Sección de bienvenida actualizada", tipo: "success" });
    } catch (error) {
      setNotification({ mensaje: "Error al guardar la sección de bienvenida", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleCancelHome() {
    setHomeTitle(originalHomeTitle);
    setHomeDescription(originalHomeDescription);
    setTitleStyles({ ...originalTitleStyles });
    setDescriptionStyles({ ...originalDescriptionStyles });
    setIsEditingHome(false);
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
      const imageIds = newImages.map(img => img._id);

      const response = await adminFetch(apiPath('/promo-banner/images/reorder'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageIds })
      });

      if (!response.ok) throw new Error('Error al reordenar');

      setNotification({ mensaje: "Orden actualizado correctamente", tipo: "success" });
    } catch (error) {
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

  // AnnouncementBar messages (lista editable)
  const [announcementMessages, setAnnouncementMessages] = useState([]);
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState("");

  // Discount badge style
  const [badgeBg, setBadgeBg] = useState("#ff4444");
  const [badgeColor, setBadgeColor] = useState("#ffffff");

  useEffect(() => {
    async function fetchAnnouncementMessages() {
      try {
        const res = await fetch(`${API_URL}/config/announcement-bar-messages`);
        const data = await res.json();
        // Si no hay mensajes en la base, usar los hardcodeados por defecto
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setAnnouncementMessages(data.messages);
        } else {
          setAnnouncementMessages([
            "Envío gratis en compras +$190.000 🚀",
            "10% OFF X TRANSFERENCIA 💸",
            "3 cuotas sin interés 🐻",
            "Envío gratis en compras +$190.000 💸"
          ]);
        }
      } catch (err) {
        setAnnouncementMessages([
          "Envío gratis en compras +$190.000 🚀",
          "10% OFF X TRANSFERENCIA 💸",
          "3 cuotas sin interés 🐻",
          "Envío gratis en compras +$190.000 💸"
        ]);
      }
    }
    fetchAnnouncementMessages();
  }, []);

  // Cargar estilo badge descuento
  useEffect(() => {
    async function fetchBadgeStyle() {
      try {
        const res = await fetch(`${API_URL}/config/discount-badge-style`);
        const data = await res.json();
        if (data.background) setBadgeBg(data.background);
        if (data.color) setBadgeColor(data.color);
      } catch (err) {
        // usar defaults
      }
    }
    fetchBadgeStyle();
  }, []);

  async function saveBadgeStyle() {
    setLoading(true);
    try {
      await adminFetch(`${API_URL}/config/discount-badge-style`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ background: badgeBg, color: badgeColor })
      });
      setNotification({ mensaje: "Estilo del badge de descuento guardado", tipo: "success" });
    } catch (err) {
      setNotification({ mensaje: "Error al guardar estilo del badge", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleAddAnnouncementMessage() {
    if (newAnnouncementMessage.trim()) {
      setAnnouncementMessages([...announcementMessages, newAnnouncementMessage]);
      setNewAnnouncementMessage("");
    }
  }
  function handleRemoveAnnouncementMessage(idx) {
    setAnnouncementMessages(announcementMessages.filter((_, i) => i !== idx));
  }
  function handleEditAnnouncementMessage(idx, value) {
    setAnnouncementMessages(announcementMessages.map((msg, i) => i === idx ? value : msg));
  }

  async function saveAnnouncementMessages() {
    setLoading(true);
    try {
      await adminFetch(`${API_URL}/config/announcement-bar-messages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: announcementMessages })
      });
      setNotification({ mensaje: "Mensajes del AnnouncementBar guardados", tipo: "success" });
      // Refrescar mensajes después de guardar
      const res = await fetch(`${API_URL}/config/announcement-bar-messages`);
      const data = await res.json();
      setAnnouncementMessages(data.messages || []);
    } catch (err) {
      setNotification({ mensaje: "Error al guardar los mensajes", tipo: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-marketing-container">
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 10 }}>Marketing</h2>
      <p style={{ color: '#555', marginBottom: 25 }}>
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

        {/* Tamaño de fuente del banner */}
        <label className="marketing-label" style={{ marginTop: '15px' }}>Tamaño de fuente del banner (px)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range"
            min="20"
            max="120"
            value={bannerFontSize}
            onChange={(e) => setBannerFontSize(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min="20"
            max="120"
            value={bannerFontSize}
            onChange={(e) => setBannerFontSize(Number(e.target.value))}
            style={{ width: '70px', padding: '5px', textAlign: 'center', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <span style={{ color: '#888', fontSize: '13px' }}>{bannerFontSize}px</span>
        </div>

        {/* Alineación del texto */}
        <label className="marketing-label" style={{ marginTop: '15px' }}>Posición del texto (desktop)</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: 'left', label: '⬅ Izquierda' },
            { value: 'center', label: '↔ Centro' },
            { value: 'right', label: '➡ Derecha' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setBannerTextAlign(value)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: `2px solid ${bannerTextAlign === value ? '#d72660' : '#ccc'}`,
                background: bannerTextAlign === value ? '#d72660' : '#fff',
                color: bannerTextAlign === value ? '#fff' : '#333',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Color del texto */}
        <label className="marketing-label" style={{ marginTop: '15px' }}>Color del texto</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="color"
            value={bannerTextColor}
            onChange={(e) => setBannerTextColor(e.target.value)}
            style={{ width: '48px', height: '36px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
          />
          <span style={{ color: '#555', fontSize: '13px' }}>{bannerTextColor}</span>
        </div>

        {/* Estilos de texto */}
        <label className="marketing-label" style={{ marginTop: '15px' }}>Estilos de texto</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Negrita */}
          <button
            onClick={() => setBannerFontWeight(bannerFontWeight === 900 ? 400 : 900)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: `2px solid ${bannerFontWeight === 900 ? '#d72660' : '#ccc'}`,
              background: bannerFontWeight === 900 ? '#d72660' : '#fff',
              color: bannerFontWeight === 900 ? '#fff' : '#333',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <strong>N</strong>egrita
          </button>

          {/* Cursiva */}
          <button
            onClick={() => setBannerFontStyle(bannerFontStyle === 'italic' ? 'normal' : 'italic')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: `2px solid ${bannerFontStyle === 'italic' ? '#d72660' : '#ccc'}`,
              background: bannerFontStyle === 'italic' ? '#d72660' : '#fff',
              color: bannerFontStyle === 'italic' ? '#fff' : '#333',
              fontStyle: 'italic',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <em>C</em>ursiva
          </button>

          {/* Mayúsculas */}
          <button
            onClick={() => setBannerTextTransform(bannerTextTransform === 'uppercase' ? 'none' : 'uppercase')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: `2px solid ${bannerTextTransform === 'uppercase' ? '#d72660' : '#ccc'}`,
              background: bannerTextTransform === 'uppercase' ? '#d72660' : '#fff',
              color: bannerTextTransform === 'uppercase' ? '#fff' : '#333',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'uppercase',
            }}
          >
            Mayúsculas
          </button>

          {/* Capitalizar */}
          <button
            onClick={() => setBannerTextTransform(bannerTextTransform === 'capitalize' ? 'none' : 'capitalize')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: `2px solid ${bannerTextTransform === 'capitalize' ? '#d72660' : '#ccc'}`,
              background: bannerTextTransform === 'capitalize' ? '#d72660' : '#fff',
              color: bannerTextTransform === 'capitalize' ? '#fff' : '#333',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'capitalize',
            }}
          >
            Capitalizar
          </button>
        </div>

        {/* Vista previa del mensaje */}
        <div style={{ marginTop: '15px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px', color: '#555' }}>Vista previa del mensaje</h3>
          <div
            className="marketing-preview-box"
            style={{
              fontSize: `${Math.min(bannerFontSize, 40)}px`,
              fontWeight: bannerFontWeight,
              fontStyle: bannerFontStyle,
              textTransform: bannerTextTransform,
              textAlign: bannerTextAlign,
              color: bannerTextColor,
              lineHeight: 1.1,
              background: '#444',
            }}
          >
            {message}
          </div>
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

      {/* Configuración del Banner Mobile/Tablet */}
      <div className="marketing-box" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>
          📱 Banner Versión Mobile / Tablet
        </h3>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '15px' }}>
          Estos ajustes aplican al texto del banner en celulares y tablets.
        </p>

        {/* Color del texto mobile */}
        <label className="marketing-label">Color del texto</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <input
            type="color"
            value={mobileColor}
            onChange={(e) => setMobileColor(e.target.value)}
            style={{ width: '50px', height: '36px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', padding: '2px' }}
          />
          <input
            type="text"
            value={mobileColor}
            onChange={(e) => setMobileColor(e.target.value)}
            style={{ width: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'monospace' }}
          />
          <button
            type="button"
            onClick={() => setMobileColor('#d72660')}
            style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '6px', background: '#fafafa', cursor: 'pointer', fontSize: '12px' }}
          >
            Reset
          </button>
        </div>

        {/* Tamaño de fuente mobile */}
        <label className="marketing-label">Tamaño de fuente (px)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <input
            type="range"
            min="14"
            max="60"
            value={mobileFontSize}
            onChange={(e) => setMobileFontSize(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min="14"
            max="60"
            value={mobileFontSize}
            onChange={(e) => setMobileFontSize(Number(e.target.value))}
            style={{ width: '70px', padding: '5px', textAlign: 'center', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <span style={{ color: '#888', fontSize: '13px' }}>{mobileFontSize}px</span>
        </div>

        {/* Vista previa mobile */}
        <div style={{ marginTop: '10px' }}>
          <h4 style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Vista previa mobile</h4>
          <div style={{
            background: '#222',
            borderRadius: '12px',
            padding: '30px 20px',
            textAlign: 'center',
            maxWidth: '360px',
            margin: '0 auto'
          }}>
            <span style={{
              color: mobileColor,
              fontSize: `${Math.min(mobileFontSize, 36)}px`,
              fontWeight: 900,
              lineHeight: 1.15,
              textShadow: '0 2px 16px rgba(0,0,0,0.3)'
            }}>
              {message}
            </span>
          </div>
        </div>
      </div>

      {/* Configuración de Home Copy */}
      <div className="marketing-box" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Sección de Bienvenida (Home)</h3>
          {!isEditingHome && (
            <button
              onClick={handleEditHome}
              style={{
                padding: '8px 20px',
                background: '#d94f7a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#c6456d'}
              onMouseOut={(e) => e.target.style.background = '#d94f7a'}
            >
              ✏️ Editar
            </button>
          )}
        </div>

        <label className="marketing-label">Título principal</label>
        <input
          className="marketing-textarea"
          value={homeTitle}
          onChange={(e) => setHomeTitle(e.target.value)}
          placeholder="Bienvenid@ a Hello-Comfy"
          disabled={!isEditingHome}
          style={{ opacity: isEditingHome ? 1 : 0.7, cursor: isEditingHome ? 'text' : 'not-allowed' }}
        />

        {/* Estilos del título */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '100px', maxWidth: '150px' }}>
            <label className="marketing-label" style={{ fontSize: '12px', color: '#888' }}>Ancho máx. (px)</label>
            <input
              type="number"
              className="marketing-textarea"
              value={titleStyles.maxWidth}
              onChange={(e) => setTitleStyles({ ...titleStyles, maxWidth: e.target.value })}
              placeholder="Sin límite"
              disabled={!isEditingHome}
              style={{ opacity: isEditingHome ? 1 : 0.7, cursor: isEditingHome ? 'text' : 'not-allowed', padding: '8px 12px' }}
            />
          </div>
          <div style={{ minWidth: '100px', maxWidth: '150px' }}>
            <label className="marketing-label" style={{ fontSize: '12px', color: '#888' }}>Fuente (px)</label>
            <input
              type="number"
              className="marketing-textarea"
              value={titleStyles.fontSize}
              onChange={(e) => setTitleStyles({ ...titleStyles, fontSize: e.target.value })}
              placeholder="Actual: 32"
              disabled={!isEditingHome}
              style={{ opacity: isEditingHome ? 1 : 0.7, cursor: isEditingHome ? 'text' : 'not-allowed', padding: '8px 12px' }}
            />
          </div>
          <div style={{ minWidth: '100px', maxWidth: '180px' }}>
            <label className="marketing-label" style={{ fontSize: '12px', color: '#888' }}>Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={titleStyles.color || '#333333'}
                onChange={(e) => setTitleStyles({ ...titleStyles, color: e.target.value })}
                disabled={!isEditingHome}
                style={{ width: '36px', height: '36px', border: '1px solid #ddd', borderRadius: '6px', cursor: isEditingHome ? 'pointer' : 'not-allowed', padding: '2px' }}
              />
              <input
                type="text"
                className="marketing-textarea"
                value={titleStyles.color || '#333333'}
                onChange={(e) => setTitleStyles({ ...titleStyles, color: e.target.value })}
                disabled={!isEditingHome}
                style={{ opacity: isEditingHome ? 1 : 0.7, cursor: isEditingHome ? 'text' : 'not-allowed', padding: '8px 12px', width: '90px' }}
              />
            </div>
          </div>
        </div>

        <label className="marketing-label" style={{ marginTop: '20px' }}>Descripción</label>
        <textarea
          className="marketing-textarea"
          value={homeDescription}
          onChange={(e) => setHomeDescription(e.target.value)}
          rows={4}
          placeholder="Descripción de bienvenida..."
          disabled={!isEditingHome}
          style={{ opacity: isEditingHome ? 1 : 0.7, cursor: isEditingHome ? 'text' : 'not-allowed' }}
        />

        {/* Estilos de la descripción */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '100px', maxWidth: '150px' }}>
            <label className="marketing-label" style={{ fontSize: '12px', color: '#888' }}>Ancho máx. (px)</label>
            <input
              type="number"
              className="marketing-textarea"
              value={descriptionStyles.maxWidth}
              onChange={(e) => setDescriptionStyles({ ...descriptionStyles, maxWidth: e.target.value })}
              placeholder="Actual: 1000"
              disabled={!isEditingHome}
              style={{ opacity: isEditingHome ? 1 : 0.7, cursor: isEditingHome ? 'text' : 'not-allowed', padding: '8px 12px' }}
            />
          </div>
          <div style={{ minWidth: '100px', maxWidth: '150px' }}>
            <label className="marketing-label" style={{ fontSize: '12px', color: '#888' }}>Fuente (px)</label>
            <input
              type="number"
              className="marketing-textarea"
              value={descriptionStyles.fontSize}
              onChange={(e) => setDescriptionStyles({ ...descriptionStyles, fontSize: e.target.value })}
              placeholder="Actual: 16"
              disabled={!isEditingHome}
              style={{ opacity: isEditingHome ? 1 : 0.7, cursor: isEditingHome ? 'text' : 'not-allowed', padding: '8px 12px' }}
            />
          </div>
          <div style={{ minWidth: '100px', maxWidth: '180px' }}>
            <label className="marketing-label" style={{ fontSize: '12px', color: '#888' }}>Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={descriptionStyles.color || '#666666'}
                onChange={(e) => setDescriptionStyles({ ...descriptionStyles, color: e.target.value })}
                disabled={!isEditingHome}
                style={{ width: '36px', height: '36px', border: '1px solid #ddd', borderRadius: '6px', cursor: isEditingHome ? 'pointer' : 'not-allowed', padding: '2px' }}
              />
              <input
                type="text"
                className="marketing-textarea"
                value={descriptionStyles.color || '#666666'}
                onChange={(e) => setDescriptionStyles({ ...descriptionStyles, color: e.target.value })}
                disabled={!isEditingHome}
                style={{ opacity: isEditingHome ? 1 : 0.7, cursor: isEditingHome ? 'text' : 'not-allowed', padding: '8px 12px', width: '90px' }}
              />
            </div>
          </div>
        </div>

        {isEditingHome && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveHome}
              disabled={loading}
              style={{
                padding: '10px 25px',
                background: '#d94f7a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseOver={(e) => !loading && (e.target.style.background = '#c6456d')}
              onMouseOut={(e) => !loading && (e.target.style.background = '#d94f7a')}
            >
              {loading ? '⏳ Guardando...' : '✔️ Guardar cambios'}
            </button>

            <button
              onClick={handleCancelHome}
              disabled={loading}
              style={{
                padding: '10px 25px',
                background: '#f7f7f7',
                color: '#555',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseOver={(e) => !loading && (e.target.style.background = '#ececec')}
              onMouseOut={(e) => !loading && (e.target.style.background = '#f7f7f7')}
            >
              ❌ Cancelar
            </button>
          </div>
        )}

        <div style={{ marginTop: '15px' }}>
          <h3 style={{ marginBottom: '10px', fontSize: '16px', color: '#555' }}>Vista previa</h3>
          <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa', textAlign: 'center' }}>
            <h1 style={{
              margin: '0 auto 15px auto',
              fontSize: titleStyles.fontSize ? `${titleStyles.fontSize}px` : '24px',
              color: titleStyles.color || '#333',
              maxWidth: titleStyles.maxWidth ? `${titleStyles.maxWidth}px` : 'none',
            }}>{homeTitle}</h1>
            <p style={{
              margin: '0 auto',
              fontSize: descriptionStyles.fontSize ? `${descriptionStyles.fontSize}px` : '14px',
              color: descriptionStyles.color || '#666',
              lineHeight: '1.6',
              maxWidth: descriptionStyles.maxWidth ? `${descriptionStyles.maxWidth}px` : 'none',
            }}>{homeDescription}</p>
          </div>
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
              background: '#d94f7a',
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
                e.target.style.background = '#c6456d';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(217, 79, 122, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#d94f7a';
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
            <p className="admin-empty-text admin-empty-text--muted">
              No hay imágenes. El banner usará las imágenes por defecto.
            </p>
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

      {/* Mensajes AnnouncementBar (escritorio y mobile) */}
      <div className="marketing-box" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Mensajes AnnouncementBar (escritorio y mobile)</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
          Agregá, editá o eliminá los mensajes que se mostrarán en el AnnouncementBar. Podés usar emojis y separar con "•".
        </p>
        {announcementMessages.length === 0 && (
          <div className="admin-empty-text admin-empty-text--muted" style={{ marginBottom: '10px' }}>
            No hay mensajes guardados. Agregá uno nuevo.
          </div>
        )}
        {announcementMessages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={msg}
              onChange={e => handleEditAnnouncementMessage(idx, e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <button onClick={() => handleRemoveAnnouncementMessage(idx)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}>🗑️</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            value={newAnnouncementMessage}
            onChange={e => setNewAnnouncementMessage(e.target.value)}
            placeholder="Nuevo mensaje..."
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <button onClick={handleAddAnnouncementMessage} style={{ background: '#d94f7a', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}>➕</button>
        </div>
        <button className="btn-guardar" onClick={saveAnnouncementMessages} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar mensajes AnnouncementBar'}
        </button>
      </div>

      {/* Estilo badge descuento ("X% OFF") */}
      <div className="marketing-box" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Badge de Descuento (“X% OFF”)</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
          Configurá el color de fondo y el color del texto del badge de descuento que aparece en las tarjetas de productos y en el detalle del producto.
        </p>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#444' }}>Color de fondo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={badgeBg}
                onChange={e => setBadgeBg(e.target.value)}
                style={{ width: '48px', height: '36px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
              />
              <input
                type="text"
                value={badgeBg}
                onChange={e => setBadgeBg(e.target.value)}
                style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'monospace', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#444' }}>Color del texto</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={badgeColor}
                onChange={e => setBadgeColor(e.target.value)}
                style={{ width: '48px', height: '36px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
              />
              <input
                type="text"
                value={badgeColor}
                onChange={e => setBadgeColor(e.target.value)}
                style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'monospace', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#444' }}>Vista previa</label>
            <span style={{
              background: badgeBg,
              color: badgeColor,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'inline-block',
              marginTop: '2px'
            }}>
              10% OFF
            </span>
          </div>
        </div>

        <button className="btn-guardar" onClick={saveBadgeStyle} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar estilo badge'}
        </button>
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
