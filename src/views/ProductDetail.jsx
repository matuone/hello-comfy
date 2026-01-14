import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import BabyTeesTable from "../components/sizeTables/BabyTeesTable";
import CropTopsTable from "../components/sizeTables/CropTopsTable";
import RemerasTable from "../components/sizeTables/RemerasTable";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { toast } from "react-hot-toast";

import "../styles/productdetail.css";

// ⭐ NUEVO
import { useShippingCalculator } from "../hooks/useShippingCalculator";
import ShippingOptions from "../components/ShippingOptions";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [similares, setSimilares] = useState([]);
  const [loadingSimilares, setLoadingSimilares] = useState(true);

  // ⭐ NUEVO — Estados de envío REAL
  const [postalCode, setPostalCode] = useState("");

  const {
    loading: loadingShipping,
    result: shippingOptions,
    error: shippingError,
    calcular: calcularEnvio,
  } = useShippingCalculator();

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setSelectedImage(data.images?.[0] || null);

        const allSizes = ["S", "M", "L", "XL", "XXL", "3XL"];
        const firstAvailable = allSizes.find(
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
          `http://localhost:5000/api/products?category=${producto.category}`
        );
        let data = await res.json();

        data = data.filter((p) => p._id !== producto._id);

        if (data.length < 4) {
          const best = await fetch(
            "http://localhost:5000/api/products/bestsellers"
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

  if (loading) return <p className="loading">Cargando producto...</p>;
  if (!producto) return <p className="error">Producto no encontrado.</p>;

  const hasDiscount = producto.discount > 0;

  const cleanPrice = Number(producto.price);
  const discountedPrice = hasDiscount
    ? Number(producto.price - (producto.price * producto.discount) / 100)
    : cleanPrice;

  const formatPrice = (num) =>
    Number(num).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const allSizes = ["S", "M", "L", "XL", "XXL", "3XL"];

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
      <h1 className="pd-title pd-title-centered">{producto.name}</h1>

      <div className="pd-main">
        {/* IMÁGENES */}
        <div className="pd-images">
          <div className="pd-main-img-wrapper">
            <img
              src={selectedImage}
              alt={producto.name}
              className="pd-main-img"
            />

            <button
              className="pd-wishlist-floating"
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
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="#d94f7a"
                  stroke="#d94f7a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21s-6.5-4.35-9.33-7.92C-1.1 9.4 1.4 4 6 4c2.1 0 3.57 1.1 4.5 2.09C11.43 5.1 12.9 4 15 4c4.6 0 7.1 5.4 3.33 9.08C18.5 16.65 12 21 12 21z" />
                </svg>
              ) : (
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d94f7a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21s-6.5-4.35-9.33-7.92C-1.1 9.4 1.4 4 6 4c2.1 0 3.57 1.1 4.5 2.09C11.43 5.1 12.9 4 15 4c4.6 0 7.1 5.4 3.33 9.08C18.5 16.65 12 21 12 21z" />
                </svg>
              )}
            </button>
          </div>

          <div className="pd-thumbs">
            {producto.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className={`pd-thumb ${selectedImage === img ? "active" : ""}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="pd-info">
          {/* PRECIO */}
          <div className="pd-price-block">
            {hasDiscount && (
              <span className="pd-discount-tag">-{producto.discount}% OFF</span>
            )}

            <div className="pd-prices">
              {hasDiscount && (
                <p className="pd-old-price">${formatPrice(cleanPrice)}</p>
              )}

              <p className="pd-price">${formatPrice(discountedPrice)}</p>
            </div>

            {selectedSize &&
              (producto.stockColorId?.talles?.[selectedSize] ?? 0) === 0 && (
                <p className="pd-no-stock-msg">Sin stock para este talle</p>
              )}

            <p className="pd-secondary-text">
              ${formatPrice(discountedPrice)} pagando con transferencia o
              depósito bancario.
            </p>
          </div>

          {/* DESCRIPCIÓN */}
          <p className="pd-description">{producto.description}</p>

          {/* TALLES */}
          <div className="pd-sizes">
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
          </div>

          {/* GUÍA DE TALLES */}
          {producto.sizeGuide !== "none" && (
            <div className="pd-size-guide">
              <h3>Guía de talles</h3>

              {producto.sizeGuide === "babytees" && <BabyTeesTable />}
              {producto.sizeGuide === "croptops" && <CropTopsTable />}
              {producto.sizeGuide === "remeras" && <RemerasTable />}
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
                <li>3 cuotas sin interés en productos seleccionados.</li>
                <li>
                  {hasDiscount
                    ? "10% de descuento pagando con transferencia o depósito."
                    : "Beneficios extra pagando con transferencia o depósito."}
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
              Ingresá tu código postal para ver las opciones de envío con
              Andreani y Correo Argentino.
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

            {/* ⭐ NUEVO — Componente con las 4 opciones reales */}
            <ShippingOptions result={shippingOptions} />
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
            <h3>Opiniones</h3>
            <div className="pd-stars-row">
              <span className="pd-stars">★★★★★</span>
              <span className="pd-opinions-count">
                (Próximamente opiniones reales)
              </span>
            </div>
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
              slidesPerView={5}
              spaceBetween={20}
              speed={400}
            >
              {similares.map((p) => (
                <SwiperSlide key={p._id}>
                  <div className="newin__item">
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/300"}
                      alt={p.name}
                      className="newin__image"
                      onClick={() => navigate(`/products/${p._id}`)}
                    />
                    <h3
                      className="newin__name"
                      onClick={() => navigate(`/products/${p._id}`)}
                    >
                      {p.name}
                    </h3>
                    <p className="newin__price">
                      ${p.price?.toLocaleString("es-AR")}
                    </p>
                    <p className="newin__desc">
                      {p.cardDescription || p.description || "Nuevo producto disponible"}
                    </p>
                    {p.sizes?.length > 0 && (
                      <div className="newin__sizes">
                        {p.sizes.map((talle) => (
                          <span key={talle} className="newin__size-pill">
                            {talle}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="newin__stars">
                      {"★".repeat(4)}☆
                    </div>
                    <div className="newin__buttons">
                      <button className="newin__btn-buy">Comprar</button>
                      <button className="newin__btn-cart">Agregar al carrito</button>
                    </div>
                    <button
                      className="newin__btn-viewmore"
                      onClick={() => navigate(`/products/${p._id}`)}
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
    </div>
  );
}
