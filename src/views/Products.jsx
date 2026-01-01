import "../styles/products.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]); // todos los productos (para contadores)
  const [productos, setProductos] = useState([]); // productos filtrados
  const [categories, setCategories] = useState({}); // { "Indumentaria": [{ value, label }, ...], ... }

  const [selectedGroup, setSelectedGroup] = useState("Todos"); // categoría
  const [selectedCategory, setSelectedCategory] = useState("Todos"); // subcategoría (value)
  const [openDropdown, setOpenDropdown] = useState(null);

  const filtersRef = useRef(null);

  // ============================
  // Helper: capitalizar para mostrar prolijo
  // ============================
  const formatLabel = (str) => {
    if (!str) return "";
    const clean = str.trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  };

  // ============================
  // CARGAR CATEGORÍAS + SUBCATEGORÍAS AGRUPADAS
  // ============================
  useEffect(() => {
    fetch("http://localhost:5000/api/products/filters/data")
      .then((res) => res.json())
      .then((data) => {
        const normalized = {};

        // data.groupedSubcategories = { "Indumentaria": ["remeras", "Remeras", "Buzos", ...], ... }
        Object.entries(data.groupedSubcategories).forEach(
          ([groupName, subs]) => {
            // usamos un mapa para evitar duplicados por mayúsculas/minúsculas
            const seen = new Map();

            subs.forEach((sub) => {
              if (!sub) return;
              const key = sub.trim().toLowerCase(); // clave normalizada
              if (!seen.has(key)) {
                seen.set(key, {
                  value: sub.trim(), // valor real que viaja al backend
                  label: formatLabel(sub), // cómo se muestra
                });
              }
            });

            normalized[groupName] = Array.from(seen.values());
          }
        );

        setCategories(normalized);
      })
      .catch((err) =>
        console.error("Error cargando categorías dinámicas:", err)
      );
  }, []);

  // ============================
  // CARGAR TODOS LOS PRODUCTOS UNA SOLA VEZ (para contadores)
  // ============================
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.error("Error cargando todos los productos:", err));
  }, []);

  // ============================
  // CARGAR PRODUCTOS SEGÚN FILTRO REAL
  // ============================
  useEffect(() => {
    let url = "http://localhost:5000/api/products";

    const params = [];

    if (selectedGroup !== "Todos") {
      params.push(`category=${encodeURIComponent(selectedGroup)}`);
    }

    if (selectedCategory !== "Todos") {
      params.push(`subcategory=${encodeURIComponent(selectedCategory)}`);
    }

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, [selectedGroup, selectedCategory]);

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
  // CONTADOR POR SUBCATEGORÍA (sobre TODOS los productos)
  // ============================
  const countByCategory = {};
  allProducts.forEach((p) => {
    if (!p.subcategory) return;
    const key = p.subcategory.trim();
    countByCategory[key] = (countByCategory[key] || 0) + 1;
  });

  const totalCount = allProducts.length;

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
              setSelectedGroup("Todos");
              setSelectedCategory("Todos");
              setOpenDropdown(null);
            }}
          >
            Todos ({totalCount})
          </button>
        </div>

        {/* Dropdowns dinámicos */}
        {Object.entries(categories).map(([group, cats]) => (
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
                  {cats.map(({ value, label }) => (
                    <button
                      key={value}
                      className={`products__dropdown-item ${selectedCategory === value ? "active" : ""
                        }`}
                      onClick={() => {
                        setSelectedGroup(group);
                        setSelectedCategory(value);
                        setOpenDropdown(null);
                      }}
                    >
                      {label} ({countByCategory[value] || 0})
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
        {productos.map((p) => (
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
