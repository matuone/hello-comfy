// NavbarMobile.jsx
// Versión mobile/tablet del Navbar



import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CategoriesMenuMobile from "./CategoriesMenuMobile";
import logoBear from "../../assets/logo.png";
import "../../styles/mobile/navbar.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}


export default function NavbarMobile() {
  // Para doble click en Productos
  const [productsClickCount, setProductsClickCount] = useState(0);
  const productsClickTimeout = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `${apiPath('/products')}?search=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data.slice(0, 6) : []);
        setShowResults(true);
      } catch (err) {
        setSearchResults([]);
      }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      // Si el click fue en el botón de menú, no cerrar
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        (!menuBtnRef.current || !menuBtnRef.current.contains(e.target))
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchQuery("");
    }
  }

  function handleProductClick(productId) {
    navigate(`/products/${productId}`);
    setShowResults(false);
    setSearchQuery("");
  }

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (productsClickTimeout.current) clearTimeout(productsClickTimeout.current);
    };
  }, []);

  return (
    <nav className="navbar-mobile" role="navigation" aria-label="Principal">
      <div className="navbar-mobile__container">
        <div className="navbar-mobile__top">
          <Link to="/" className="navbar-mobile__logo" aria-label="Inicio">
            <img src={logoBear} alt="Logo osito" height={36} />
          </Link>
          <form className="navbar-mobile__search" onSubmit={handleSearchSubmit} ref={searchRef}>
            <input
              type="text"
              className="navbar-mobile__search-input"
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {showResults && searchResults.length > 0 && (
              <div className="navbar-mobile__search-results">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="navbar-mobile__search-item"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/60"}
                      alt={product.name}
                      className="navbar-mobile__search-thumb"
                    />
                    <div className="navbar-mobile__search-info">
                      <p className="navbar-mobile__search-name">{product.name}</p>
                      <p className="navbar-mobile__search-price">
                        ${product.price?.toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
          <button
            ref={menuBtnRef}
            className="navbar-mobile__menu-btn"
            onClick={() => {
              setMenuOpen((v) => (v ? false : true));
            }}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={!!menuOpen}
          >
            <span className="navbar-mobile__menu-icon">☰</span>
          </button>
          <Link to="/mi-cuenta" className="navbar-mobile__icon-btn" aria-label="Mi cuenta">
            <span className="navbar-mobile__icon-user">
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#e57373" strokeWidth="1.7" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#e57373" strokeWidth="1.7" /></svg>
            </span>
          </Link>
          <Link to="/cart" className="navbar-mobile__icon-btn" aria-label="Carrito">
            <span className="navbar-mobile__icon-cart">
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M6 7h12l-1 12H7L6 7Z" stroke="#e57373" strokeWidth="1.7" /><path d="M9 7a3 3 0 0 1 6 0" stroke="#e57373" strokeWidth="1.7" /></svg>
              {count > 0 && <span className="navbar-mobile__cart-badge">{count}</span>}
            </span>
          </Link>
        </div>
        {menuOpen && (
          <div className="navbar-mobile-menu" ref={menuRef}>
            <ul className="navbar-mobile__list">
              <li>
                <Link to="/" className={pathname === "/" ? "active" : ""} onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <button
                  className="navbar-mobile__products-btn"
                  onClick={() => {
                    if (menuOpen === "productos") {
                      // Segundo click: navegar y cerrar menú
                      setMenuOpen(false);
                      setProductsClickCount(0);
                      navigate("/products");
                      return;
                    }
                    // Primer click: mostrar submenú
                    setMenuOpen("productos");
                    setProductsClickCount(1);
                    if (productsClickTimeout.current) clearTimeout(productsClickTimeout.current);
                    productsClickTimeout.current = setTimeout(() => {
                      setProductsClickCount(0);
                    }, 700);
                  }}
                >
                  Productos
                </button>
                {menuOpen === "productos" && (
                  <CategoriesMenuMobile onClose={() => setMenuOpen(true)} />
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
