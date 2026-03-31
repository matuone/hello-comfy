// CategoriesMenuMobile.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCachedCategoryFilters, getCategoryFilters } from "../../services/categoryFilters";

const catSlug = {
  "Indumentaria": "indumentaria",
  "Cute items": "cute-items",
  "Merch": "merch",
};

export default function CategoriesMenuMobile({ onClose }) {
  const cachedFilters = getCachedCategoryFilters();
  const [grouped, setGrouped] = useState(() => cachedFilters?.groupedSubcategories || null);
  const [openCat, setOpenCat] = useState(null);

  useEffect(() => {
    if (grouped) {
      return;
    }

    getCategoryFilters()
      .then((data) => {
        if (data?.groupedSubcategories) {
          setGrouped(data.groupedSubcategories);
        }
      })
      .catch(() => { });
  }, [grouped]);

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
      <Link
        to="/products"
        className="cat-mobile-ver-todos"
        onClick={onClose}
      >
        🛍️ Ver todos los productos
      </Link>
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
