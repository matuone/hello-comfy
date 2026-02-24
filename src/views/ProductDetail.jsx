import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import OpinionsPopup from "../components/OpinionsPopup";

import BabyTeesTable from "../components/sizeTables/BabyTeesTable";
import CropTopsTable from "../components/sizeTables/CropTopsTable";
import RemerasTable from "../components/sizeTables/RemerasTable";
import GorrasTable from "../components/sizeTables/GorrasTable";
import ImageModal from "../components/ImageModal";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useDiscountRules, calcularPrecios } from "../hooks/useDiscountRules";

import { Swiper, SwiperSlide } from "swiper/react";
import { useRef } from "react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { toast } from "react-hot-toast";

import "../styles/productdetail.css";
import "../styles/newin.css";
// Eliminado: ProductDetailMobile

// ⭐ NUEVO
import { useShippingCalculator } from "../hooks/useShippingCalculator";
import ShippingOptions from "../components/ShippingOptions";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function ProductDetail() {
  const swiperRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const discountRules = useDiscountRules();

  const [producto, setProducto] = useState(null);
  const [showOpinionsPopup, setShowOpinionsPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [quantity, setQuantity] = useState(1);

  const [similares, setSimilares] = useState([]);
  const [loadingSimilares, setLoadingSimilares] = useState(true);

  // ⭐ NUEVO — Estados de envío REAL
  const [postalCode, setPostalCode] = useState("");
  const [selectedShipping, setSelectedShipping] = useState(null);

  // Scroll al top al cargar producto (solo escritorio)
  useEffect(() => {
    if (window.innerWidth > 900) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [id]);

  const {
    loading: loadingShipping,
    result: shippingOptions,
    error: shippingError,
    calcular: calcularEnvio,
  } = useShippingCalculator();

  useEffect(() => {
    setLoading(true);
    fetch(apiPath(`/products/${id}`))
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setSelectedImage(data.images?.[0] || null);

        const availableTalles = Object.keys(data.stockColorId?.talles || {});
        const firstAvailable = availableTalles.find(
          (t) => (data.stockColorId?.talles?.[t] ?? 0) > 0
        );

        setSelectedSize(firstAvailable || null);
        setQuantity(1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!producto) return;

    const fetchSimilares = async () => {
      try {
        const res = await fetch(
          apiPath(`/products?category=${producto.category}`)
        );
        let data = await res.json();

        data = data.filter((p) => p._id !== producto._id);

        if (data.length < 4) {
          const best = await fetch(
            apiPath("/products/bestsellers")
          );
          const bestData = await best.json();
          data = [...data, ...bestData.filter((p) => p._id !== producto._id)];
        }

        setSimilares(data.slice(0, 10));
      } catch (err) {
        console.error("Error al obtener similares:", err);
      } finally {
        setLoadingSimilares(false);
      }
    };

    fetchSimilares();
  }, [producto]);


  // Detectar mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return <p className="loading">Cargando producto...</p>;
  if (!producto) return <p className="error">Producto no encontrado.</p>;

  // Ya no se usa ProductDetailMobile. El layout se adapta con CSS y condicionales.

  const {
    precioOriginal,
    descuento,
    precioFinal,
    precioTransferencia,
    precioCuota,
  } = calcularPrecios(producto, discountRules);

  const hasDiscount = descuento > 0;

  const cleanPrice = Number(precioOriginal ?? producto.price ?? 0);
  const discountedPrice = Number(precioFinal ?? cleanPrice);
  const transferPrice = Number(precioTransferencia ?? discountedPrice);
  const installmentPrice = Number(precioCuota ?? discountedPrice);

  const formatPrice = (num) =>
    Number(num).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const allSizes = Object.keys(producto.stockColorId?.talles || {});

  // Detectar si el producto es efectivamente talle único:
  // tiene "Único" como talle y es el único con stock > 0
  const sizesWithStock = allSizes.filter(
    (t) => (producto.stockColorId?.talles?.[t] ?? 0) > 0
  );
  const isEffectivelyTalleUnico =
    sizesWithStock.length === 1 && sizesWithStock[0].toLowerCase() === "único";

  const stockForSelectedSize =
    selectedSize ? producto.stockColorId?.talles?.[selectedSize] ?? 0 : 0;

  // ⭐ CANTIDAD
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    if (!selectedSize) {
      toast.error("Seleccioná un talle antes de elegir cantidad");
      return;
    }

    if (stockForSelectedSize <= 0) {
      toast.error("No hay stock disponible para este talle");
      return;
    }

    setQuantity((prev) => {
      if (prev >= stockForSelectedSize) {
        toast.error(
          `Solo hay ${stockForSelectedSize} unidad${stockForSelectedSize > 1 ? "es" : ""
          } disponibles para este talle`
        );
        return prev;
      }
      return prev + 1;
    });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Seleccioná un talle disponible antes de agregar al carrito");
      return;
    }

    if (stockForSelectedSize <= 0) {
      toast.error("No hay stock disponible para este talle");
      return;
    }

    console.log("📦 Adding to cart:", {
      product: producto.name,
      size: selectedSize,
      quantity,
    });

    addToCart(producto, {
      size: selectedSize,
      color: producto.stockColorId?.color,
      quantity,
    });

    toast.success("Producto agregado al carrito");
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Seleccioná un talle disponible para continuar con la compra");
      return;
    }

    if (stockForSelectedSize <= 0) {
      toast.error("No hay stock disponible para este talle");
      return;
    }

    addToCart(producto, {
      size: selectedSize,
      color: producto.stockColorId?.color,
      quantity,
    });

    navigate("/cart");
  };

  // ⭐ NUEVO — Cálculo REAL de envío
  const handleCalculateShipping = () => {
    if (!postalCode || postalCode.length < 4) {
      toast.error("Ingresá un código postal válido");
      return;
    }

    calcularEnvio(postalCode, [
      {
        productId: producto._id,
        quantity,
        weight: producto.weight,
        dimensions: producto.dimensions,
      },
    ]);
  };

  return (
    <div className="pd-container">
      <div className="pd-main">
        {/* IMÁGENES */}
        <div className="pd-images">
          {isMobile ? (
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              slidesPerView={1}
              spaceBetween={0}
              style={{ width: "100vw", height: "70vh" }}
            >
              {producto.images?.map((img, i) => (
                <SwiperSlide key={i}>
                  <div style={{ width: "100vw", height: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", margin: 0, padding: 0 }}>
                    <img
                      src={img}
                      alt={producto.name}
                      className="pd-main-img"
                      style={{ width: "100vw", height: "70vh", objectFit: "cover", borderRadius: 0, margin: 0, padding: 0 }}
                      onClick={() => setIsImageModalOpen(true)}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="pd-main-img-wrapper">
              <div style={{ position: 'relative', width: 480, height: 480 }}>
                <Swiper
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  style={{ width: 480, height: 480 }}
                  onSwiper={swiper => { swiperRef.current = swiper; }}
                >
                  {producto.images?.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={img}
                        alt={producto.name}
                        className="pd-main-img"
                        onClick={() => setIsImageModalOpen(true)}
                        style={{ cursor: "pointer", borderRadius: 18 }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button
                  className="pd-wishlist-floating"
                  style={{ top: 16, right: 16, zIndex: 10 }}
                  onClick={() => {
                    toggleWishlist(producto);
                    if (isInWishlist(producto._id)) {
                      toast("Quitado de favoritos", { icon: "💔" });
                    } else {
                      toast("Agregado a favoritos", { icon: "❤️" });
                    }
                  }}
                >
                  {isInWishlist(producto._id) ? (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#d94f7a" stroke="#d94f7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s-6.5-4.35-9.33-7.92C-1.1 9.4 1.4 4 6 4c2.1 0 3.57 1.1 4.5 2.09C11.43 5.1 12.9 4 15 4c4.6 0 7.1 5.4 3.33 9.08C18.5 16.65 12 21 12 21z" />
                    </svg>
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d94f7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s-6.5-4.35-9.33-7.92C-1.1 9.4 1.4 4 6 4c2.1 0 3.57 1.1 4.5 2.09C11.43 5.1 12.9 4 15 4c4.6 0 7.1 5.4 3.33 9.08C18.5 16.65 12 21 12 21z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Miniaturas debajo de la imagen grande */}
              <div className="pd-thumbs">
                {producto.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={producto.name}
                    className={`pd-thumb${swiperRef.current && swiperRef.current.activeIndex === i ? " active" : ""}`}
                    onClick={() => swiperRef.current && swiperRef.current.slideTo(i)}
                  />
                ))}
              </div>
            </div>
          )}
          {/* TÍTULO debajo de la imagen */}
          {/* Hint visual para swipear imágenes en mobile */}
          {isMobile && producto.images?.length > 1 && (
            <div style={{ textAlign: "center", marginTop: "8px", marginBottom: "4px", fontSize: "15px", color: "#d94f7a", opacity: 0.8, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <span className="hand-icon" style={{ fontSize: "22px", animation: "handMove 1.4s infinite ease-in-out" }}>🤚</span>
              <span>Deslizá para ver más fotos</span>
            </div>
          )}
          {/* TÍTULO SOLO EN MOBILE */}
          {isMobile && <h1 className="pd-title pd-title-centered">{producto.name}</h1>}
        </div>

        {/* INFO */}
        <div className="pd-info">
          {/* TÍTULO SOLO EN DESKTOP */}
          {!isMobile && <h1 className="pd-title pd-title-centered">{producto.name}</h1>}
          {/* PRECIO */}
          <div className="pd-price-block">
            {hasDiscount && (
              <span className="pd-discount-tag">-{descuento}% OFF</span>
            )}

            <div className="pd-prices">
              {hasDiscount && (
                <p className="pd-old-price">${formatPrice(cleanPrice)}</p>
              )}

              <p className="pd-price">${formatPrice(discountedPrice)}</p>
              {isMobile && <span className="pd-stars">★★★★★</span>}
            </div>

            {selectedSize &&
              (producto.stockColorId?.talles?.[selectedSize] ?? 0) === 0 && (
                <p className="pd-no-stock-msg">Sin stock para este talle</p>
              )}

            <p className="pd-secondary-text pd-secondary-text--highlight">
              ${formatPrice(transferPrice)} pagando con transferencia.
            </p>
            <p className="pd-secondary-text pd-secondary-text--installments">
              <span className="pd-installment-pill pd-installment-pill--mp">Mercado Pago</span>
              3 cuotas sin interés de: <span className="pd-installment-price">${formatPrice(installmentPrice)}</span>.
            </p>
            <p className="pd-secondary-text pd-secondary-text--installments">
              <span className="pd-installment-pill pd-installment-pill--gc">GoCuotas</span>
              3 cuotas sin interés de: <span className="pd-installment-price">${formatPrice(installmentPrice)}</span>.
            </p>
          </div>

          {/* DESCRIPCIÓN */}
          <p className="pd-description">{producto.description}</p>

          {/* TALLES */}
          <div className="pd-sizes">
            {producto.stockColorId?.talleUnico || isEffectivelyTalleUnico ? (
              <>
                <h3>Talles disponibles: <span style={{ color: "#ff4fa2", fontWeight: "700" }}>Talle Único</span></h3>
                <div style={{ padding: "12px 0", fontSize: "0.95rem", color: "#666" }}>
                  Este producto tiene una única medida disponible.
                </div>
              </>
            ) : (
              <>
                <h3>Talles disponibles</h3>
                <div className="pd-sizes-row">
                  {allSizes.map((talle) => {
                    const stockForSize = producto.stockColorId?.talles?.[talle] ?? 0;
                    const isOut = stockForSize <= 0;

                    return (
                      <button
                        key={talle}
                        className={`pd-size-btn 
            ${selectedSize === talle ? "active" : ""} 
            ${isOut ? "out-of-stock" : ""}`}
                        onClick={() => {
                          if (isOut) {
                            toast.error("Este talle no tiene stock disponible");
                            return;
                          }
                          setSelectedSize(talle);
                          setQuantity(1);
                        }}
                        disabled={isOut}
                      >
                        {talle}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ⭐ COLOR COMO CIRCULITO */}
          {producto.stockColorId?.colorHex && (
            <div className="pd-color-preview">
              <div
                className="pd-color-circle"
                style={{ backgroundColor: producto.stockColorId.colorHex }}
              />
              <span className="pd-color-label">
                {producto.stockColorId.color}
              </span>
            </div>
          )}

          {/* ⭐ SELECTOR DE CANTIDAD */}
          <div className="pd-quantity">
            <span className="pd-quantity-label">
              Cantidad{" "}
              {selectedSize && stockForSelectedSize > 0 && (
                <span className="pd-quantity-stock">
                  (Stock disponible: {stockForSelectedSize})
                </span>
              )}
            </span>

            <div className="pd-quantity-controls">
              <button
                type="button"
                className="pd-qty-btn"
                onClick={handleDecreaseQuantity}
              >
                -
              </button>

              <span className="pd-qty-value">{quantity}</span>

              <button
                type="button"
                className="pd-qty-btn"
                onClick={handleIncreaseQuantity}
                disabled={stockForSelectedSize <= 0}
              >
                +
              </button>
            </div>
          </div>

          {/* BOTONES */}
          <div className="pd-actions">
            {selectedSize &&
              (producto.stockColorId?.talles?.[selectedSize] ?? 0) > 0 && (
                <button className="pd-btn-buy" onClick={handleBuyNow}>
                  Comprar ahora
                </button>
              )}

            <button className="pd-btn-cart" onClick={handleAddToCart}>
              Agregar al carrito
            </button>

            {/* ⭐ NUEVO — Botón de Mercado Pago */}
            {/* ELIMINADO - No necesario */}
          </div>

          {/* GUÍA DE TALLES */}
          {producto.sizeGuide !== "none" && !producto.stockColorId?.talleUnico && (
            <div className="pd-size-guide">
              <h3>Guía de talles</h3>

              {producto.sizeGuide === "baby-tees" && <BabyTeesTable />}
              {producto.sizeGuide === "crop-tops" && <CropTopsTable />}
              {producto.sizeGuide === "remeras" && <RemerasTable />}
              {producto.sizeGuide === "Gorras" && <GorrasTable />}
            </div>
          )}

          {/* PAGOS */}
          <div className="pd-payments">
            <h3>Medios de pago</h3>

            <div className="pd-payments-row">
              <div className="pd-payments-icons">
                <span className="pd-payment-pill">Visa</span>
                <span className="pd-payment-pill">Mastercard</span>
                <span className="pd-payment-pill">Amex</span>
                <span className="pd-payment-pill">Mercado Pago</span>
                <span className="pd-payment-pill">Transferencia</span>
                <span className="pd-payment-pill">Cuenta DNI</span>
                <span className="pd-payment-pill">GoCuotas</span>
                <span className="pd-payment-pill">MODO</span>
              </div>

              <ul className="pd-list">
                <li>
                  3 cuotas sin interés con Mercado Pago o GoCuotas de{" "}
                  <strong>${formatPrice(installmentPrice)}</strong>.
                </li>
                <li>
                  {hasDiscount
                    ? "Transferencia con descuento: "
                    : "Transferencia: "}
                  <strong>${formatPrice(transferPrice)}</strong>
                </li>
                <li>
                  Total estimado:{" "}
                  <strong>${formatPrice(discountedPrice)}</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* ENVÍOS */}
          <div className="pd-shipping">
            <h3>Envíos</h3>

            <p className="pd-shipping-text">
              Ingresá tu código postal para ver las opciones de envío.
            </p>

            <div className="pd-shipping-form">
              <input
                type="text"
                className="pd-input"
                placeholder="Código postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />

              <button
                className="pd-btn-outline"
                onClick={handleCalculateShipping}
                disabled={loadingShipping}
              >
                {loadingShipping ? "Calculando..." : "Calcular envío"}
              </button>
            </div>

            {shippingError && (
              <p className="pd-shipping-error">{shippingError}</p>
            )}

            {/* ⭐ Opciones de envío seleccionables */}
            <ShippingOptions
              result={shippingOptions}
              selected={selectedShipping}
              onSelect={(id) => setSelectedShipping(id)}
              postalCode={postalCode}
            />
            {/* ⭐ PICK UP POINT */}
            <div className="pd-pickup">
              <h4 style={{ marginTop: "1.5rem" }}>Pick Up Point</h4>

              <div className="pd-pickup-select">
                <select
                  className="pd-input"
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    background: "#fafafa",
                    fontSize: "15px",
                  }}
                  onChange={(e) => console.log("Pick point seleccionado:", e.target.value)}
                >
                  <option value="">Elegí un punto de retiro</option>
                  <option value="aquelarre">
                    Pick Up Point Aquelarre — CABA
                  </option>
                  <option value="temperley">
                    Pick Up Point Temperley — ZS-GBA
                  </option>
                </select>
              </div>

              <p className="pd-secondary-text" style={{ marginTop: "6px" }}>
                Retiro sin costo. Te avisamos cuando esté listo.
              </p>
            </div>


            <ul className="pd-list pd-shipping-extra">
              <li>Envío gratis superando los $15.000.</li>
              <li>Retiro en punto de pick-up (showroom) a coordinar.</li>
            </ul>
          </div>
          {/* OPINIONES */}
          <div className="pd-opinions">
            <h3 className="pd-opiniones-title">Opiniones</h3>
            <div className="pd-stars-row pd-opinions-hide-mobile" style={{ alignItems: 'center', gap: 10 }}>
              <span className="productcard__stars" style={{ cursor: 'pointer' }} onClick={() => setShowOpinionsPopup(true)}>★★★★★</span>
            </div>
            <button className="pd-opinions-btn" style={{ marginTop: 8, background: 'none', border: 'none', color: '#d94f7a', cursor: 'pointer', fontWeight: 600, paddingLeft: 0 }} onClick={() => setShowOpinionsPopup(true)}>
              Ver opiniones
            </button>
            {showOpinionsPopup && (
              <OpinionsPopup productId={producto._id} onClose={() => setShowOpinionsPopup(false)} />
            )}
          </div>
        </div>
      </div>

      {/* SIMILARES - Estructura igual a NewIn.jsx */}
      <section className="newin">
        <div className="newin__container">
          <h2 className="newin__title">Productos similares</h2>
          <div className="carousel-hint">
            <span className="hand-icon">🤚</span> Arrastrá para ver más
          </div>
          {loadingSimilares ? (
            <p className="similar-loading">Cargando productos...</p>
          ) : (
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
              }}
            >
              {similares.map((p) => (
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

                      {p.sizes?.length > 0 && (
                        <div className="productcard__sizes">
                          {p.sizes.map((talle) => (
                            <span key={talle} className="productcard__size-pill">
                              {talle}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="productcard__stars">
                      {"★".repeat(5)}
                    </div>

                    <div className="productcard__buttons" onClick={(e) => e.stopPropagation()}>
                      <button className="productcard__btn-buy">
                        Comprar
                      </button>
                      <button className="productcard__btn-cart">
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
          )}
        </div>
      </section>

      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage}
        productName={producto.name}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </div>
  );
}
