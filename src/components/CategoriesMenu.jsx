import { NavLink } from "react-router-dom";

/**
 * Mega menú de categorías con columnas individuales.
 * Cada categoría principal tiene su propia columna.
 *
 * Personalizado solo existe en REMERAS y MERCH.
 */
export default function CategoriesMenu({ onNavigate }) {
  const handleClick = () => {
    if (typeof onNavigate === "function") onNavigate();
  };

  const COLS = [
    // === REMERAS ===
    {
      title: ["REMERAS", "remeras"],
      items: [
        ["Estampadas", "estampadas"],
        ["Bordadas", "bordadas"],
        ["Crop tops", "crop-tops"],
        ["Aterciopeladas", "aterciopeladas"],
        ["XXL/3XL", "xxl-3xl"],
        ["Baby tees", "baby-tees"],
        ["Personalizado", "personalizado"],
      ],
    },

    // === MERCH ===
    {
      title: ["MERCH", "merch"],
      items: [
        ["Harry Styles", "harry-styles"],
        ["Taylor Swift", "taylor-swift"],
        ["Justin Bieber", "justin-bieber"],
        ["Green Day", "green-day"],
        ["Lana del Rey", "lana-del-rey"],
        ["Oasis", "oasis"],
        ["Arctic Monkeys", "arctic-monkeys"],
        ["Miley Cyrus", "miley-cyrus"],
        ["The Weeknd", "the-weeknd"],
        ["Phoebe Bridgers", "phoebe-bridgers"],
        ["Jonas Brothers", "jonas-brothers"],
        ["Olivia Rodrigo", "olivia-rodrigo"],
        ["Personalizado", "personalizado"],
      ],
    },

    // === TOTEBAGS ===
    {
      title: ["TOTEBAGS", "totebags"],
      items: [],
    },

    // === OUTLET ===
    {
      title: ["OUTLET", "outlet"],
      items: [],
    },

    // === BUZOS ===
    {
      title: ["BUZOS", "buzos"],
      items: [],
    },

    // === MEDIAS ===
    {
      title: ["MEDIAS", "medias"],
      items: [],
    },

    // === SHORTS / PANTALONES ===
    {
      title: ["SHORTS / PANTALONES", "shorts-pantalones"],
      items: [],
    },

    // === PIJAMAS ===
    {
      title: ["PIJAMAS", "pijamas"],
      items: [],
    },
  ];

  return (
    <div className="mega" role="menu" aria-label="Categorías">
      {COLS.map(({ title, items }) => (
        <div className="mega__col" key={title[1]}>
          {/* Título madre */}
          <NavLink
            to={`/categorias?cat=${encodeURIComponent(title[1])}`}
            className="mega__link mega__title"
            onClick={handleClick}
          >
            {title[0]}
          </NavLink>

          {/* Subcategorías (solo REMERAS y MERCH) */}
          {items.map(([label, slug]) => (
            <NavLink
              key={slug}
              to={`/categorias?cat=${encodeURIComponent(slug)}`}
              className="mega__link"
              onClick={handleClick}
            >
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  );
}
