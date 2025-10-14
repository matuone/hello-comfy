// src/components/Navbar.jsx
import { useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { cart } = (typeof useShop === "function" ? useShop() : {}) ?? { cart: [] };
  const count = (cart || []).reduce((a, i) => a + (i.qty ?? 0), 0);

  const linkClass = ({ isActive }) =>
    "catbar__link" + (isActive ? " is-active" : "");

  const catbarRef = useRef(null);

  // Oculta el hint al primer scroll del contenedor
  useEffect(() => {
    const el = catbarRef.current;
    if (!el) return;

    const onScroll = () => {
      el.classList.add("has-scrolled");
      // Si llegó al final, también podés marcarlo:
      if (Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth) {
        el.classList.add("is-at-end");
      } else {
        el.classList.remove("is-at-end");
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    // Si ya arranca scrolleado por cualquier razón:
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__bear" aria-label="Inicio" title="Inicio">
          <span aria-hidden="true">🐻</span>
        </Link>

        <Link to="/" className="navbar__brand" title="Hello-Comfy">
          Hello-Comfy
        </Link>

        <Link to="/cart" className="cart-pill" aria-label={`Carrito (${count})`} title="Carrito">
          🛒{count > 0 && <span className="cart__badge">{count}</span>}
        </Link>
      </div>

      {/* Barra de categorías con pista visual de scroll */}
      <nav ref={catbarRef} className="catbar" aria-label="Navegación principal">
        {/* Hint “Deslizá →” (solo mobile, se oculta al scrollear) */}
        <span className="catbar__hint" aria-hidden="true">
          Deslizá <span className="catbar__hint-arrow">→</span>
        </span>

        <NavLink to="/categorias" className={linkClass}>Categorías</NavLink>
        <NavLink to="/talles" className={linkClass}>Guía de talles</NavLink>
        <NavLink to="/algodon" className={linkClass}>Algodón y sus cuidados</NavLink>
        <NavLink to="/faq" className={linkClass}>Preguntas Frecuentes</NavLink>
        <NavLink to="/cuenta-dni" className={linkClass}>CUENTA DNI</NavLink>
        <NavLink to="/mi-cuenta" className={linkClass}>Mi cuenta</NavLink>
      </nav>
    </header>
  );
}
