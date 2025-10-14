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

  // Señales: progreso + esconder nudge + "auto-nudge" inicial
  useEffect(() => {
    const el = catbarRef.current;
    if (!el) return;

    // Actualiza la barra de progreso
    const updateProgress = () => {
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? Math.min(1, el.scrollLeft / max) : 0;
      el.style.setProperty("--catbar-progress", `${p * 100}%`);
      if (el.scrollLeft > 1) el.classList.add("has-scrolled");
      else el.classList.remove("has-scrolled");

      if (Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth) {
        el.classList.add("is-at-end");
      } else {
        el.classList.remove("is-at-end");
      }
    };

    el.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    // Auto-nudge (si hay movimiento permitido y hay overflow)
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced && el.scrollWidth > el.clientWidth) {
      const nudge = () => {
        const start = el.scrollLeft;
        el.scrollTo({ left: start + 24, behavior: "smooth" });
        // volver un poquito para que se note el gesto
        setTimeout(() => el.scrollTo({ left: start + 8, behavior: "smooth" }), 450);
        el.classList.add("has-scrolled"); // oculta el icono 👉
      };
      const t = setTimeout(nudge, 900);
      // Seguridad: quitar el icono 👉 a los 4s aunque no haya scroll
      const hide = setTimeout(() => el.classList.add("has-scrolled"), 4000);
      return () => { clearTimeout(t); clearTimeout(hide); el.removeEventListener("scroll", updateProgress); };
    }

    const hide = setTimeout(() => el.classList.add("has-scrolled"), 4000);
    return () => { clearTimeout(hide); el.removeEventListener("scroll", updateProgress); };
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

      {/* Barra de categorías con señales visibles */}
      <nav ref={catbarRef} className="catbar" aria-label="Navegación principal">
        {/* icono 👉 flotante (no bloquea clics) */}
        <span className="catbar__nudge" aria-hidden="true">👉</span>

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
