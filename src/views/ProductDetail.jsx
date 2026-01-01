import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import BabyTeesTable from "../components/sizeTables/BabyTeesTable";
import CropTopsTable from "../components/sizeTables/CropTopsTable";
import RemerasTable from "../components/sizeTables/RemerasTable";

import { useCart } from "../context/CartContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import "../styles/productdetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [similares, setSimilares] = useState([]);
  const [loadingSimilares, setLoadingSimilares] = useState(true);

  // ============================
  // FETCH PRODUCTO PRINCIPAL
  // ============================
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setSelectedImage(data.images?.[0] || null);
        setSelectedSize(data.sizes?.[0] || null);
        setSelectedColor(data.colors?.[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ============================
  // FETCH PRODUCTOS SIMILARES
  // ============================
  useEffect(() => {
    if (!producto) return;

    const fetchSimilares = async () => {
      try {
        // 1) Buscar por categoría
        const res = await fetch(
          `http://localhost:5000/api/products?category=${producto.category}`
        );
        let data = await res.json();

        // Filtrar el producto actual
        data = data.filter((p) => p._id !== producto._id);

        // Si no hay suficientes → fallback a best sellers
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

  const hasDiscount = producto.discount && producto.discount > 0;
  const discountedPrice = hasDiscount
    ? producto.price - (producto.price * producto.discount) / 100
    : producto.price;

  const handleAddToCart = () => {
    addToCart(producto, {
      size: selectedSize,
      color: selectedColor,
    });
  };

  const handleBuyNow = () => {
    addToCart(producto, {
      size: selectedSize,
      color: selectedColor,
    });
    navigate("/cart");
  };

  return (
    <div className="pd-container">

      {/* ============================
          IMÁGENES
      ============================ */}
      <div className="pd-images">
        <img
          src={selectedImage}
          alt={producto.name}
          className="pd-main-img"
        />

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

      {/* ============================
          INFORMACIÓN
      ============================ */}
      <div className="pd-info">
        <h1 className="pd-title">{producto.name}</h1>

        {/* PRECIO + DESCUENTO */}
        <div className="pd-price-block">
          {hasDiscount && (
            <span className="pd-discount-tag">-{producto.discount}% OFF</span>
          )}

          <div className="pd-prices">
            {hasDiscount && (
              <p className="pd-old-price">
                ${producto.price.toLocaleString("es-AR")}
              </p>
            )}

            <p className="pd-price">
              ${discountedPrice.toLocaleString("es-AR")}
            </p>
          </div>

          {hasDiscount && (
            <p className="pd-secondary-text">
              ${discountedPrice.toLocaleString("es-AR")} pagando con
              transferencia o depósito bancario.
            </p>
          )}
        </div>

        {/* DESCRIPCIÓN */}
        <p className="pd-description">{producto.description}</p>

        {/* ============================
            COLORES (CÍRCULOS)
        ============================ */}
        {producto.colors?.length > 0 && (
          <div className="pd-colors">
            <h3>Colores disponibles</h3>

            <div className="pd-colors-row">
              {producto.colors.map((color) => (
                <div
                  key={color}
                  className={`pd-color-dot ${selectedColor === color ? "active" : ""
                    }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={() => setSelectedColor(color)}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* ============================
            TALLES DISPONIBLES
        ============================ */}
        {producto.sizes?.length > 0 && (
          <div className="pd-sizes">
            <h3>Talles disponibles</h3>
            <div className="pd-sizes-row">
              {producto.sizes.map((talle) => (
                <button
                  key={talle}
                  className={`pd-size-btn ${selectedSize === talle ? "active" : ""
                    }`}
                  onClick={() => setSelectedSize(talle)}
                >
                  {talle}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================
            GUÍA DE TALLES
        ============================ */}
        {producto.sizeGuide && (
          <div className="pd-size-guide">
            <h3>Guía de talles</h3>

            {producto.sizeGuide === "babytees" && <BabyTeesTable />}
            {producto.sizeGuide === "croptops" && <CropTopsTable />}
            {producto.sizeGuide === "remeras" && <RemerasTable />}
          </div>
        )}

        {/* ============================
            PAGOS
        ============================ */}
        <div className="pd-payments">
          <h3>Medios de pago</h3>
          <ul className="pd-list">
            <li>3 cuotas sin interés con débito seleccionados.</li>
            <li>
              {hasDiscount
                ? "10% de descuento pagando con transferencia o depósito."
                : "Beneficios extra pagando con transferencia o depósito."}
            </li>
            <li>Compra protegida y cambios fáciles.</li>
          </ul>
        </div>

        {/* ============================
            ENVÍOS
        ============================ */}
        <div className="pd-shipping">
          <h3>Envíos</h3>
          <ul className="pd-list">
            <li>Envío gratis superando los $15.000.</li>
            <li>Retiro en punto de pick-up (showroom) a coordinar.</li>
            <li>Próximamente: cálculo automático de envío por código postal.</li>
          </ul>
        </div>

        {/* ============================
            OPINIONES
        ============================ */}
        <div className="pd-opinions">
          <h3>Opiniones</h3>
          <div className="pd-stars-row">
            <span className="pd-stars">★★★★★</span>
            <span className="pd-opinions-count">(Próximamente opiniones reales)</span>
          </div>
        </div>

        {/* ============================
            BOTONES
        ============================ */}
        <div className="pd-actions">
          <button className="pd-btn-buy" onClick={handleBuyNow}>
            Comprar ahora
          </button>
          <button className="pd-btn-cart" onClick={handleAddToCart}>
            Agregar al carrito
          </button>
        </div>
      </div>

      {/* ============================
          PRODUCTOS SIMILARES
      ============================ */}
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
                    ${p.price.toLocaleString("es-AR")}
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
