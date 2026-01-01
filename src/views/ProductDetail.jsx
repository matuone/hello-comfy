import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import BabyTeesTable from "../components/sizeTables/BabyTeesTable";
import CropTopsTable from "../components/sizeTables/CropTopsTable";
import RemerasTable from "../components/sizeTables/RemerasTable";

import { useCart } from "../context/CartContext";

import "../styles/productdetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setSelectedImage(data.images?.[0] || null);
        setSelectedSize(data.sizes?.[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Cargando producto...</p>;
  if (!producto) return <p className="error">Producto no encontrado.</p>;

  const hasDiscount = producto.discount && producto.discount > 0;
  const discountedPrice = hasDiscount
    ? producto.price - (producto.price * producto.discount) / 100
    : producto.price;

  const handleAddToCart = () => {
    addToCart(producto, { size: selectedSize });
  };

  const handleBuyNow = () => {
    addToCart(producto, { size: selectedSize });
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

          {/* Precio con transferencia (ej: mismo descuento) */}
          {hasDiscount && (
            <p className="pd-secondary-text">
              ${discountedPrice.toLocaleString("es-AR")} pagando con
              transferencia o depósito bancario.
            </p>
          )}
        </div>

        <p className="pd-description">{producto.description}</p>

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
            GUÍA DE TALLES (solo si aplica)
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
            INFO DE PAGOS
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
            INFO DE ENVÍOS
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
            OPINIONES (mock, lista para backend)
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
    </div>
  );
}
