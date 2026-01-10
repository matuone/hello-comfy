// src/components/Navbar.jsx
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import CategoriesMenu from "./CategoriesMenu";
import AccountPopup from "./AccountPopup";
import "../styles/navbar.css";
import logoBear from "../assets/logo.png";

export default function Navbar() {
  const { cart } =
    (typeof useShop === "function" ? useShop() : {}) ?? { cart: [] };
  const count = (cart || []).reduce((a, i) => a + (i.qty ?? 0), 0);
  const { pathname } = useLocation();

  // 🔥 Ahora usamos user e isAdmin
  const { user, isAdmin } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
  }

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "navbar--scrolled" : "navbar--top"}`}
        role="navigation"
        aria-label="Principal"
      >
        <div className="navbar__container">
          <div className="navbar__inner">
            {/* IZQUIERDA */}
            <div className="navbar__left">
              <Link to="/" className="navbar__bear" aria-label="Inicio">
                <img src={logoBear} alt="Logo osito" className="navbar__logo" />
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

            {/* CENTRO */}
            <div className="navbar__center" ref={menuRef}>
              <ul className="navlist">
                <li className="nav-item">
                  <NavLink
                    to="/"
                    className="nav-link"
                    aria-current={pathname === "/" ? "page" : undefined}
                  >
                    Home
                  </NavLink>
                </li>

                <li className="nav-item nav-item--products">
                  <NavLink
                    to="/products"
                    className="nav-link"
                    aria-current={pathname === "/products" ? "page" : undefined}
                  >
                    Productos
                  </NavLink>
                </li>

                <li className="mega-wrap">
                  <CategoriesMenu className={menuOpen ? "visible" : ""} />
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
                    to="/medios-de-pago"
                    className="nav-link"
                    aria-current={
                      pathname === "/medios-de-pago" ? "page" : undefined
                    }
                  >
                    Medios de pago
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* DERECHA */}
            <div className="navbar__right">

              {/* ⭐ BOTÓN ADMIN — SOLO SI ES ADMIN REAL */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="nav-action"
                  aria-label="Panel de control"
                >
                  <span className="nav-glyph" aria-hidden="true">
                    <svg
                      className="nav-icon__svg"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </span>
                  <span className="nav-label">Admin</span>
                </Link>
              )}

              {/* MI CUENTA */}
              <button
                type="button"
                className="nav-action"
                aria-label="Mi cuenta"
                onClick={() => setShowPopup(true)}
              >
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
              </button>

              {/* CARRITO */}
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

      {showPopup && <AccountPopup onClose={() => setShowPopup(false)} />}
    </>
  );
}
