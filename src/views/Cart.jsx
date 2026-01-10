import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import "../styles/cart.css";

// ⭐ NUEVO
import { useShippingCalculator } from "../hooks/useShippingCalculator";
import ShippingOptions from "../components/ShippingOptions";

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    clearCart,
    totalItems,
    updateQuantity,
  } = useCart();

  // ============================
  // REGLAS DE DESCUENTO DEL ADMIN
  // ============================
  const [discountRules, setDiscountRules] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/discounts")
      .then((res) => res.json())
      .then((data) => setDiscountRules(data));
  }, []);

  // ============================
  // STOCK POR ITEM (POR TALLE)
  // ============================
  const [stockMap, setStockMap] = useState({});

  useEffect(() => {
    if (!items.length) {
      setStockMap({});
      return;
    }

    const fetchStocks = async () => {
      const map = {};
      const groupedByProduct = {};

      items.forEach((item) => {
        if (!groupedByProduct[item.productId]) {
          groupedByProduct[item.productId] = [];
        }
        groupedByProduct[item.productId].push(item);
      });

      await Promise.all(
        Object.keys(groupedByProduct).map(async (productId) => {
          try {
            const res = await fetch(
              `http://localhost:5000/api/products/${productId}`
            );
            const data = await res.json();
            const talles = data.stockColorId?.talles || {};

            groupedByProduct[productId].forEach((item) => {
              if (item.size) {
                const stock = talles[item.size] ?? 0;
                map[item.key] = stock;
              } else {
                map[item.key] = Infinity;
              }
            });
          } catch (err) {
            groupedByProduct[productId].forEach((item) => {
              map[item.key] = Infinity;
            });
          }
        })
      );

      setStockMap(map);
    };

    fetchStocks();
  }, [items]);

  // ============================
  // CÓDIGO PROMOCIONAL
  // ============================
  const [promoCode, setPromoCode] = useState("");
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState("");

  async function applyPromoCode() {
    setPromoError("");

    if (!promoCode.trim()) {
      setPromoError("Ingresá un código válido");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/promocodes/validate/${promoCode}`
      );
      const data = await res.json();

      if (!data.valid) {
        setPromoData(null);
        setPromoError("Código inválido o vencido");
        return;
      }

      setPromoData(data);
    } catch (err) {
      setPromoError("Error validando el código");
    }
  }

  // ============================
  // FUNCIÓN: OBTENER REGLA POR CATEGORÍA
  // ============================
  function getCategoryRule(item) {
    return discountRules.find(
      (r) =>
        r.category === item.category &&
        (r.subcategory === "none" || r.subcategory === item.subcategory)
    );
  }

  // ============================
  // FUNCIÓN: 3x2 REAL
  // ============================
  function apply3x2(price, qty) {
    const groups = Math.floor(qty / 3);
    const remainder = qty % 3;
    return groups * 2 * price + remainder * price;
  }

  // ============================
  // SUBTOTAL REAL
  // ============================
  const subtotal = items.reduce((acc, item) => {
    const basePrice = typeof item.price === "number" ? item.price : 0;

    let finalPrice =
      typeof item.discount === "number" && item.discount > 0
        ? basePrice - (basePrice * item.discount) / 100
        : basePrice;

    const rule = getCategoryRule(item);

    if (rule?.type === "percentage") {
      finalPrice = finalPrice - (finalPrice * rule.discount) / 100;
    }

    if (rule?.type === "3x2") {
      return acc + apply3x2(finalPrice, item.quantity);
    }

    return acc + finalPrice * item.quantity;
  }, 0);

  // ============================
  // TOTAL FINAL CON CÓDIGO PROMO
  // ============================
  let total = subtotal;

  if (promoData) {
    total = total - (total * promoData.discount) / 100;
  }

  const handleCheckout = () => {
    console.log("Checkout iniciado (próximamente integrado con backend)");
  };

  // ============================
  // HANDLERS DE CANTIDAD
  // ============================
  const handleDecrease = (item) => {
    if (item.quantity <= 1) return;
    updateQuantity(item.key, item.quantity - 1);
  };

  const handleIncrease = (item) => {
    const stock = stockMap[item.key];

    if (
      stock !== undefined &&
      stock !== Infinity &&
      item.quantity >= stock
    ) {
      toast.error(
        `Solo hay ${stock} unidad${stock === 1 ? "" : "es"} disponibles para este talle`
      );
      return;
    }

    updateQuantity(item.key, item.quantity + 1);
  };

  // ============================
  // ENVÍO REAL
  // ============================
  const [postalCode, setPostalCode] = useState("");

  const {
    loading: loadingShipping,
    result: shippingOptions,
    error: shippingError,
    calcular: calcularEnvio,
  } = useShippingCalculator();

  const handleCalculateShipping = () => {
    if (!postalCode || postalCode.length < 4) {
      toast.error("Ingresá un código postal válido");
      return;
    }

    const products = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      weight: item.weight,
      dimensions: item.dimensions,
    }));

    calcularEnvio(postalCode, products);
  };

  // ============================
  // PICK UP POINT
  // ============================
  const [pickPoint, setPickPoint] = useState("");

  if (totalItems === 0) {
    return (
      <div className="cart container-empty">
        <h1 className="cart-title">Tu carrito está vacío</h1>
        <p className="cart-subtitle">
          Agregá algunos productos comfy y volvé por acá.
        </p>
        <button
          className="cart-btn-primary"
          onClick={() => navigate("/products")}
        >
          Ver productos
        </button>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1 className="cart-title">Tu carrito</h1>
      <p className="cart-subtitle">
        Tenés {totalItems} {totalItems === 1 ? "producto" : "productos"} en tu carrito.
      </p>

      <div className="cart-layout">
        {/* ============================
            LISTA DE ITEMS
        ============================ */}
        <div className="cart-items">
          {items.map((item) => {
            const basePrice = typeof item.price === "number" ? item.price : 0;

            let finalPrice =
              typeof item.discount === "number" && item.discount > 0
                ? basePrice - (basePrice * item.discount) / 100
                : basePrice;

            const rule = getCategoryRule(item);

            if (rule?.type === "percentage") {
              finalPrice = finalPrice - (finalPrice * rule.discount) / 100;
            }

            const hasAnyDiscount = finalPrice !== basePrice;
            const stockForItem = stockMap[item.key];

            return (
              <div key={item.key} className="cart-item">
                <img
                  src={item.image || "https://via.placeholder.com/150"}
                  alt={item.name}
                  className="cart-item-img"
                  onClick={() => navigate(`/products/${item.productId}`)}
                />

                <div className="cart-item-info">
                  <h3
                    className="cart-item-name"
                    onClick={() => navigate(`/products/${item.productId}`)}
                  >
                    {item.name}
                  </h3>

                  {item.size && (
                    <p className="cart-item-size">Talle: {item.size}</p>
                  )}

                  {rule?.type === "3x2" && (
                    <p className="cart-item-promo">Promo 3x2 aplicada</p>
                  )}

                  <div className="cart-item-price-row">
                    {hasAnyDiscount && (
                      <span className="cart-item-old-price">
                        ${basePrice.toLocaleString("es-AR")}
                      </span>
                    )}

                    <span className="cart-item-price">
                      ${finalPrice.toLocaleString("es-AR")}
                    </span>
                  </div>

                  {/* ============================
                      CANTIDAD + STOCK
                  ============================ */}
                  <div className="cart-item-qty">
                    <span>Cantidad:</span>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => handleDecrease(item)}
                    >
                      -
                    </button>
                    <strong>{item.quantity}</strong>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => handleIncrease(item)}
                    >
                      +
                    </button>
                    {stockForItem !== undefined &&
                      stockForItem !== Infinity && (
                        <span className="cart-item-stock">
                          (Stock: {stockForItem})
                        </span>
                      )}
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.key)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}

          <button className="cart-clear" onClick={clearCart}>
            Vaciar carrito
          </button>
        </div>

        {/* ============================
            RESUMEN / PRE-CHECKOUT
        ============================ */}
        <div className="cart-summary">
          <h2>Resumen de compra</h2>

          {/* ============================
              CÓDIGO PROMOCIONAL
          ============================ */}
          <div className="cart-box">
            <h3>Código promocional</h3>

            <div className="cart-field">
              <input
                className="cart-input"
                type="text"
                placeholder="Ingresá tu código"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              />

              <button
                className="cart-btn-secondary"
                onClick={applyPromoCode}
              >
                Aplicar código
              </button>
            </div>

            {promoError && (
              <p style={{ color: "#b71c1c", marginTop: "6px" }}>
                {promoError}
              </p>
            )}

            {promoData && (
              <p style={{ color: "#d94f7a", marginTop: "6px" }}>
                Código aplicado: {promoData.code} ({promoData.discount}%)
              </p>
            )}
          </div>

          {/* ============================
              SUBTOTAL
          ============================ */}
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString("es-AR")}</span>
          </div>

          {/* ============================
              DESCUENTO PROMO
          ============================ */}
          {promoData && (
            <div className="cart-summary-row">
              <span>Descuento ({promoData.discount}%)</span>
              <span>
                -$
                {(subtotal * (promoData.discount / 100)).toLocaleString(
                  "es-AR"
                )}
              </span>
            </div>
          )}

          {/* ============================
              ENVÍO REAL
          ============================ */}
          <div className="cart-box">
            <h3>Envíos</h3>

            <div className="cart-field">
              <input
                className="cart-input"
                type="text"
                placeholder="Código postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />

              <button
                className="cart-btn-secondary"
                onClick={handleCalculateShipping}
                disabled={loadingShipping}
              >
                {loadingShipping ? "Calculando..." : "Calcular envío"}
              </button>
            </div>

            {shippingError && (
              <p style={{ color: "#b71c1c", marginTop: "6px" }}>
                {shippingError}
              </p>
            )}

            {/* ⭐ Muestra Andreani + Correo */}
            <ShippingOptions result={shippingOptions} />

            {/* ⭐ PICK UP POINT */}
            <div className="cart-pickup">
              <h4 className="cart-pickup-title">Pick Up Point</h4>

              <div className="cart-field">
                <select
                  className="cart-input cart-pickup-dropdown"
                  value={pickPoint}
                  onChange={(e) => setPickPoint(e.target.value)}
                >
                  <option value="">Elegí un punto de retiro</option>
                  <option value="aquelarre">Pick Up Point Aquelarre — CABA</option>
                  <option value="temperley">Pick Up Point Temperley — ZS-GBA</option>
                </select>
              </div>

              <p className="cart-pickup-note">
                Retiro sin costo. Te avisamos cuando esté listo.
              </p>
            </div>
          </div>

          {/* ============================
              TOTAL FINAL
          ============================ */}
          <div className="cart-summary-row cart-summary-total">
            <span>Total estimado</span>
            <span>${total.toLocaleString("es-AR")}</span>
          </div>

          {/* PAGOS */}
          <div className="cart-box">
            <h3>Medios de pago</h3>
            <ul>
              <li>3 cuotas sin interés con débito seleccionados.</li>
              <li>Descuento extra con transferencia o depósito.</li>
              <li>Compra protegida.</li>
            </ul>
          </div>

          <button className="cart-btn-primary" onClick={handleCheckout}>
            Iniciar compra
          </button>

          <button
            className="cart-btn-secondary"
            onClick={() => navigate("/products")}
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}
