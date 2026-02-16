
import "../styles/newin.css";
import "../styles/productgrid.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "./OpinionsPopup";
import { useCart } from "../context/CartContext";
import { useDiscountRules, calcularPrecios } from "../hooks/useDiscountRules";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function NewIn() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);
  const [opinionsProductId, setOpinionsProductId] = useState(null);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});

  // Reglas de descuento del admin
  const discountRules = useDiscountRules();

  useEffect(() => {
    fetch(apiPath("/products/new"))
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  const getAvailableSizes = (product) => {
    if (!product?.stockColorId?.talles) return [];
    return Object.entries(product.stockColorId.talles);
  };


  // Esta función estaba mal ubicada, la reubico correctamente:
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

  return (
    <section className="newin">
      <div className="newin__container">
        <h2 className="newin__title">Nuevos ingresos:</h2>

        {/* HINT VISUAL */}
        <div className="carousel-hint">
          <span className="hand-icon">🤚</span> Arrastrá para ver más
        </div>

        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          slidesPerView={1.2}
          spaceBetween={14}
          speed={400}
          breakpoints={{
            480: { slidesPerView: 2.1, spaceBetween: 16 },
            768: { slidesPerView: 3.1, spaceBetween: 18 },
            1024: { slidesPerView: 4, spaceBetween: 20 },
            1280: { slidesPerView: 5, spaceBetween: 22 },
          }}
        >
          {productos.map((p) => (
            <SwiperSlide key={p._id}>
              <div className="productcard__item" onClick={() => navigate(`/products/${p._id}`)}>
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
                        <span className="productcard__instock">
                          Stock disponible
                        </span>
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

                  {p.stockColorId?.talles && (() => {
                    const allSizes = getAvailableSizes(p);
                    const inStockSizes = allSizes.filter(([, qty]) => qty > 0);
                    const effectivelyTalleUnico = p.stockColorId?.talleUnico || (inStockSizes.length === 1 && inStockSizes[0][0].toLowerCase() === "único");

                    if (effectivelyTalleUnico) {
                      return (
                        <div className="productcard__sizes productcard__sizes--selectable">
                          <span className="productcard__talle-unico-label">Único</span>
                        </div>
                      );
                    }

                    const selected = selectedSizes[p._id] || inStockSizes[0]?.[0] || allSizes[0]?.[0];
                    return (
                      <div
                        className="productcard__sizes productcard__sizes--selectable"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {allSizes.map(([t, qty]) => {
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
                        })}
                      </div>
                    );
                  })()}

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
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpinionsProductId(p._id);
                    setShowOpinions(true);
                  }}
                >
                  {"★".repeat(4)}☆
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {showOpinions && opinionsProductId && (
        <OpinionsPopup
          productId={opinionsProductId}
          onClose={() => {
            setShowOpinions(false);
            setOpinionsProductId(null);
          }}
        />
      )}
    </section>
  );
}
