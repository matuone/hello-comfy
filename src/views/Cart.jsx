import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import "../styles/cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, totalItems } = useCart();

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

    // 1) descuento individual del producto
    let finalPrice =
      typeof item.discount === "number" && item.discount > 0
        ? basePrice - (basePrice * item.discount) / 100
        : basePrice;

    // 2) descuento por categoría/subcategoría
    const rule = getCategoryRule(item);

    if (rule?.type === "percentage") {
      finalPrice = finalPrice - (finalPrice * rule.discount) / 100;
    }

    // 3) si es 3x2 → cálculo especial
    if (rule?.type === "3x2") {
      return acc + apply3x2(finalPrice, item.quantity);
    }

    // caso normal
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

  if (totalItems === 0) {
    return (
      <div className="cart container-empty">
        <h1 className="cart-title">Tu carrito está vacío</h1>
        <p className="cart-subtitle">
          Agregá algunos productos comfy y volvé por acá.
        </p>
        <button className="cart-btn-primary" onClick={() => navigate("/products")}>
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

            // 1) descuento individual
            let finalPrice =
              typeof item.discount === "number" && item.discount > 0
                ? basePrice - (basePrice * item.discount) / 100
                : basePrice;

            // 2) descuento por categoría/subcategoría
            const rule = getCategoryRule(item);

            if (rule?.type === "percentage") {
              finalPrice = finalPrice - (finalPrice * rule.discount) / 100;
            }

            const hasAnyDiscount = finalPrice !== basePrice;

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

                  {/* ============================
                      PRECIO FINAL
                  ============================ */}
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

                  <p className="cart-item-qty">
                    Cantidad: <strong>{item.quantity}</strong>
                  </p>

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

            <input
              className="cart-input"
              type="text"
              placeholder="Ingresá tu código"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />

            <button
              className="cart-btn-secondary"
              style={{ marginTop: "8px" }}
              onClick={applyPromoCode}
            >
              Aplicar código
            </button>

            {promoError && (
              <p style={{ color: "#b71c1c", marginTop: "6px" }}>{promoError}</p>
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
                {(subtotal * (promoData.discount / 100)).toLocaleString("es-AR")}
              </span>
            </div>
          )}

          <div className="cart-summary-row">
            <span>Envío</span>
            <span>A calcular</span>
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

          {/* ENVÍOS */}
          <div className="cart-box">
            <h3>Envíos</h3>
            <ul>
              <li>Envío gratis superando cierto monto.</li>
              <li>Retiro en pick-up point (showroom).</li>
              <li>Próximamente cálculo por código postal.</li>
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
