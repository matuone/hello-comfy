import { useState } from "react";

export default function ProductCardNewInMobile({ product, onBuy, onAddToCart, onViewMore }) {
  const [selectedSize, setSelectedSize] = useState(() => {
    const talles = product?.stockColorId?.talles || {};
    return Object.keys(talles).find((t) => talles[t] > 0) || null;
  });
  const [quantity, setQuantity] = useState(1);

  const talles = product?.stockColorId?.talles || {};
  const availableSizes = Object.entries(talles).filter(([, qty]) => qty > 0);
  const lowStock = Object.values(talles).some((qty) => qty > 0 && qty <= 3);
  const noStock = availableSizes.length === 0;

  return (
    <div className="productcard__item">
      <img
        alt={product.name}
        className="productcard__image"
        src={product.images?.[0] || "https://via.placeholder.com/300x300?text=Sin+imagen"}
      />
      <div className="productcard__top">
        <div className="productcard__stock">
          {noStock ? (
            <span className="productcard__nostock">Sin stock</span>
          ) : lowStock ? (
            <span className="productcard__lowstock">¡Pocas unidades!</span>
          ) : (
            <span className="productcard__instock">Stock disponible</span>
          )}
        </div>
        <h3 className="productcard__name">{product.name}</h3>
        <p className="productcard__price">${product.price?.toLocaleString("es-AR")}</p>
        <p className="productcard__desc">{product.cardDescription || product.description || "Nuevo producto disponible"}</p>
        {availableSizes.length > 0 && (
          <div className="productcard__sizes productcard__sizes--selectable">
            {availableSizes.map(([size]) => (
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
        )}
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
        <button className="productcard__btn-buy" onClick={() => onBuy(product, selectedSize, quantity)} disabled={noStock}>Comprar</button>
        <button className="productcard__btn-cart" onClick={() => onAddToCart(product, selectedSize, quantity)} disabled={noStock}>Agregar al carrito</button>
      </div>
      <button className="productcard__btn-viewmore" onClick={() => onViewMore(product)}>Ver más</button>
    </div>
  );
}
