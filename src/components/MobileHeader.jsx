import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "../styles/mobile-header.css";

export default function MobileHeader() {
  const { cart } = (typeof useShop === "function" ? useShop() : {}) ?? { cart: [] };
  const count = (cart || []).reduce((a, i) => a + (i.qty ?? 0), 0);

  const [open, setOpen] = useState(false);       // drawer
  const [offsetTop, setOffsetTop] = useState(0); // altura announcement bar
  const [catsOpen, setCatsOpen] = useState(false);

  const location = useLocation();

  // refs para “click afuera”
  const drawerRef = useRef(null);
  const catsRef = useRef(null);
  const menuBtnRef = useRef(null);

  const toggle = () => setOpen(v => !v);
  const close = () => setOpen(false);

  // Cerrar al navegar
  useEffect(() => { setCatsOpen(false); close(); }, [location.pathname]);

  // Bloqueo scroll + ESC
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

  // Altura announcement bar
  useEffect(() => {
    const ab = document.querySelector(".announcement-bar");
    const setTop = () => setOffsetTop(ab ? ab.getBoundingClientRect().height || 0 : 0);
    setTop();
    const ro = ab ? new ResizeObserver(setTop) : null;
    if (ro && ab) ro.observe(ab);
    window.addEventListener("resize", setTop, { passive: true });
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", setTop); };
  }, []);

  // Click afuera → cierra drawer
  useEffect(() => {
    function handleOutsideDrawer(e) {
      if (!open) return;
      const drawer = drawerRef.current;
      const trigger = menuBtnRef.current;
      if (!drawer) return;
      if (!drawer.contains(e.target) && trigger && !trigger.contains(e.target)) {
        setOpen(false);
        setCatsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideDrawer);
    return () => document.removeEventListener("mousedown", handleOutsideDrawer);
  }, [open]);

  // Click afuera → cierra submenú categorías
  useEffect(() => {
    function handleOutsideCats(e) {
      if (!catsOpen) return;
      if (catsRef.current && !catsRef.current.contains(e.target)) setCatsOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideCats);
    return () => document.removeEventListener("mousedown", handleOutsideCats);
  }, [catsOpen]);

  const navAndClose = () => { setCatsOpen(false); close(); };

  // ======= MISMAS CATEGORÍAS QUE EN DESKTOP =======
  const COLS = [
    {
      title: ["REMERAS", "remeras"],
      items: [
        ["Estampadas", "estampadas"],
        ["Bordadas", "bordadas"],
        ["Crop tops", "crop-tops"],
        ["Aterciopeladas", "aterciopeladas"],
        ["XXL/3XL", "xxl-3xl"],
        ["Baby tees", "baby-tees"],
        ["Personalizado", "personalizado"],
      ],
    },
    {
      title: ["MERCH", "merch"],
      items: [
        ["Harry Styles", "harry-styles"],
        ["Taylor Swift", "taylor-swift"],
        ["Justin Bieber", "justin-bieber"],
        ["Green Day", "green-day"],
        ["Lana del Rey", "lana-del-rey"],
        ["Oasis", "oasis"],
        ["Arctic Monkeys", "arctic-monkeys"],
        ["Miley Cyrus", "miley-cyrus"],
        ["The Weeknd", "the-weeknd"],
        ["Phoebe Bridgers", "phoebe-bridgers"],
        ["Jonas Brothers", "jonas-brothers"],
        ["Olivia Rodrigo", "olivia-rodrigo"],
      ],
    },
    {
      title: ["TOTEBAGS", "totebags"],
      items: [
        ["OUTLET", "outlet"],
        ["Buzos", "buzos"],
        ["Medias", "medias"],
        ["SHORTS/PANTALONES", "shorts-pantalones"],
        ["Pijamas", "pijamas"],
        ["Personalizado", "personalizado"],
      ],
    },
  ];

  return (
    <>
      {/* Header móvil: transparente y fijo */}
      <header className="mheader" style={{ top: offsetTop }}>
        <div className="mheader__side">
          <button ref={menuBtnRef} className="mheader__iconbtn" aria-label="Abrir menú" onClick={toggle}>
            <span className="mh-icon is-menu" aria-hidden="true" />
          </button>
          <button className="mheader__iconbtn" aria-label="Buscar">
            <span className="mh-icon is-search" aria-hidden="true" />
          </button>
        </div>

        <Link to="/" className="mheader__brandStack" aria-label="Inicio">
          <span className="mheader__brand">Hello Comfy</span>
          {/* 🐻 igual que el de la announcement bar */}
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

      {/* Overlay visual del drawer */}
      <button
        className={`mdrawer__overlay ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        onClick={close}
        type="button"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`mdrawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
      >
        <button className="mdrawer__close" aria-label="Cerrar menú" onClick={close} type="button">
          <span className="mh-icon is-close" aria-hidden="true" />
        </button>

        <nav className="mdrawer__list" aria-label="Navegación">
          {/* ===== CATEGORÍAS ===== */}
          <div ref={catsRef} className={`mnav__item has-children ${catsOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="mnav__link mnav__toggle"
              aria-expanded={catsOpen ? "true" : "false"}
              onClick={() => setCatsOpen(v => !v)}
            >
              <span>Categorías</span>
              {catsOpen ? <span className="mnav__x" aria-hidden="true">×</span> : <span className="mnav__chev" aria-hidden="true">▾</span>}
            </button>

            {/* GRID con mismo contenido que el mega menú de desktop */}
            <div className="mnav__submenu">
              <div className="mnav__cols">
                {COLS.map(({ title, items }) => (
                  <div className="mnav__col" key={title[1]}>
                    <NavLink
                      to={`/categorias?cat=${encodeURIComponent(title[1])}`}
                      className="mnav__parent"
                      onClick={navAndClose}
                    >
                      {title[0]}
                    </NavLink>

                    {items.map(([label, slug]) => (
                      <NavLink
                        key={slug}
                        to={`/categorias?cat=${encodeURIComponent(slug)}`}
                        className="mnav__sublink"
                        onClick={navAndClose}
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Páginas informativas */}
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
