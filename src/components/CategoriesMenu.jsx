// src/components/CategoriesMenu.jsx

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/categoriesmenu.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

const catSlug = {
  "Indumentaria": "indumentaria",
  "Cute items": "cute-items",
  "Merch": "merch",
};

export default function CategoriesMenu({ className = "", onSelect }) {
  const [grouped, setGrouped] = useState(null); // null = loading
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(apiPath("/products/filters/data"))
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          if (data?.groupedSubcategories) {
            setGrouped(data.groupedSubcategories);
          } else {
            setError(true);
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setError(true);
        }
      });
    return () => { mounted = false; };
  }, []);

  const columns = ["Indumentaria", "Cute items", "Merch"];

  if (grouped === null && !error) {
    return (
      <div className={`modern-menu ${className}`.trim()} role="menu" aria-label="Productos">
        <div className="modern-menu__loading">Cargando categorías...</div>
      </div>
    );
  }

  if (error || !grouped) {
    return (
      <div className={`modern-menu ${className}`.trim()} role="menu" aria-label="Productos">
        <div className="modern-menu__loading" style={{ color: '#999' }}>No se pudieron cargar las categorías.</div>
      </div>
    );
  }

  return (
    <div className={`modern-menu ${className}`.trim()} role="menu" aria-label="Productos">
      {columns.map((cat) => {
        const subs = grouped[cat];
        if (!subs || subs.length === 0) return null;
        return (
          <div className="modern-menu__section" key={cat}>
            <span className="modern-menu__title">{cat}</span>
            {subs.map((sub) => (
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
        );
      })}
    </div>
  );
}
