
import { useState } from "react";
import { calcularPrecios } from "../../hooks/useDiscountRules";
import { useWishlist } from "../../context/WishlistContext";

export default function ProductCardBestSellersMobile({ product, discountRules = [], onBuy, onAddToCart, onViewMore, onStarsClick }) {
  // Lógica igual a ProductCardNewInMobile
  const talles = product?.stockColorId?.talles || {};
  const flagTalleUnico = product?.stockColorId?.talleUnico === true;
  // Detectar talle único efectivo: solo "Único" tiene stock > 0
  const sizesWithStock = Object.entries(talles).filter(([, qty]) => qty > 0);
  const isTalleUnico = flagTalleUnico || (sizesWithStock.length === 1 && sizesWithStock[0][0].toLowerCase() === "único");

  const [selectedSize, setSelectedSize] = useState(() => {
    if (isTalleUnico) return "Único";
    return Object.keys(talles).find((t) => talles[t] > 0) || null;
  });
  const [quantity, setQuantity] = useState(1);

  const sizes = isTalleUnico
    ? []
    : (Array.isArray(product?.sizes) && product.sizes.length > 0
      ? product.sizes
      : Object.keys(talles));
  const availableSizes = Object.entries(talles).filter(([, qty]) => qty > 0);
  const lowStock = Object.values(talles).some((qty) => qty > 0 && qty <= 3);
  const noStock = availableSizes.length === 0;

  // Calcular precios usando reglas de descuento del admin
  const { precioOriginal, descuento, precioFinal, precioTransferencia, precioCuota } = calcularPrecios(product, discountRules);
  const { toggleWishlist, isInWishlist } = useWishlist();

  return (
    <div className="productcard__item" onClick={() => onViewMore(product)}>
      <button
        className={`productcard__wishlist-btn${isInWishlist(product._id) ? " is-active" : ""}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product._id); }}
        aria-label={isInWishlist(product._id) ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist(product._id) ? "#d94f7a" : "none"} stroke="#d94f7a" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
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

        {/* Pricing section with discount info */}
        <div className="productcard__pricing-mobile">
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
          <div className="productcard__payment-options-mobile">
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
        {isTalleUnico ? (
          <div className="productcard__sizes productcard__sizes--selectable">
            <span className="productcard__talle-unico-label">Único</span>
          </div>
        ) : (
          sizes.length > 0 && (
            <div className="productcard__sizes productcard__sizes--selectable">
              {sizes.map((size) => {
                const qty = talles?.[size] ?? 0;
                const isDisabled = qty <= 0;
                return (
                  <button
                    key={size}
                    type="button"
                    className={
                      "productcard__size-pill productcard__size-pill--button" +
                      (selectedSize === size ? " is-selected" : "") +
                      (isDisabled ? " productcard__size-pill--disabled" : "")
                    }
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )
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
    </div>
  );
}
