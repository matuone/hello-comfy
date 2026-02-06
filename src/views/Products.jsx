
import "../styles/products.css";
import "../styles/productgrid.css"; // CSS aislado
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "../components/OpinionsPopup";
import { useCart } from "../context/CartContext";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function Products() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categories, setCategories] = useState({});

  const [selectedGroup, setSelectedGroup] = useState("Todos");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("none");

  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showOpinions, setShowOpinions] = useState(false);
  const [opinionsProductId, setOpinionsProductId] = useState(null);

  const filtersRef = useRef(null);

  const formatLabel = (str) => {
    if (!str) return "";
    const clean = str.trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  };

  // ============================
  // CARGAR CATEGORÍAS
  // ============================
  useEffect(() => {
    fetch(apiPath("/products/filters/data"))
      .then((res) => res.json())
      .then((data) => {
        const normalized = {};
        Object.entries(data.groupedSubcategories).forEach(([groupName, subs]) => {
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
        });
        setCategories(normalized);
      })
      .catch((err) => console.error("Error cargando categorías dinámicas:", err));
  }, []);

  const filterOrder = ["Indumentaria", "Cute items", "Merch"];

  const orderedCategories = filterOrder
    .filter((key) => categories[key])
    .map((key) => [key, categories[key]]);

  // ============================
  // CARGAR TODOS LOS PRODUCTOS
  // ============================
  useEffect(() => {
    fetch(apiPath("/products"))
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.error("Error cargando todos los productos:", err));
  }, []);

  // ============================
  // CARGAR PRODUCTOS SEGÚN FILTRO
  // ============================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (page === 1) setInitialLoading(true);

        let url = apiPath("/products");
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
  // CERRAR DROPDOWN
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

  const getAvailableSizes = (product) => {
    if (!product?.stockColorId?.talles) return [];
    return Object.entries(product.stockColorId.talles).filter(([, qty]) => qty > 0);
  };

  const getSelectedSize = (product) => {
    const availableSizes = getAvailableSizes(product);
    return selectedSizes[product._id] || availableSizes[0]?.[0] || null;
  };

  const getMaxStockForSize = (product, size) => {
    if (!product?.stockColorId?.talles || !size) return Infinity;
    const qty = product.stockColorId.talles[size];
    return typeof qty === "number" ? qty : Infinity;
  };

  const handleSelectSize = (product, size) => {
    setSelectedSizes((prev) => ({ ...prev, [product._id]: size }));
    const maxStock = getMaxStockForSize(product, size);
    if (Number.isFinite(maxStock)) {
      setQuantities((prev) => {
        const current = prev[product._id] || 1;
        const next = Math.max(1, Math.min(current, maxStock));
        return { ...prev, [product._id]: next };
      });
    }
  };

  const handleQuantityChange = (product, value) => {
    const parsed = parseInt(value, 10);
    const safeQty = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
    const maxStock = getMaxStockForSize(product, getSelectedSize(product));
    const nextQty = Number.isFinite(maxStock) ? Math.min(safeQty, maxStock) : safeQty;
    setQuantities((prev) => ({ ...prev, [product._id]: nextQty }));
  };

  const adjustQuantity = (product, delta) => {
    setQuantities((prev) => {
      const current = prev[product._id] || 1;
      const maxStock = getMaxStockForSize(product, getSelectedSize(product));
      const nextRaw = Math.max(1, current + delta);
      const next = Number.isFinite(maxStock) ? Math.min(nextRaw, maxStock) : nextRaw;
      return { ...prev, [product._id]: next };
    });
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();

    const availableSizes = getAvailableSizes(product);
    const fallbackSize = availableSizes[0]?.[0] || null;
    const chosenSize = selectedSizes[product._id] || fallbackSize;
    const maxStock = getMaxStockForSize(product, chosenSize);
    const baseQty = quantities[product._id] || 1;
    const quantity = Number.isFinite(maxStock) ? Math.min(baseQty, maxStock) : baseQty;

    addToCart(product, { size: chosenSize, color: product.stockColorId?.color, quantity });
  };

  const handleBuyNow = (event, product) => {
    handleAddToCart(event, product);
    navigate("/checkout");
  };

  return (
    <div className="products">
      <h1 className="products__title">Nuestros Productos</h1>
      <p className="products__subtitle">
        Todo lo que necesitás para una vida más comfy 🧸✨
      </p>

      {/* ============================
          FILTROS
      ============================ */}
      <div ref={filtersRef} className="products__filters-horizontal">
        <div className="products__filters-row">
          <div
            className={`products__dropdown ${openDropdown === "Todos" ? "open" : ""}`}
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

          {orderedCategories.map(([group, cats]) => (
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
          SKELETON
      ============================ */}
      {initialLoading && (
        <div className="products__grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="productcard__item skeleton-card">
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
            <div
              key={p._id}
              className="productcard__item"
              onClick={() => navigate(`/products/${p._id}`)}
            >
              <img
                src={p.images?.[0] || "https://via.placeholder.com/300"}
                alt={p.name}
                className="productcard__image"
              />

              {/* BADGE DESTACADO */}
              {p.featured && (
                <span className="productcard__badge">Destacado</span>
              )}

              {/* BLOQUE SUPERIOR FIJO */}
              <div className="productcard__top">

                {/* ⭐ STOCK REAL */}
                {p.stockColorId?.talles && (
                  <div className="productcard__stock">
                    {Object.entries(p.stockColorId.talles).every(
                      ([t, qty]) => qty === 0
                    ) ? (
                      <span className="productcard__nostock">Sin stock</span>
                    ) : Object.values(p.stockColorId.talles).some(
                      (qty) => qty > 0 && qty <= 3
                    ) ? (
                      <span className="productcard__lowstock">
                        ¡Pocas unidades!
                      </span>
                    ) : (
                      <span className="productcard__instock">
                        Stock disponible
                      </span>
                    )}
                  </div>
                )}

                <h3 className="productcard__name">{p.name}</h3>

                <p className="productcard__price">
                  ${p.price?.toLocaleString("es-AR")}
                </p>

                {/* ⭐ DESCRIPCIÓN CORTA */}
                <p className="productcard__desc">
                  {p.cardDescription || p.description || "Producto destacado"}
                </p>

                {/* ⭐ TALLES DISPONIBLES */}
                {p.stockColorId?.talles && (
                  <div
                    className="productcard__sizes productcard__sizes--selectable"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      const availableSizes = getAvailableSizes(p);
                      const selected = selectedSizes[p._id] || availableSizes[0]?.[0];

                      return availableSizes.map(([t]) => (
                        <button
                          key={t}
                          type="button"
                          className={`productcard__size-pill productcard__size-pill--button ${selected === t ? "is-selected" : ""}`}
                          onClick={() => handleSelectSize(p, t)}
                        >
                          {t}
                        </button>
                      ));
                    })()}
                  </div>
                )}

                <div
                  className="productcard__qty"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="productcard__qty-label">Cant.</span>
                  <button
                    type="button"
                    className="productcard__qty-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      adjustQuantity(p, -1);
                    }}
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={(() => {
                      const maxStock = getMaxStockForSize(p, getSelectedSize(p));
                      return Number.isFinite(maxStock) ? maxStock : undefined;
                    })()}
                    value={quantities[p._id] || 1}
                    onChange={(e) => handleQuantityChange(p, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="productcard__qty-input"
                    aria-label="Cantidad"
                  />
                  <button
                    type="button"
                    className="productcard__qty-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      adjustQuantity(p, 1);
                    }}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
                {(() => {
                  const maxStock = getMaxStockForSize(p, getSelectedSize(p));
                  const currentQty = quantities[p._id] || 1;
                  if (!Number.isFinite(maxStock)) return null;
                  if (currentQty < maxStock) return null;
                  return (
                    <p className="productcard__qty-note">
                      Maximo {maxStock} unidades disponibles
                    </p>
                  );
                })()}
              </div>

              {/* ESTRELLAS ALINEADAS */}
              <div
                className="productcard__stars"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpinionsProductId(p._id);
                  setShowOpinions(true);
                }}
              >
                {"★".repeat(5)}
              </div>

              <div
                className="productcard__buttons"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="productcard__btn-buy"
                  onClick={(e) => handleBuyNow(e, p)}
                >
                  Comprar
                </button>
                <button
                  className="productcard__btn-cart"
                  onClick={(e) => handleAddToCart(e, p)}
                >
                  Agregar al carrito
                </button>
              </div>

              <button
                className="productcard__btn-viewmore"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${p._id}`);
                }}
              >
                Ver más
              </button>
            </div>
          ))}

          {/* PAGINACIÓN VISUAL */}
          {hasMore && !loading && (
            <button
              className="productcard__loadmore"
              onClick={() => setPage((prev) => prev + 1)}
            >
              Cargar más productos
            </button>
          )}

          {loading &&
            !initialLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`loader-${i}`}
                className="productcard__item skeleton-card"
              >
                <div className="skeleton-img"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            ))}
        </div>
      )}

      {showOpinions && opinionsProductId && (
        <OpinionsPopup productId={opinionsProductId} onClose={() => { setShowOpinions(false); setOpinionsProductId(null); }} />
      )}
    </div>
  );
}
