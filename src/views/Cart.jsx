import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

import "../styles/cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, totalItems, totalPrice } = useCart();

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
            const hasDiscount =
              typeof item.discount === "number" && item.discount > 0;

            const basePrice =
              typeof item.price === "number" ? item.price : 0;

            const discountedPrice = hasDiscount
              ? basePrice - (basePrice * item.discount) / 100
              : basePrice;

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

                  {/* ============================
                      PRECIO (corregido)
                  ============================ */}
                  <div className="cart-item-price-row">
                    {/* Precio tachado solo si hay descuento */}
                    {hasDiscount && (
                      <span className="cart-item-old-price">
                        ${basePrice.toLocaleString("es-AR")}
                      </span>
                    )}

                    {/* Precio final blindado */}
                    <span className="cart-item-price">
                      {typeof discountedPrice === "number"
                        ? `$${discountedPrice.toLocaleString("es-AR")}`
                        : "Precio no disponible"}
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

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${totalPrice.toLocaleString("es-AR")}</span>
          </div>

          <div className="cart-summary-row">
            <span>Envío</span>
            <span>A calcular</span>
          </div>

          <div className="cart-summary-row cart-summary-total">
            <span>Total estimado</span>
            <span>${totalPrice.toLocaleString("es-AR")}</span>
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
