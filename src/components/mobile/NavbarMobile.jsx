// NavbarMobile.jsx
// Versión mobile/tablet del Navbar

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import CategoriesMenuMobile from "./CategoriesMenuMobile";
import logoBear from "../../assets/logo.png";
import "../../styles/mobile/navbar.css";

export default function NavbarMobile() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar-mobile" role="navigation" aria-label="Principal">
      <div className="navbar-mobile__container">
        <div className="navbar-mobile__top">
          <Link to="/" className="navbar-mobile__logo" aria-label="Inicio">
            <img src={logoBear} alt="Logo osito" height={36} />
          </Link>
          <button className="navbar-mobile__menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menú">
            <span className="navbar-mobile__menu-icon">☰</span>
          </button>
        </div>
        {menuOpen && (
          <div className="navbar-mobile-menu">
            <ul className="navbar-mobile__list">
              <li>
                <Link to="/" className={pathname === "/" ? "active" : ""} onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <button className="navbar-mobile__products-btn" onClick={() => setMenuOpen("productos")}>Productos</button>
                {menuOpen === "productos" && (
                  <CategoriesMenuMobile onClose={() => setMenuOpen(false)} />
                )}
              </li>
              <li>
                <Link to="/talles" onClick={() => setMenuOpen(false)}>
                  Talles
                </Link>
              </li>
              <li>
                <Link to="/algodon" onClick={() => setMenuOpen(false)}>
                  Algodón y sus cuidados
                </Link>
              </li>
              <li>
                <Link to="/faq" onClick={() => setMenuOpen(false)}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/medios-de-pago" onClick={() => setMenuOpen(false)}>
                  Medios de pago
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
