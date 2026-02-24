import { useCart } from "../../context/CartContext";
import "../../styles/mobile/ProductDetailMobile.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ShippingOptions from "../../components/ShippingOptions";
import { useShippingCalculator } from "../../hooks/useShippingCalculator";

const ProductDetailMobile = ({ product, similares }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(product?.images?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [postalCode, setPostalCode] = useState("");
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const {
    loading: loadingShipping,
    result: shippingOptions,
    error: shippingError,
    calcular: calcularEnvio,
  } = useShippingCalculator();

  useEffect(() => {
    setSelectedImage(product?.images?.[0] || "");
    setSelectedSize(null);
    setQuantity(1);
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize) return alert("Seleccioná un talle");
    addToCart(product, {
      size: selectedSize,
      color: product?.stockColorId?.color,
      quantity,
    });
    alert("Producto agregado al carrito");
  };
  const handleBuyNow = () => {
    if (!selectedSize) return alert("Seleccioná un talle");
    addToCart(product, {
      size: selectedSize,
      color: product?.stockColorId?.color,
      quantity,
    });
    navigate("/cart");
  };
  const handleCalculateShipping = () => {
    if (!postalCode || postalCode.length < 4) {
      alert("Ingresá un código postal válido");
      return;
    }
    localStorage.setItem("shippingSelection", JSON.stringify({
      postalCode,
      selectedShipping: null,
      shippingPrice: 0,
      selectedAgency: null,
    }));

    calcularEnvio(postalCode, [
      {
        productId: product._id,
        quantity,
        weight: product.weight,
        dimensions: product.dimensions,
      },
    ]);
  };

  return (
    <div className="pdm-container">
      <img
        src={selectedImage}
        alt={product?.name}
        className="pdm-main-img"
      />
      {/* Miniaturas de imágenes */}
      {product?.images?.length > 1 && (
        <div className="pdm-thumbs">
          {product.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={product.name + ' thumb ' + i}
              className={`pdm-thumb${selectedImage === img ? ' active' : ''}`}
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>
      )}
      <div className="pdm-info">
        <h1 className="pdm-title">{product?.name}</h1>
        <p className="pdm-description">{product?.description}</p>
        <div className="pdm-price">${product?.price}</div>
        {/* Talles */}
        {product?.stockColorId?.talles && (
          <div className="pdm-sizes">
            {Object.keys(product.stockColorId.talles).map((t) => (
              <button
                key={t}
                className={`pdm-size-btn${selectedSize === t ? ' active' : ''}`}
                onClick={() => setSelectedSize(t)}
                disabled={product.stockColorId.talles[t] <= 0}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        {/* Color preview debajo de los talles */}
        {product?.stockColorId?.color && product?.stockColorId?.colorName && (
          <div className="pd-color-preview">
            <div
              className="pd-color-circle"
              style={{ backgroundColor: product.stockColorId.color }}
            ></div>
            <span className="pd-color-label">{product.stockColorId.colorName}</span>
          </div>
        )}
        {/* Color selector debajo de los talles */}
        {product?.stockColors && (
          <div className="pdm-color-selector">
            {product.stockColors.map((color) => (
              <button
                key={color.colorHex}
                className={`pdm-color-btn${selectedColor === color.colorHex ? ' active' : ''}`}
                style={{ backgroundColor: color.colorHex }}
                onClick={() => setSelectedColor(color.colorHex)}
              >
                {selectedColor === color.colorHex && <span className="pdm-color-check">✔</span>}
              </button>
            ))}
          </div>
        )}
        {/* Cantidad */}
        <div className="pdm-quantity">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
        {/* Acciones */}
        <div className="pdm-actions">
          <button onClick={handleAddToCart}>Agregar al carrito</button>
          <button onClick={handleBuyNow}>Comprar ahora</button>
        </div>

        {/* Medios de pago */}
        <div className="pdm-payments">
          <h3>Medios de pago</h3>
          <div className="pdm-payments-row">
            <div className="pdm-payments-icons">
              <span className="pdm-payment-pill">Visa</span>
              <span className="pdm-payment-pill">Mastercard</span>
              <span className="pdm-payment-pill">Amex</span>
              <span className="pdm-payment-pill">Mercado Pago</span>
              <span className="pdm-payment-pill">Transferencia</span>
              <span className="pdm-payment-pill">Cuenta DNI</span>
              <span className="pdm-payment-pill">GoCuotas</span>
              <span className="pdm-payment-pill">MODO</span>
            </div>
            <ul className="pdm-list">
              <li>3 cuotas sin interés en productos seleccionados.</li>
              <li>Beneficios extra pagando con transferencia o depósito.</li>
              <li>Total estimado: <strong>${product?.price}</strong></li>
            </ul>
          </div>
        </div>

        {/* Envíos */}
        <div className="pdm-shipping">
          <h3>Envíos</h3>
          <p className="pdm-shipping-text">
            Ingresá tu código postal para ver las opciones de envío con Andreani y Correo Argentino.
          </p>
          <div className="pdm-shipping-form">
            <input
              type="text"
              className="pdm-input"
              placeholder="Código postal"
              value={postalCode}
              onChange={e => setPostalCode(e.target.value)}
            />
            <button
              className="pdm-btn-outline"
              onClick={handleCalculateShipping}
              disabled={loadingShipping}
            >
              {loadingShipping ? "Calculando..." : "Calcular envío"}
            </button>
          </div>
          {shippingError && <p className="pdm-shipping-error">{shippingError}</p>}
          <ShippingOptions
            result={shippingOptions}
            selected={selectedShipping}
            onSelect={(id, opt, agency) => {
              setSelectedShipping(id);
              const saved = JSON.parse(localStorage.getItem("shippingSelection") || "{}");
              saved.selectedShipping = id;
              saved.shippingPrice = opt?.data?.price || 0;
              saved.selectedAgency = agency || null;
              localStorage.setItem("shippingSelection", JSON.stringify(saved));
            }}
            postalCode={postalCode}
          />
        </div>
      </div>

      {/* Productos similares */}
      {similares && similares.length > 0 && (
        <div className="pdm-similares">
          <h2 className="pdm-similares-title">Productos similares</h2>
          <div className="pdm-similares-list">
            {similares.map((sim) => (
              <div key={sim._id} className="pdm-sim-card">
                <img src={sim.images?.[0]} alt={sim.name} className="pdm-sim-img" />
                <div className="pdm-sim-name">{sim.name}</div>
                <div className="pdm-sim-price">${sim.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailMobile;
