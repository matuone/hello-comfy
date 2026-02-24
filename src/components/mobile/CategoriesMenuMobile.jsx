// CategoriesMenuMobile.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const catSlug = {
  "Indumentaria": "indumentaria",
  "Cute items": "cute-items",
  "Merch": "merch",
};

export default function CategoriesMenuMobile({ onClose }) {
  const [grouped, setGrouped] = useState(null);
  const [openCat, setOpenCat] = useState(null);

  useEffect(() => {
    // Configuración global de API para compatibilidad local/producción
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    function apiPath(path) {
      return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
    }
    fetch(apiPath('/products/filters/data'))
      .then((res) => res.json())
      .then((data) => {
        if (data?.groupedSubcategories) {
          setGrouped(data.groupedSubcategories);
        }
      })
      .catch(() => { });
  }, []);

  const columns = ["Indumentaria", "Cute items", "Merch"];

  if (!grouped) {
    return (
      <div className="categories-mobile-menu" role="menu" aria-label="Productos">
        <p style={{ padding: '12px 16px', color: '#999', fontSize: '0.9rem' }}>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="categories-mobile-menu" role="menu" aria-label="Productos">
      {columns.map((cat) => {
        const subs = grouped[cat];
        if (!subs || subs.length === 0) return null;
        return (
          <div key={cat} className="cat-mobile-block">
            <button className="cat-mobile-title" onClick={() => setOpenCat(openCat === cat ? null : cat)}>
              {cat}
            </button>
            {openCat === cat && (
              <div className="cat-mobile-sublist">
                {subs.map((sub) => (
                  <Link
                    key={sub}
                    to={`/${catSlug[cat]}/${encodeURIComponent(sub)}`}
                    className="cat-mobile-link"
                    onClick={onClose}
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
