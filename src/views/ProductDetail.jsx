import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import BabyTeesTable from "../components/sizeTables/BabyTeesTable";
import CropTopsTable from "../components/sizeTables/CropTopsTable";
import RemerasTable from "../components/sizeTables/RemerasTable";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { toast } from "react-hot-toast";

import "../styles/productdetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [similares, setSimilares] = useState([]);
  const [loadingSimilares, setLoadingSimilares] = useState(true);

  const [postalCode, setPostalCode] = useState("");
  const [shippingOptions, setShippingOptions] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");

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

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Seleccioná un talle disponible antes de agregar al carrito");
      return;
    }

    addToCart(producto, {
      size: selectedSize,
      color: producto.stockColorId?.color,
    });

    toast.success("Producto agregado al carrito");
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Seleccioná un talle disponible para continuar con la compra");
      return;
    }

    addToCart(producto, {
      size: selectedSize,
      color: producto.stockColorId?.color,
    });

    navigate("/cart");
  };

  const handleCalculateShipping = () => {
    setShippingError("");

    if (!postalCode || postalCode.length < 4) {
      setShippingError("Ingresá un código postal válido.");
      return;
    }

    setLoadingShipping(true);

    const base = cleanPrice > 15000 ? 0 : 1900;

    setTimeout(() => {
      setShippingOptions({
        andreani: {
          carrier: "Andreani",
          price: base,
          eta: "3 a 5 días hábiles",
        },
        correoArgentino: {
          carrier: "Correo Argentino",
          price: base === 0 ? 0 : base - 300,
          eta: "4 a 7 días hábiles",
        },
      });
      setLoadingShipping(false);
    }, 700);
  };

  const allSizes = ["S", "M", "L", "XL", "XXL", "3XL"];

  return (
    <div className="pd-container">
      {/* ⭐ TÍTULO CENTRADO ARRIBA */}
      <h1 className="pd-title pd-title-centered">{producto.name}</h1>

      <div className="pd-main">




        {/* ⭐ IMAGEN PRINCIPAL + CORAZÓN */}
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
                const stockForSize =
                  producto.stockColorId?.talles?.[talle] ?? 0;

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

            {shippingOptions && (
              <div className="pd-shipping-results">
                <div className="pd-shipping-card">
                  <h4>Andreani</h4>
                  <p className="pd-shipping-price">
                    {shippingOptions.andreani.price === 0
                      ? "Envío gratis"
                      : `$${formatPrice(shippingOptions.andreani.price)}`}
                  </p>
                  <p className="pd-shipping-eta">
                    {shippingOptions.andreani.eta}
                  </p>
                </div>

                <div className="pd-shipping-card">
                  <h4>Correo Argentino</h4>
                  <p className="pd-shipping-price">
                    {shippingOptions.correoArgentino.price === 0
                      ? "Envío gratis"
                      : `$${formatPrice(
                        shippingOptions.correoArgentino.price
                      )}`}
                  </p>
                  <p className="pd-shipping-eta">
                    {shippingOptions.correoArgentino.eta}
                  </p>
                </div>
              </div>
            )}

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
        </div>
      </div>

      {/* SIMILARES */}
      <div className="pd-similares">
        <h2>Productos similares</h2>

        {loadingSimilares ? (
          <p className="similar-loading">Cargando productos...</p>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={1.3}
            breakpoints={{
              600: { slidesPerView: 2.2 },
              900: { slidesPerView: 3.2 },
              1200: { slidesPerView: 4.2 },
            }}
            className="similar-swiper"
          >
            {similares.map((p) => (
              <SwiperSlide key={p._id}>
                <div
                  className="similar-card"
                  onClick={() => navigate(`/products/${p._id}`)}
                >
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/300"}
                    alt={p.name}
                    className="similar-img"
                  />

                  <h3 className="similar-name">{p.name}</h3>

                  <p className="similar-price">
                    ${formatPrice(p.price)}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
}
