// src/views/Category.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useDiscountRules, calcularPrecios } from "../hooks/useDiscountRules";
import "../styles/productgrid.css";
import "../styles/products.css";
import "../styles/category.css";
import "../styles/category-filters.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function Category() {
  const { subcategory } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState("newest");
  const [openSort, setOpenSort] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});

  // Reglas de descuento del admin
  const discountRules = useDiscountRules();

  // REF para detectar click fuera
  const sortRef = useRef(null);

  const formatTitle = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");

  const getSortLabel = (s) => {
    if (s === "newest") return "Nuevo";
    if (s === "price_desc") return "Mayor precio";
    if (s === "price_asc") return "Menor precio";
    if (s === "sold_desc") return "Más vendido";
    return "Nuevo";
  };

  const getAvailableSizes = (product) => {
    if (!product?.stockColorId?.talles) return [];
    return Object.entries(product.stockColorId.talles);
  };

  const handleSelectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuantityChange = (productId, value) => {
    const parsed = parseInt(value, 10);
    const safeQty = Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
    setQuantities((prev) => ({ ...prev, [productId]: safeQty }));
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();

    const availableSizes = getAvailableSizes(product);
    const fallbackSize = availableSizes[0]?.[0] || null;
    const chosenSize = selectedSizes[product._id] || fallbackSize;
    const quantity = quantities[product._id] || 1;

    addToCart(product, { size: chosenSize, color: product.stockColorId?.color, quantity });
  };

  const handleBuyNow = (event, product) => {
    handleAddToCart(event, product);
    navigate("/checkout");
  };

  useEffect(() => {
    if (!subcategory) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const encodedSubcategory = encodeURIComponent(subcategory);

    fetch(apiPath(`/products/subcategory/${encodedSubcategory}`))
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setLoading(false);
      });
  }, [subcategory]);

  // ⭐ CLICK FUERA DEL DROPDOWN
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setOpenSort(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "sold_desc") return (b.sold || 0) - (a.sold || 0);
    return 0;
  });

  return (
    <section className="category-view">
      <h1 className="category-title">{formatTitle(subcategory)}</h1>

      {/* FILTRO */}
      {!loading && products.length > 0 && (
        <div className="category-filters">
          <div className="products__dropdown" ref={sortRef}>
            <button
              className={`products__dropdown-toggle ${openSort ? "open" : ""
                }`}
              onClick={() => setOpenSort(!openSort)}
            >
              Ordenar por: {getSortLabel(sort)}
            </button>

            {openSort && (
              <>
                <div
                  className="products__backdrop"
                  onClick={() => setOpenSort(false)}
                />

                <div className="products__dropdown-menu">
                  <button
                    className={`products__dropdown-item ${sort === "newest" ? "active" : ""
                      }`}
                    onClick={() => {
                      setSort("newest");
                      setOpenSort(false);
                    }}
                  >
                    Nuevo
                  </button>

                  <button
                    className={`products__dropdown-item ${sort === "price_desc" ? "active" : ""
                      }`}
                    onClick={() => {
                      setSort("price_desc");
                      setOpenSort(false);
                    }}
                  >
                    Mayor precio
                  </button>

                  <button
                    className={`products__dropdown-item ${sort === "price_asc" ? "active" : ""
                      }`}
                    onClick={() => {
                      setSort("price_asc");
                      setOpenSort(false);
                    }}
                  >
                    Menor precio
                  </button>

                  <button
                    className={`products__dropdown-item ${sort === "sold_desc" ? "active" : ""
                      }`}
                    onClick={() => {
                      setSort("sold_desc");
                      setOpenSort(false);
                    }}
                  >
                    Más vendido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && <p className="category-loading">Cargando productos...</p>}

      {/* GRID */}
      {!loading && (
        <div className="products__grid">
          {sortedProducts.map((p) => (
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

              {p.featured && (
                <span className="productcard__badge">Destacado</span>
              )}

              <div className="productcard__top">
                <div className="productcard__stock">
                  {p.stockColorId?.talles && (
                    Object.entries(p.stockColorId.talles).every(
                      ([, qty]) => qty === 0
                    ) ? (
                      <span className="productcard__nostock">Sin stock</span>
                    ) : Object.values(p.stockColorId.talles).some(
                      (qty) => qty > 0 && qty <= 3
                    ) ? (
                      <span className="productcard__lowstock">
                        ¡Pocas unidades!
                      </span>
                    ) : (
                      <span className="productcard__instock">Stock disponible</span>
                    )
                  )}
                </div>

                <h3 className="productcard__name">{p.name}</h3>

                {/* Sección de precios con descuento */}
                {(() => {
                  const { precioOriginal, descuento, precioFinal, precioTransferencia, precioCuota } = calcularPrecios(p, discountRules);
                  return (
                    <div className="productcard__pricing">
                      {descuento > 0 ? (
                        <>
                          <div className="productcard__price-original">
                            ${precioOriginal?.toLocaleString("es-AR")}
                          </div>
                          <div className="productcard__price-discounted">
                            ${precioFinal?.toLocaleString("es-AR")}
                            <span className="productcard__discount-badge">{descuento}% OFF</span>
                          </div>
                        </>
                      ) : (
                        <div className="productcard__price">
                          ${precioOriginal?.toLocaleString("es-AR")}
                        </div>
                      )}
                      <div className="productcard__payment-options">
                        <div className="payment-option payment-option--transfer">
                          <span className="payment-option__label">Transferencia</span>
                          <span className="payment-option__price">
                            ${precioTransferencia?.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <div className="payment-option payment-option--installment">
                          <span className="payment-option__label">3 cuotas sin interés</span>
                          <span className="payment-option__price">
                            ${precioCuota?.toLocaleString("es-AR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {p.stockColorId?.talles && (
                  <div
                    className="productcard__sizes productcard__sizes--selectable"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      const allSizes = getAvailableSizes(p);
                      const inStockSizes = allSizes.filter(([, qty]) => qty > 0);
                      const selected = selectedSizes[p._id] || inStockSizes[0]?.[0] || allSizes[0]?.[0];

                      return allSizes.map(([t, qty]) => {
                        const isNoStock = qty <= 0;
                        return (
                          <button
                            key={t}
                            type="button"
                            className={`productcard__size-pill productcard__size-pill--button ${selected === t ? "is-selected" : ""
                              } ${isNoStock ? "productcard__size-pill--disabled" : ""}`}
                            disabled={isNoStock}
                            onClick={() => !isNoStock && handleSelectSize(p._id, t)}
                          >
                            {t}
                          </button>
                        );
                      });
                    })()}
                  </div>
                )}

                <div
                  className="productcard__qty"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="productcard__qty-label">Cant.</span>
                  <input
                    type="number"
                    min="1"
                    value={quantities[p._id] || 1}
                    onChange={(e) => handleQuantityChange(p._id, e.target.value)}
                    className="productcard__qty-input"
                    aria-label="Cantidad"
                  />
                </div>
              </div>

              <div
                className="productcard__stars"
                onClick={(e) => e.stopPropagation()}
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

          {sortedProducts.length === 0 && (
            <p className="category-empty">
              No hay productos en <strong>{formatTitle(subcategory)}</strong>.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
