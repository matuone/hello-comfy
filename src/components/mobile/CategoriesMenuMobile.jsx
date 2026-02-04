// CategoriesMenuMobile.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK = {
  "Indumentaria": ["Remeras", "Buzos", "Pijamas", "Shorts", "Totes", "Outlet"],
  "Cute items": ["Vasos"],
  "Merch": ["Artistas nacionales", "Artistas internacionales"],
};

const catSlug = {
  "Indumentaria": "indumentaria",
  "Cute items": "cute-items",
  "Merch": "merch",
};

export default function CategoriesMenuMobile({ onClose }) {
  const [grouped, setGrouped] = useState(FALLBACK);
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
          setGrouped((prev) => ({ ...prev, ...data.groupedSubcategories }));
        }
      })
      .catch(() => setGrouped(FALLBACK));
  }, []);

  const columns = ["Indumentaria", "Cute items", "Merch"];

  return (
    <div className="categories-mobile-menu" role="menu" aria-label="Productos">
      {columns.map((cat) => (
        <div key={cat} className="cat-mobile-block">
          <button className="cat-mobile-title" onClick={() => setOpenCat(openCat === cat ? null : cat)}>
            {cat}
          </button>
          {openCat === cat && (
            <div className="cat-mobile-sublist">
              {(grouped[cat] || FALLBACK[cat]).map((sub) => (
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
      ))}
    </div>
  );
}
