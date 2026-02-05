import { useState } from "react";

export default function ProductCardNewInMobile({ product, onBuy, onAddToCart, onViewMore, onStarsClick }) {
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
    <div className="productcard__item" onClick={() => onViewMore(product)}>
      <img
        alt={product.name}
        className="productcard__image"
        src={product.images?.[0] || "https://via.placeholder.com/300x300?text=Sin+imagen"}
        onClick={e => { e.stopPropagation(); onViewMore(product); }}
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
          <button type="button" aria-label="Restar" onClick={e => { e.stopPropagation(); setQuantity(q => Math.max(1, (parseInt(q) || 1) - 1)); }}>-</button>
          <input
            min="1"
            aria-label="Cantidad"
            type="number"
            value={quantity === 0 ? '' : quantity}
            onChange={e => {
              const val = e.target.value;
              if (val === "") setQuantity(0);
              else setQuantity(Number(val));
            }}
            onBlur={e => { if (!quantity || quantity < 1) setQuantity(1); }}
            style={{ width: 48, textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          />
          <button type="button" aria-label="Sumar" onClick={e => { e.stopPropagation(); setQuantity(q => Math.max(1, (parseInt(q) || 1) + 1)); }}>+</button>
        </div>
      </div>
      <div
        className="productcard__stars"
        onClick={(e) => {
          e.stopPropagation();
          onStarsClick?.(product);
        }}
      >
        ★★★★★
      </div>
      <div className="productcard__buttons">
        <button className="productcard__btn-buy" onClick={e => { e.stopPropagation(); onBuy(product, selectedSize, quantity); }} disabled={noStock}>Comprar</button>
        <button className="productcard__btn-cart" onClick={e => { e.stopPropagation(); onAddToCart(product, selectedSize, quantity); }} disabled={noStock}>Agregar al carrito</button>
      </div>
      <button className="productcard__btn-viewmore" onClick={e => { e.stopPropagation(); onViewMore(product); }}>Ver más</button>
    </div>
  );
}
