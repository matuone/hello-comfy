// src/components/OpinionsPopup.jsx
import "../styles/opinionspopup.css";
import { useEffect, useState } from "react";

export default function OpinionsPopup({ productId, onClose }) {
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpinions() {
      setLoading(true);
      try {
        const res = await fetch(`/api/opinions/product/${productId}`);
        const data = await res.json();
        setOpinions(data.opinions || []);
      } catch (err) {
        setOpinions([]);
      }
      setLoading(false);
    }
    fetchOpinions();
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
          <ul style={{ padding: 0, listStyle: "none" }}>
            {opinions.map(op => (
              <li key={op._id} style={{ marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                <div style={{ fontSize: 18, color: "#FFD700" }}>{"★".repeat(op.stars)}<span style={{ color: '#ccc' }}>{"★".repeat(5 - op.stars)}</span></div>
                <div style={{ fontWeight: 600 }}>{op.user?.name || "Cliente"}</div>
                <div style={{ fontSize: 14 }}>{op.text}</div>
                <div style={{ fontSize: 12, color: "#999" }}>{new Date(op.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#d94f7a", color: "white", border: "none", fontWeight: 600, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}
