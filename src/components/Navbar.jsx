// src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { cart } =
    (typeof useShop === "function" ? useShop() : {}) ?? { cart: [] };
  const count = (cart || []).reduce((a, i) => a + (i.qty ?? 0), 0);

  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);
  const location = useLocation();

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  // Cerrar al navegar
  useEffect(() => {
    close();
  }, [location.pathname]);

  // ESC para cerrar + bloqueo de scroll del body
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkActive = ({ isActive }) =>
    "navbar__link" + (isActive ? " is-active" : "");

  return (
    <header className="navbar">
      {/* Barra superior */}
      <div className="navbar__top">
        <button
          className="iconbtn"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-controls="drawer"
          aria-expanded={open}
          onClick={toggle}
          type="button"
        >
          {open ? (
            <span className="icon close" aria-hidden="true" />
          ) : (
            <span className="icon menu" aria-hidden="true" />
          )}
        </button>

        {/* Marca centrada: 🐻 Hello Comfy */}
        <Link to="/" className="navbar__brand" title="Hello Comfy">
          <span className="brand-bear" aria-hidden="true">🐻</span>
          <span className="brand-text">Hello Comfy</span>
        </Link>

        <Link
          to="/cart"
          className="iconbtn cartbtn"
          aria-label={`Carrito (${count})`}
          title="Carrito"
        >
          <span className="icon cart" aria-hidden="true" />
          {count > 0 && <span className="cart__badge">{count}</span>}
        </Link>
      </div>

      {/* NAV DESKTOP */}
      <nav className="navbar__desk" aria-label="Navegación principal">
        <NavLink to="/categorias" className={linkActive}>
          Categorías
        </NavLink>
        <NavLink to="/talles" className={linkActive}>
          Guía de talles
        </NavLink>
        <NavLink to="/algodon" className={linkActive}>
          Algodón y sus cuidados
        </NavLink>
        <NavLink to="/faq" className={linkActive}>
          Preguntas Frecuentes
        </NavLink>
        <NavLink to="/cuenta-dni" className={linkActive}>
          CUENTA DNI
        </NavLink>
        <NavLink to="/mi-cuenta" className={linkActive}>
          Mi cuenta
        </NavLink>
      </nav>

      {/* OVERLAY */}
      <button
        type="button"
        className={`drawer__overlay ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        onClick={close}
        tabIndex={open ? 0 : -1}
      />

      {/* DRAWER */}
      <aside
        id="drawer"
        ref={drawerRef}
        className={`drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
      >
        <div className="drawer__head">
          <span>Menú</span>
          <button
            className="iconbtn"
            aria-label="Cerrar menú"
            onClick={close}
            type="button"
          >
            <span className="icon close" aria-hidden="true" />
          </button>
        </div>

        <nav className="drawer__list" aria-label="Categorías">
          <NavLink to="/categorias" className="drawer__item">Categorías</NavLink>
          <NavLink to="/talles" className="drawer__item">Guía de talles</NavLink>
          <NavLink to="/algodon" className="drawer__item">Algodón y sus cuidados</NavLink>
          <NavLink to="/faq" className="drawer__item">Preguntas Frecuentes</NavLink>
          <NavLink to="/cuenta-dni" className="drawer__item">CUENTA DNI</NavLink>
          <NavLink to="/mi-cuenta" className="drawer__item">Mi cuenta</NavLink>
        </nav>

        <div className="drawer__divider" />

        {/* Atajos */}
        <div className="drawer__shortcuts" aria-label="Atajos">
          <Link to="/mi-cuenta" className="shortcut">
            <span className="icon user" aria-hidden="true" />
            <small>Mi cuenta</small>
          </Link>
          <Link to="/faq" className="shortcut">
            <span className="icon chat" aria-hidden="true" />
            <small>Dudas</small>
          </Link>
          <Link to="/pickup-points" className="shortcut" aria-label="Pickup points">
            <span className="icon pin" aria-hidden="true" />
            <small>Pickup points</small>
          </Link>
        </div>

        <div className="drawer__divider" />

        {/* Redes */}
        <div className="drawer__socials" aria-label="Redes sociales">
          <a href="https://instagram.com/hellocomfy" target="_blank" rel="noreferrer" aria-label="Instagram" className="social">
            <span className="icon ig" aria-hidden="true" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social">
            <span className="icon fb" aria-hidden="true" />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="social">
            <span className="icon tk" aria-hidden="true" />
          </a>
        </div>
      </aside>
    </header>
  );
}
