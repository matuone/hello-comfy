// src/components/CategoriesMenu.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/categoriesmenu.css";

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function CategoriesMenu({ className = "" }) {
  const [grouped, setGrouped] = useState(FALLBACK);

  useEffect(() => {
    fetch(`${API_URL}/products/filters/data`)
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
    <div className={`mega ${className}`.trim()} role="menu" aria-label="Productos">
      {columns.map((cat) => (
        <div className="mega__col" key={cat}>
          <span className="mega__title">{cat}</span>
          {(grouped[cat] || FALLBACK[cat]).map((sub) => (
            <Link
              key={sub}
              to={`/${catSlug[cat]}/${encodeURIComponent(sub)}`}
              className="mega__link"
            >
              {sub}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
