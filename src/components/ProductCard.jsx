// src/components/ProductCard.jsx
import { useState } from "react";
import "../styles/productgrid.css";

export default function ProductCard({ product }) {
  const [loaded, setLoaded] = useState(false);

  // Imagen principal desde MongoDB (Cloudinary)
  const mainImage =
    product.images?.[0] ||
    "https://via.placeholder.com/300x300?text=Sin+imagen";

  function handleStarsClick() {
    // Aquí se podría abrir un modal o popup con las opiniones del producto
    window.dispatchEvent(new CustomEvent("showProductOpinions", { detail: { productId: product._id } }));
  }

  return (
    <div className="productcard__item">
      {/* Badge opcional */}
      {product.badge && <span className="productcard__badge">{product.badge}</span>}

      {/* Skeleton mientras carga */}
      {!loaded && <div className="productcard__skeleton"></div>}

      <img
        src={mainImage}
        alt={product.name}
        onLoad={() => setLoaded(true)}
        className={loaded ? "productcard__image" : "productcard__image productcard__image--hidden"}
      />

      <h3 className="productcard__name">{product.name}</h3>
      <div className="productcard__stars" onClick={handleStarsClick} style={{ cursor: "pointer", fontSize: 20, color: "#FFD700", marginBottom: 8 }}>
        {"★★★★★"}
      </div>
      <p className="productcard__price">${product.price}</p>
    </div>
  );
}
