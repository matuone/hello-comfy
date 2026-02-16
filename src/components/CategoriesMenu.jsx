// src/components/CategoriesMenu.jsx

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/categoriesmenu.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

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

export default function CategoriesMenu({ className = "", onSelect }) {
  const [grouped, setGrouped] = useState(null); // null = loading, object = loaded, FALLBACK = fallback
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(apiPath("/products/filters/data"))
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          if (data?.groupedSubcategories) {
            setGrouped({ ...FALLBACK, ...data.groupedSubcategories });
          } else {
            setGrouped(FALLBACK);
            setError(true);
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setGrouped(FALLBACK);
          setError(true);
        }
      });
    return () => { mounted = false; };
  }, []);

  const columns = ["Indumentaria", "Cute items", "Merch"];

  if (grouped === null) {
    // Loading: show spinner or nothing
    return (
      <div className={`modern-menu ${className}`.trim()} role="menu" aria-label="Productos">
        <div className="modern-menu__loading">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <div className={`modern-menu ${className}`.trim()} role="menu" aria-label="Productos">
      {columns.map((cat) => (
        <div className="modern-menu__section" key={cat}>
          <span className="modern-menu__title">{cat}</span>
          {(grouped[cat] || FALLBACK[cat]).map((sub) => (
            <Link
              key={sub}
              to={`/${catSlug[cat]}/${encodeURIComponent(sub)}`}
              className="modern-menu__link"
              onClick={onSelect}
            >
              {sub}
            </Link>
          ))}
        </div>
      ))}
      {error && (
        <div className="modern-menu__error">No se pudo cargar categorías en vivo. Mostrando categorías por defecto.</div>
      )}
    </div>
  );
}
