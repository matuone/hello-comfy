import "../styles/products.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [openDropdown, setOpenDropdown] = useState(null);

  const filtersRef = useRef(null);

  // ============================
  // CARGAR PRODUCTOS REALES
  // ============================
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  // ============================
  // CATEGORÍAS DINÁMICAS
  // ============================
  const CATEGORIES = {
    Indumentaria: ["Remeras", "Buzos", "Pijamas", "Shorts", "Totes", "Outlet"],
    "Cute Items": ["Vasos"],
    Merch: ["Artistas nacionales", "Artistas internacionales"],
  };

  // ============================
  // CERRAR DROPDOWN AL HACER CLICK FUERA
  // ============================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownToggle = (group) => {
    setOpenDropdown(openDropdown === group ? null : group);
  };

  // ============================
  // FILTRADO REAL
  // ============================
  const filteredProducts =
    selectedCategory === "Todos"
      ? productos
      : productos.filter((p) => p.subcategory === selectedCategory);

  // ============================
  // CONTADOR POR CATEGORÍA
  // ============================
  const countByCategory = {};
  productos.forEach((p) => {
    countByCategory[p.subcategory] = (countByCategory[p.subcategory] || 0) + 1;
  });

  return (
    <div className="products">
      <h1 className="products__title">Nuestros Productos</h1>
      <p className="products__subtitle">
        Todo lo que necesitás para una vida más comfy 🧸✨
      </p>

      {/* ============================
          FILTROS HORIZONTALES (sticky)
      ============================ */}
      <div ref={filtersRef} className="products__filters-horizontal sticky">
        {/* Botón "Todos" */}
        <div
          className={`products__dropdown ${openDropdown === "Todos" ? "open" : ""
            }`}
        >
          <button
            className="products__dropdown-toggle"
            onClick={() => {
              setSelectedCategory("Todos");
              setOpenDropdown(null);
            }}
          >
            Todos ({productos.length})
          </button>
        </div>

        {/* Dropdowns por grupo */}
        {Object.entries(CATEGORIES).map(([group, cats]) => (
          <div
            key={group}
            className={`products__dropdown ${openDropdown === group ? "open" : ""
              }`}
          >
            <button
              className="products__dropdown-toggle"
              onClick={() => handleDropdownToggle(group)}
            >
              {group}
            </button>

            {openDropdown === group && (
              <>
                <div className="products__backdrop" />

                <div className="products__dropdown-menu">
                  {cats.map((cat) => (
                    <button
                      key={cat}
                      className={`products__dropdown-item ${selectedCategory === cat ? "active" : ""
                        }`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setOpenDropdown(null);
                      }}
                    >
                      {cat} ({countByCategory[cat] || 0})
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ============================
          GRILLA DE PRODUCTOS
      ============================ */}
      <div className="products__grid">
        {filteredProducts.map((p) => (
          <div key={p._id} className="products__card">
            <div
              className="products__imgbox"
              onClick={() => navigate(`/products/${p._id}`)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={p.images?.[0] || "https://via.placeholder.com/300"}
                alt={p.name}
                className="products__img"
              />
            </div>

            <h3 className="products__name">{p.name}</h3>
            <p className="products__price">
              ${p.price?.toLocaleString("es-AR")}
            </p>

            <button
              className="products__btn"
              onClick={() => navigate(`/products/${p._id}`)}
            >
              Ver más
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
