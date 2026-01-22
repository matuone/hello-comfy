import { useState } from "react";
import "../../styles/product-card.css";

export default function ProductCardMobile({ product }) {
  const [loaded, setLoaded] = useState(false);
  const mainImage = product.images?.[0] || "https://via.placeholder.com/300x300?text=Sin+imagen";
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Simulación de talles y stock
  const sizes = product.sizes || ["S", "M", "L", "XL", "XXL", "3XL"];
  const lowStock = product.stock < 5;

  return (
    <div className="productcard__item">
      <img
        alt={product.name}
        className="productcard__image"
        src={mainImage}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
      />
      <div className="productcard__top">
        <div className="productcard__stock">
          {lowStock && <span className="productcard__lowstock">¡Pocas unidades!</span>}
        </div>
        <h3 className="productcard__name">{product.name}</h3>
        <p className="productcard__price">${product.price}</p>
        <p className="productcard__desc">{product.description}</p>
        <div className="productcard__sizes productcard__sizes--selectable">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              className={
                "productcard__size-pill productcard__size-pill--button" +
                (selectedSize === size ? " is-selected" : "")
              }
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="productcard__qty">
          <span className="productcard__qty-label">Cant.</span>
          <input
            min="1"
            aria-label="Cantidad"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: 48 }}
          />
        </div>
      </div>
      <div className="productcard__stars">★★★★★</div>
      <div className="productcard__buttons">
        <button className="productcard__btn-buy">Comprar</button>
        <button className="productcard__btn-cart">Agregar al carrito</button>
      </div>
      <button className="productcard__btn-viewmore">Ver más</button>
    </div>
  );
}
