// src/components/CategoriesMenu.jsx

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCachedCategoryFilters, getCategoryFilters } from "../services/categoryFilters";
import "../styles/categoriesmenu.css";

const catSlug = {
  "Indumentaria": "indumentaria",
  "Cute items": "cute-items",
  "Merch": "merch",
};

const normalizeLabel = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const isComfyGeekLabel = (value) => {
  const normalized = normalizeLabel(value);
  return normalized === "comfy geek" || normalized === "comfy geek!";
};

export default function CategoriesMenu({ className = "", onSelect }) {
  const cachedFilters = getCachedCategoryFilters();
  const [grouped, setGrouped] = useState(() => cachedFilters?.groupedSubcategories || null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (grouped) {
      return () => { mounted = false; };
    }

    getCategoryFilters()
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
  }, [grouped]);

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
                {isComfyGeekLabel(sub) ? `${sub} 👾` : sub}
              </Link>
            ))}
          </div>
        );
      })}
    </div>
  );
}
