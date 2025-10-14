// src/components/Navbar.jsx
import { NavLink, Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { cart } = useShop?.() ?? { cart: [] };
  const count = (cart || []).reduce((a, i) => a + (i.qty ?? 0), 0);

  const linkClass = ({ isActive }) =>
    "navbar__link" + (isActive ? " is-active" : "");

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Columna izquierda vacía (ayuda a centrar) */}
        <div />

        {/* Navegación central */}
        <nav className="navbar__nav" aria-label="Navegación principal">
          <NavLink to="/categorias" className={linkClass}>Categorías</NavLink>
          <NavLink to="/talles" className={linkClass}>Guía de talles</NavLink>
          <NavLink to="/algodon" className={linkClass}>Algodón y sus cuidados</NavLink>
          <NavLink to="/faq" className={linkClass}>Preguntas Frecuentes</NavLink>
          <NavLink to="/cuenta-dni" className={linkClass}>CUENTA DNI</NavLink>
        </nav>

        {/* Derecha: Mi cuenta (mismo look & efecto) + Carrito */}
        <div className="navbar__right">
          <NavLink to="/mi-cuenta" className={linkClass}>
            Mi cuenta
          </NavLink>
          <Link to="/cart" className="cart-pill" aria-label={`Carrito (${count})`}>
            🛒 <span>{count}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
