// src/components/OpinionsPopup.jsx

import "../styles/opinionspopup.css";
import { useEffect, useState, useRef } from "react";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function OpinionsPopup({ productId, onClose }) {
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!productId) return;
    async function fetchOpinions() {
      setLoading(true);
      try {
        const res = await fetch(apiPath(`/opinions/product/${productId}`));
        const data = await res.json();
        setOpinions(data.opinions || []);
      } catch (err) {
        setOpinions([]);
      }
      setLoading(false);
    }
    fetchOpinions();

    // Escuchar evento global para recargar opiniones
    function handleReload(e) {
      if (e.detail?.productId === productId) {
        fetchOpinions();
      }
    }
    window.addEventListener("reloadProductOpinions", handleReload);
    return () => window.removeEventListener("reloadProductOpinions", handleReload);
  }, [productId]);

  return (
    <div className="opinions-overlay" onClick={onClose}>
      <div className="opinions-popup" onClick={e => e.stopPropagation()}>
        <h2 className="opinions-title">Opiniones del producto</h2>
        {loading ? (
          <div>Cargando opiniones...</div>
        ) : opinions.length === 0 ? (
          <div>No hay opiniones aún.</div>
        ) : (
          <div className="opinions-carousel" style={{ overflow: 'hidden', width: 340, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }} ref={carouselRef}>
            <button
              className="opinions-arrow"
              style={{ left: 0, zIndex: 2, background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, position: 'absolute', top: '50%', transform: 'translateY(-50%)', color: '#d94f7a', opacity: current === 0 ? 0.3 : 1 }}
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
            >
              &#8592;
            </button>
            <div style={{ display: 'flex', transition: 'transform 0.3s', transform: `translateX(calc(-${current * 340}px + 50% - 170px))` }}>
              {opinions.map((op, idx) => (
                <div key={op._id} className="opinions-item" style={{ minWidth: 340, maxWidth: 340, padding: 16, boxSizing: 'border-box', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 18, color: '#FFD700' }}>{'★'.repeat(op.stars)}<span style={{ color: '#ccc' }}>{'★'.repeat(5 - op.stars)}</span></div>
                  <div style={{ fontWeight: 600, textAlign: 'center' }}>{op.user?.name || 'Cliente'}</div>
                  <div style={{ fontSize: 14, textAlign: 'center' }}>{op.text}</div>
                  <div style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>{new Date(op.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
            <button
              className="opinions-arrow"
              style={{ right: 0, zIndex: 2, background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, position: 'absolute', top: '50%', transform: 'translateY(-50%)', color: '#d94f7a', opacity: current === opinions.length - 1 ? 0.3 : 1 }}
              onClick={() => setCurrent(c => Math.min(opinions.length - 1, c + 1))}
              disabled={current === opinions.length - 1}
            >
              &#8594;
            </button>
          </div>
        )}
        <button onClick={onClose} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#d94f7a", color: "white", border: "none", fontWeight: 600, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}
