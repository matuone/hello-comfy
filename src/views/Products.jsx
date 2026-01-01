import "../styles/products.css";
import "../styles/bestsellers.css"; // reutilizamos la estética de la tarjeta
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "../components/OpinionsPopup"; // ajustá la ruta si es distinta

export default function Products() {
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categories, setCategories] = useState({});

  const [selectedGroup, setSelectedGroup] = useState("Todos");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("none");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showOpinions, setShowOpinions] = useState(false);

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

        Object.entries(data.groupedSubcategories).forEach(
          ([groupName, subs]) => {
            const seen = new Map();

            subs.forEach((sub) => {
              if (!sub) return;
              const key = sub.trim().toLowerCase();
              if (!seen.has(key)) {
                seen.set(key, {
                  value: sub.trim(),
                  label: formatLabel(sub),
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
  // CARGAR TODOS LOS PRODUCTOS (para contadores)
  // ============================
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.error("Error cargando todos los productos:", err));
  }, []);

  // ============================
  // CARGAR PRODUCTOS SEGÚN FILTRO + ORDEN + PÁGINA
  // ============================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (page === 1) setInitialLoading(true);

        let url = "http://localhost:5000/api/products";
        const params = [];

        if (selectedGroup !== "Todos") {
          params.push(`category=${encodeURIComponent(selectedGroup)}`);
        }

        if (selectedCategory !== "Todos") {
          params.push(`subcategory=${encodeURIComponent(selectedCategory)}`);
        }

        if (sortBy !== "none") {
          params.push(`sort=${encodeURIComponent(sortBy)}`);
        }

        params.push(`page=${page}`);
        params.push(`limit=12`);

        if (params.length > 0) {
          url += "?" + params.join("&");
        }

        const res = await fetch(url);
        const data = await res.json();

        if (page === 1) {
          setProductos(data.products || []);
        } else {
          setProductos((prev) => [...prev, ...(data.products || [])]);
        }

        setHasMore(data.hasMore ?? false);
      } catch (err) {
        console.error("Error cargando productos:", err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchProducts();
  }, [selectedGroup, selectedCategory, sortBy, page]);

  // ============================
  // RESET PAGE CUANDO CAMBIA FILTRO U ORDEN
  // ============================
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [selectedGroup, selectedCategory, sortBy]);

  // ============================
  // INFINITE SCROLL
  // ============================
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400 &&
        hasMore &&
        !loading
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

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
  // CONTADOR POR SUBCATEGORÍA
  // ============================
  const countByCategory = {};
  allProducts.forEach((p) => {
    if (!p.subcategory) return;
    const key = p.subcategory.trim();
    countByCategory[key] = (countByCategory[key] || 0) + 1;
  });

  const totalCount = allProducts.length;

  const getSortLabel = () => {
    if (sortBy === "none") return "Destacados";
    if (sortBy === "price_asc") return "Precio más bajo";
    if (sortBy === "price_desc") return "Precio más alto";
    if (sortBy === "sold_desc") return "Más vendidos";
    return "Destacados";
  };

  return (
    <div className="products">
      <h1 className="products__title">Nuestros Productos</h1>
      <p className="products__subtitle">
        Todo lo que necesitás para una vida más comfy 🧸✨
      </p>

      {/* ============================
          FILTROS + ORDEN (centrado)
      ============================ */}
      <div ref={filtersRef} className="products__filters-horizontal sticky">
        <div className="products__filters-row">
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

          {/* Ordenar por — mismo estilo que los otros */}
          <div
            className={`products__dropdown ${openDropdown === "Ordenar" ? "open" : ""
              }`}
          >
            <button
              className="products__dropdown-toggle"
              onClick={() =>
                setOpenDropdown(openDropdown === "Ordenar" ? null : "Ordenar")
              }
            >
              Ordenar por: {getSortLabel()}
            </button>

            {openDropdown === "Ordenar" && (
              <>
                <div className="products__backdrop" />
                <div className="products__dropdown-menu">
                  <button
                    className={`products__dropdown-item ${sortBy === "none" ? "active" : ""
                      }`}
                    onClick={() => {
                      setSortBy("none");
                      setOpenDropdown(null);
                    }}
                  >
                    Destacados
                  </button>
                  <button
                    className={`products__dropdown-item ${sortBy === "price_asc" ? "active" : ""
                      }`}
                    onClick={() => {
                      setSortBy("price_asc");
                      setOpenDropdown(null);
                    }}
                  >
                    Precio más bajo
                  </button>
                  <button
                    className={`products__dropdown-item ${sortBy === "price_desc" ? "active" : ""
                      }`}
                    onClick={() => {
                      setSortBy("price_desc");
                      setOpenDropdown(null);
                    }}
                  >
                    Precio más alto
                  </button>
                  <button
                    className={`products__dropdown-item ${sortBy === "sold_desc" ? "active" : ""
                      }`}
                    onClick={() => {
                      setSortBy("sold_desc");
                      setOpenDropdown(null);
                    }}
                  >
                    Más vendidos
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================
          SKELETON LOADERS (carga inicial)
      ============================ */}
      {initialLoading && (
        <div className="products__grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bestsellers__item skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      )}

      {/* ============================
          GRILLA DE PRODUCTOS
      ============================ */}
      {!initialLoading && (
        <div className="products__grid">
          {productos.map((p) => (
            <div key={p._id} className="bestsellers__item">
              <img
                src={p.images?.[0] || "https://via.placeholder.com/300"}
                alt={p.name}
                className="bestsellers__image"
                onClick={() => navigate(`/products/${p._id}`)}
              />

              <h3
                className="bestsellers__name"
                onClick={() => navigate(`/products/${p._id}`)}
              >
                {p.name}
              </h3>

              <p className="bestsellers__price">
                ${p.price?.toLocaleString("es-AR")}
              </p>

              <p className="bestsellers__desc">
                {p.description?.slice(0, 80) || "Producto destacado"}
              </p>

              <div
                className="bestsellers__stars"
                onClick={() => setShowOpinions(true)}
              >
                {"★".repeat(5)}
              </div>

              <div className="bestsellers__buttons">
                <button className="bestsellers__btn-buy">Comprar</button>
                <button className="bestsellers__btn-cart">
                  Agregar al carrito
                </button>
              </div>

              <button
                className="bestsellers__btn-viewmore"
                onClick={() => navigate(`/products/${p._id}`)}
              >
                Ver más
              </button>
            </div>
          ))}

          {/* Skeleton al cargar más (infinite scroll) */}
          {loading &&
            !initialLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`loader-${i}`} className="bestsellers__item skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            ))}
        </div>
      )}

      {showOpinions && <OpinionsPopup onClose={() => setShowOpinions(false)} />}
    </div>
  );
}
