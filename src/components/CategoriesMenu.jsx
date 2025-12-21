// src/components/CategoriesMenu.jsx
import { Link } from "react-router-dom";
import "../styles/categoriesmenu.css";

export default function CategoriesMenu({ className = "" }) {
  return (
    <div className={`mega ${className}`.trim()} role="menu" aria-label="Productos">
      {/* Indumentaria */}
      <div className="mega__col">
        <span className="mega__title">Indumentaria</span>
        <Link to="/indumentaria/remeras" className="mega__link">Remeras</Link>
        <Link to="/indumentaria/buzos" className="mega__link">Buzos</Link>
        <Link to="/indumentaria/pijamas" className="mega__link">Pijamas</Link>
        <Link to="/indumentaria/shorts" className="mega__link">Shorts</Link>
        <Link to="/indumentaria/totes" className="mega__link">Totes</Link>
        <Link to="/indumentaria/outlet" className="mega__link">Outlet</Link>
      </div>

      {/* Cute Items */}
      <div className="mega__col">
        <span className="mega__title">Cute Items</span>
        <Link to="/cute-items/vasos" className="mega__link">Vasos</Link>
      </div>

      {/* Merch */}
      <div className="mega__col">
        <span className="mega__title">Merch</span>
        <Link to="/merch/artistas-nacionales" className="mega__link">Artistas Nacionales</Link>
        <Link to="/merch/artistas-internacionales" className="mega__link">Artistas Internacionales</Link>
      </div>
    </div>
  );
}
