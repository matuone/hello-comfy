// src/components/Navbar.jsx
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { cart } = useShop?.() ?? { cart: [] };
  const count = (cart || []).reduce((a, i) => a + (i.qty ?? 0), 0);
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    "navbar__link" + (isActive ? " is-active" : "");

  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className="navbar">
        <div className="navbar__inner">
          {/* Izquierda: botón osito → Home */}
          <Link
            to="/"
            className="navbar__bear"
            aria-label="Inicio"
            title="Inicio"
            onClick={closeMenu}
          >
            <span aria-hidden="true">🐻</span>
          </Link>

          {/* Centro: navegación (DESKTOP) */}
          <nav className="navbar__nav" aria-label="Navegación principal">
            <NavLink to="/categorias" className={linkClass} onClick={closeMenu}>
              Categorías
            </NavLink>
            <NavLink to="/talles" className={linkClass} onClick={closeMenu}>
              Guía de talles
            </NavLink>
            <NavLink to="/algodon" className={linkClass} onClick={closeMenu}>
              Algodón y sus cuidados
            </NavLink>
            <NavLink to="/faq" className={linkClass} onClick={closeMenu}>
              Preguntas Frecuentes
            </NavLink>
            <NavLink to="/cuenta-dni" className={linkClass} onClick={closeMenu}>
              CUENTA DNI
            </NavLink>
          </nav>

          {/* Derecha: Mi cuenta + Carrito + Hamburguesa (mobile) */}
          <div className="navbar__right">
            {/* DESKTOP: Mi cuenta */}
            <NavLink to="/mi-cuenta" className={linkClass} onClick={closeMenu}>
              Mi cuenta
            </NavLink>

            {/* Carrito (Desktop y Mobile) */}
            <Link
              to="/cart"
              className="cart-pill"
              aria-label={`Carrito (${count})`}
              onClick={closeMenu}
            >
              🛒 <span>{count}</span>
            </Link>

            {/* Botón Hamburguesa (solo visible en mobile via CSS) */}
            <button
              className="navbar__menuBtn"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              title={open ? "Cerrar menú" : "Abrir menú"}
              type="button"
            >
              {open ? (
                // Ícono cerrar
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                  <path
                    d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                // Ícono hamburguesa
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                  <path
                    d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MENÚ MOBILE desplegable */}
      <div
        id="mobile-menu"
        className={`navbar__mobile ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú móvil"
      >
        <div className="navbar__mobile-panel">
          <nav className="navbar__mobile-nav">
            <NavLink to="/categorias" onClick={closeMenu}>
              Categorías
            </NavLink>
            <NavLink to="/talles" onClick={closeMenu}>
              Guía de talles
            </NavLink>
            <NavLink to="/algodon" onClick={closeMenu}>
              Algodón y sus cuidados
            </NavLink>
            <NavLink to="/faq" onClick={closeMenu}>
              Preguntas Frecuentes
            </NavLink>
            <NavLink to="/cuenta-dni" onClick={closeMenu}>
              CUENTA DNI
            </NavLink>

            {/* Acciones también en mobile */}
            <NavLink to="/mi-cuenta" onClick={closeMenu}>
              Mi cuenta
            </NavLink>
            <Link to="/cart" onClick={closeMenu}>
              Carrito {count > 0 ? `(${count})` : ""}
            </Link>
          </nav>
        </div>

        {/* Fondo clickeable para cerrar */}
        <button
          className="navbar__backdrop"
          aria-label="Cerrar menú"
          onClick={closeMenu}
          type="button"
        />
      </div>
    </>
  );
}
