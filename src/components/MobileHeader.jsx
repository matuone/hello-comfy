import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "../styles/mobile-header.css";

export default function MobileHeader() {
  const { cart } = (typeof useShop === "function" ? useShop() : {}) ?? { cart: [] };
  const count = (cart || []).reduce((a, i) => a + (i.qty ?? 0), 0);

  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [offsetTop, setOffsetTop] = useState(0);
  const location = useLocation();

  const toggle = () => setOpen(v => !v);
  const close = () => setOpen(false);

  // Cerrar al navegar
  useEffect(() => { close(); }, [location.pathname]);

  // ESC + bloqueo scroll al abrir
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

  // Header transparente → sólido
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Colocar header debajo de la announcement bar
  useEffect(() => {
    const ab = document.querySelector(".announcement-bar");
    if (!ab) { setOffsetTop(0); return; }
    const setTop = () => setOffsetTop(ab.getBoundingClientRect().height || 0);
    setTop();
    const ro = new ResizeObserver(setTop);
    ro.observe(ab);
    window.addEventListener("resize", setTop, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener("resize", setTop); };
  }, []);

  return (
    <>
      {/* Header móvil */}
      <header className={`mheader ${solid ? "is-solid" : ""}`} style={{ top: offsetTop }}>
        <div className="mheader__side">
          <button className="mheader__iconbtn" aria-label="Abrir menú" onClick={toggle}>
            <span className="mh-icon is-menu" aria-hidden="true" />
          </button>
          <button className="mheader__iconbtn" aria-label="Buscar">
            <span className="mh-icon is-search" aria-hidden="true" />
          </button>
        </div>

        {/* Centro: texto + osito (link al home) */}
        <Link to="/" className="mheader__brandStack" aria-label="Inicio">
          <span className="mheader__brand">Hello Comfy</span>
          <span className="mheader__bear" aria-hidden="true">🐻</span>
        </Link>

        <div className="mheader__side mheader__side--right">
          <Link to="/mi-cuenta" className="mheader__iconbtn" aria-label="Mi cuenta">
            <span className="mh-icon is-user" aria-hidden="true" />
          </Link>
          <Link to="/cart" className="mheader__iconbtn" aria-label={`Carrito (${count})`}>
            <span className="mh-icon is-bag" aria-hidden="true" />
            {count > 0 && <span className="mh-badge">{count}</span>}
          </Link>
        </div>
      </header>

      {/* Overlay */}
      <button
        className={`mdrawer__overlay ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        onClick={close}
        type="button"
      />

      {/* Drawer DESDE LA IZQUIERDA */}
      <aside
        className={`mdrawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
      >
        {/* X fija arriba a la derecha */}
        <button className="mdrawer__close" aria-label="Cerrar menú" onClick={close} type="button">
          <span className="mh-icon is-close" aria-hidden="true" />
        </button>

        {/* Contenido del menú */}
        <nav className="mdrawer__list" aria-label="Navegación">
          <NavLink to="/categorias" className="mdrawer__item" onClick={close}>Categorías</NavLink>
          <NavLink to="/talles" className="mdrawer__item" onClick={close}>Guía de talles</NavLink>
          <NavLink to="/algodon" className="mdrawer__item" onClick={close}>Algodón y sus cuidados</NavLink>
          <NavLink to="/faq" className="mdrawer__item" onClick={close}>Preguntas Frecuentes</NavLink>
          <NavLink to="/cuenta-dni" className="mdrawer__item" onClick={close}>CUENTA DNI</NavLink>
          <NavLink to="/mi-cuenta" className="mdrawer__item" onClick={close}>Mi cuenta</NavLink>
        </nav>

        <div className="mdrawer__divider" />

        <div className="mdrawer__shortcuts">
          <Link to="/mi-cuenta" className="mshot" onClick={close}>
            <span className="mh-icon is-user" aria-hidden="true" />
            <small>Mi cuenta</small>
          </Link>
          <Link to="/faq" className="mshot" onClick={close}>
            <span className="mh-icon is-chat" aria-hidden="true" />
            <small>Dudas</small>
          </Link>
          <Link to="/locales" className="mshot" onClick={close}>
            <span className="mh-icon is-pin" aria-hidden="true" />
            <small>Locales</small>
          </Link>
        </div>

        <div className="mdrawer__divider" />

        <div className="mdrawer__socials">
          <a href="https://instagram.com/hellocomfy" target="_blank" rel="noreferrer" aria-label="Instagram" className="msocial">
            <span className="mh-icon is-ig" aria-hidden="true" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="msocial">
            <span className="mh-icon is-fb" aria-hidden="true" />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="msocial">
            <span className="mh-icon is-tk" aria-hidden="true" />
          </a>
        </div>
      </aside>
    </>
  );
}
