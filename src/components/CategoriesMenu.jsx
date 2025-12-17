// src/components/CategoriesMenu.jsx
import { Link } from "react-router-dom";
import "../styles/navbar.css"; // usa las clases .mega, .mega__col, etc.

export default function CategoriesMenu() {
  return (
    <div className="mega" role="menu" aria-label="Categorías">
      <div className="mega__col">
        <span className="mega__title">Remeras</span>
        <Link to="/remeras/estampadas" className="mega__link">Estampadas</Link>
        <Link to="/remeras/bordadas" className="mega__link">Bordadas</Link>
        <Link to="/remeras/crop-tops" className="mega__link">Crop tops</Link>
        <Link to="/remeras/aterciopeladas" className="mega__link">Aterciopeladas</Link>
        <Link to="/remeras/xxl" className="mega__link">XXL / 3XL</Link>
        <Link to="/remeras/baby-tees" className="mega__link">Baby tees</Link>
        <Link to="/remeras/personalizado" className="mega__link">Personalizado</Link>
      </div>

      <div className="mega__col">
        <span className="mega__title">Merch</span>
        <Link to="/merch/harry-styles" className="mega__link">Harry Styles</Link>
        <Link to="/merch/taylor-swift" className="mega__link">Taylor Swift</Link>
        <Link to="/merch/justin-bieber" className="mega__link">Justin Bieber</Link>
        <Link to="/merch/green-day" className="mega__link">Green Day</Link>
        <Link to="/merch/lana-del-rey" className="mega__link">Lana del Rey</Link>
        <Link to="/merch/oasis" className="mega__link">Oasis</Link>
        <Link to="/merch/arctic-monkeys" className="mega__link">Arctic Monkeys</Link>
        <Link to="/merch/miley-cyrus" className="mega__link">Miley Cyrus</Link>
        <Link to="/merch/the-weeknd" className="mega__link">The Weeknd</Link>
        <Link to="/merch/phoebe-bridgers" className="mega__link">Phoebe Bridgers</Link>
        <Link to="/merch/jonas-brothers" className="mega__link">Jonas Brothers</Link>
        <Link to="/merch/olivia-rodrigo" className="mega__link">Olivia Rodrigo</Link>
        <Link to="/merch/personalizado" className="mega__link">Personalizado</Link>
      </div>

      <div className="mega__col">
        <span className="mega__title">Otros</span>
        <Link to="/pijamas" className="mega__link">Pijamas</Link>
        <Link to="/totebags" className="mega__link">Totebags</Link>
        <Link to="/outlet" className="mega__link">Outlet</Link>
        <Link to="/buzos" className="mega__link">Buzos</Link>
        <Link to="/medias" className="mega__link">Medias</Link>
        <Link to="/shorts-pantalones" className="mega__link">Shorts / Pantalones</Link>
      </div>
    </div>
  );
}
