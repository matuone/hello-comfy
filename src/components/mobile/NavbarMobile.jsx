// NavbarMobile.jsx
// Versión mobile/tablet del Navbar


import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CategoriesMenuMobile from "./CategoriesMenuMobile";
import logoBear from "../../assets/logo.png";
import "../../styles/mobile/navbar.css";


export default function NavbarMobile() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const fetchResults = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/products?search=${encodeURIComponent(searchQuery)}`
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
