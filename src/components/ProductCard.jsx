// src/components/ProductCard.jsx
import { useState } from "react";
import "../styles/productgrid.css";
import { calcularPrecios } from "../hooks/useDiscountRules";

export default function ProductCard({ product, discountRules = [] }) {
  const [loaded, setLoaded] = useState(false);

  // Imagen principal desde MongoDB (Cloudinary)
  const mainImage =
    product.images?.[0] ||
    "https://via.placeholder.com/300x300?text=Sin+imagen";

  // Calcular precios usando reglas de descuento del admin
  const { precioOriginal, descuento, precioFinal, precioTransferencia, precioCuota } = calcularPrecios(product, discountRules);

  function handleStarsClick() {
    // Aquí se podría abrir un modal o popup con las opiniones del producto
    window.dispatchEvent(new CustomEvent("showProductOpinions", { detail: { productId: product._id } }));
  }

  return (
    <div className="product-card">
      {/* Badge opcional */}
      {product.badge && <span className="badge">{product.badge}</span>}

      {/* Skeleton mientras carga */}
      {!loaded && <div className="skeleton"></div>}

      <img
        src={mainImage}
        alt={product.name}
        onLoad={() => setLoaded(true)}
        className={loaded ? "loaded" : "hidden"}
      />

      <h3>{product.name}</h3>
      <div className="productcard__stars" onClick={handleStarsClick} style={{ cursor: "pointer", fontSize: 20, color: "#FFD700", marginBottom: 8 }}>
        {"★★★★★"}
      </div>

      {/* Pricing section with discount info */}
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

        {/* Transfer and instalment info */}
        <div className="productcard__payment-options">
          <div className="payment-option payment-option--transfer">
            <span className="payment-option__label">Transferencia</span>
            <span className="payment-option__price">${precioTransferencia?.toLocaleString("es-AR")}</span>
          </div>
          <div className="payment-option payment-option--installment">
            <span className="payment-option__label">3 cuotas sin interés</span>
            <span className="payment-option__price">${precioCuota?.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
