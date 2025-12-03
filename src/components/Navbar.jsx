// src/components/Navbar.jsx
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useShop } from "../context/ShopContext";
import CategoriesMenu from "./CategoriesMenu";
import "../styles/navbar.css";

export default function Navbar() {
  const { cart } =
    (typeof useShop === "function" ? useShop() : {}) ?? { cart: [] };
  const count = (cart || []).reduce((a, i) => a + (i.qty ?? 0), 0);
  const { pathname } = useLocation();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <nav
      className={`navbar ${scrolled ? "navbar--scrolled" : "navbar--top"}`}
      role="navigation"
      aria-label="Principal"
    >
      <div className="navbar__container">
        <div className="navbar__inner">
          {/* IZQUIERDA — osito + buscador */}
          <div className="navbar__left">
            <Link to="/" className="navbar__bear" aria-label="Inicio">
              🐻
            </Link>

            <form className="navbar__search" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="navbar__search-input"
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
              />
            </form>
          </div>

          {/* CENTRO — menú */}
          <div className="navbar__center">
            <ul className="navlist">
              <li className="nav-item nav-item--categories">
                <button
                  type="button"
                  className="nav-link nav-link--btn"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Categorías
                </button>
                <CategoriesMenu />
              </li>

              <li className="nav-item">
                <NavLink
                  to="/talles"
                  className="nav-link"
                  aria-current={pathname === "/talles" ? "page" : undefined}
                >
                  Talles
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/algodon"
                  className="nav-link"
                  aria-current={pathname === "/algodon" ? "page" : undefined}
                >
                  Algodón y sus cuidados
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/faq"
                  className="nav-link"
                  aria-current={pathname === "/faq" ? "page" : undefined}
                >
                  FAQ
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/cuenta-dni"
                  className="nav-link"
                  aria-current={
                    pathname === "/cuenta-dni" ? "page" : undefined
                  }
                >
                  CUENTA DNI
                </NavLink>
              </li>
            </ul>
          </div>

          {/* DERECHA — Mi cuenta + Carrito */}
          <div className="navbar__right">
            <Link to="/mi-cuenta" className="nav-action" aria-label="Mi cuenta">
              <span className="nav-glyph" aria-hidden="true">
                <svg
                  className="nav-icon__svg"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </span>
              <span className="nav-label">Mi cuenta</span>
            </Link>

            <Link
              to="/cart"
              className="nav-action nav-action--last"
              aria-label="Carrito"
            >
              <span className="nav-glyph" aria-hidden="true">
                <svg
                  className="nav-icon__svg"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 7h12l-1 12H7L6 7Z" />
                  <path d="M9 7a3 3 0 0 1 6 0" />
                </svg>
                {count > 0 && <span className="badge">{count}</span>}
              </span>
              <span className="nav-label">Carrito</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
