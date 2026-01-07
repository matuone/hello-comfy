// src/components/ProductCard.jsx
import { useState } from "react";
import "../styles/productgrid.css";

export default function ProductCard({ product }) {
  const [loaded, setLoaded] = useState(false);

  // Imagen principal desde MongoDB (Cloudinary)
  const mainImage =
    product.images?.[0] ||
    "https://via.placeholder.com/300x300?text=Sin+imagen";

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
      <p className="price">${product.price}</p>
    </div>
  );
}
