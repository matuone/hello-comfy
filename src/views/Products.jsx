import "../styles/products.css";
import { useState, useRef, useEffect } from "react";
import testImage from "../assets/productos/imagen-test.png";

// 🔥 Categorías reales según tu imagen
const CATEGORIES = {
  Indumentaria: ["Remeras", "Buzos", "Pijamas", "Shorts", "Totes", "Outlet"],
  "Cute Items": ["Vasos"],
  Merch: ["Artistas Nacionales", "Artistas Internacionales"],
};

// 🔧 Productos simulados con categoría
const products = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: `Producto ${i + 1}`,
  price: `$${(8000 + i * 500).toLocaleString("es-AR")}`,
  img: testImage,
  category:
    i < 6
      ? "Remeras"
      : i < 9
        ? "Buzos"
        : i < 12
          ? "Vasos"
          : i < 15
            ? "Artistas Nacionales"
            : "Outlet",
}));

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [openDropdown, setOpenDropdown] = useState(null);

  const filtersRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
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

  const filteredProducts =
    selectedCategory === "Todos"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Contador por categoría
  const countByCategory = {};
  products.forEach((p) => {
    countByCategory[p.category] = (countByCategory[p.category] || 0) + 1;
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
        <div className={`products__dropdown ${openDropdown === "Todos" ? "open" : ""}`}>
          <button
            className="products__dropdown-toggle"
            onClick={() => {
              setSelectedCategory("Todos");
              setOpenDropdown(null);
            }}
          >
            Todos ({products.length})
          </button>
        </div>

        {/* Dropdowns por grupo */}
        {Object.entries(CATEGORIES).map(([group, cats]) => (
          <div
            key={group}
            className={`products__dropdown ${openDropdown === group ? "open" : ""}`}
          >
            <button
              className="products__dropdown-toggle"
              onClick={() => handleDropdownToggle(group)}
            >
              {group}
            </button>

            {openDropdown === group && (
              <>
                {/* Fondo blur pastel */}
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
          <div key={p.id} className="products__card">
            <div className="products__imgbox">
              <img src={p.img} alt={p.name} className="products__img" />
            </div>

            <h3 className="products__name">{p.name}</h3>
            <p className="products__price">{p.price}</p>

            <button className="products__btn">Ver más</button>
          </div>
        ))}
      </div>
    </div>
  );
}
