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
        <Link to="/cute-items/totebags" className="mega__link">Totebags</Link>
        <Link to="/cute-items/medias" className="mega__link">Medias</Link>
        <Link to="/cute-items/accesorios" className="mega__link">Accesorios</Link>
        <Link to="/cute-items/personalizado" className="mega__link">Personalizado</Link>
      </div>

      {/* Merch */}
      <div className="mega__col">
        <span className="mega__title">Merch</span>
        <Link to="/merch/harry-styles" className="mega__link">Harry Styles</Link>
        <Link to="/merch/taylor-swift" className="mega__link">Taylor Swift</Link>
        <Link to="/merch/arctic-monkeys" className="mega__link">Arctic Monkeys</Link>
        <Link to="/merch/lana-del-rey" className="mega__link">Lana del Rey</Link>
        <Link to="/merch/oasis" className="mega__link">Oasis</Link>
        <Link to="/merch/personalizado" className="mega__link">Personalizado</Link>
      </div>
    </div>
  );
}
