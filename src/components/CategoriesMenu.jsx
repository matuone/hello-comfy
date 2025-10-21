import { NavLink } from "react-router-dom";

/**
 * Mega menú de categorías (3 columnas) con títulos por columna.
 * Los títulos (REMERAS, MERCH, TOTEBAGS) están en mayúsculas, subrayados
 * y siguen siendo enlaces a sus listados principales.
 *
 * Estilos en /src/styles/navbar.css
 */
export default function CategoriesMenu({ onNavigate }) {
  const handleClick = () => {
    if (typeof onNavigate === "function") onNavigate();
  };

  const COLS = [
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
      ],
    },
    {
      title: ["TOTEBAGS", "totebags"],
      items: [
        ["OUTLET", "outlet"],
        ["Buzos", "buzos"],
        ["Medias", "medias"],
        ["SHORTS/PANTALONES", "shorts-pantalones"],
        ["Pijamas", "pijamas"],
        ["Personalizado", "personalizado"],
      ],
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

          {/* Hijas */}
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
