import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import "../styles/cart.css";

// ⭐ NUEVO
import { useShippingCalculator } from "../hooks/useShippingCalculator";
import ShippingOptions from "../components/ShippingOptions";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function apiPath(path) {
  return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
}

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    clearCart,
    totalItems,
    updateQuantity,
    promoCode,
    setPromoCode,
    validatePromoCode,
    promoCodeError,
    promoCodeData,
  } = useCart();

  // ============================
  // REGLAS DE DESCUENTO DEL ADMIN
  // ============================
  const [discountRules, setDiscountRules] = useState([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [isActiveThreshold, setIsActiveThreshold] = useState(false);

  useEffect(() => {
    fetch(apiPath("/discounts"))
      .then((res) => res.json())
      .then((data) => setDiscountRules(data || []))
      .catch((err) => {
        console.error("Error loading discount rules:", err);
        setDiscountRules([]);
      });
  }, []);

  // 🚚 Cargar Free Shipping Threshold
  useEffect(() => {
    fetch(apiPath("/discounts/free-shipping/threshold"))
      .then((res) => res.json())
      .then((data) => {
        setFreeShippingThreshold(data.threshold || 0);
        setIsActiveThreshold(data.isActive || false);
      })
      .catch(() => {
        setFreeShippingThreshold(0);
        setIsActiveThreshold(false);
      });
  }, []);

  // ============================
  // ENVÍO REAL — Restaurar selección del ProductDetail
  // ============================
  const savedShipping = (() => {
    try { return JSON.parse(localStorage.getItem("shippingSelection") || "{}"); }
    catch { return {}; }
  })();

  const [postalCode, setPostalCode] = useState(savedShipping.postalCode || "");
  const [selectedShipping, setSelectedShipping] = useState(savedShipping.selectedShipping || null);
  const [shippingPrice, setShippingPrice] = useState(savedShipping.shippingPrice || 0);
  const [selectedAgency, setSelectedAgency] = useState(savedShipping.selectedAgency || null);
  const [shippingRestored, setShippingRestored] = useState(false);

  // ============================
  // STOCK POR ITEM (POR TALLE) + CONFLICTOS DE STOCK COMPARTIDO
  // ============================
  const [stockMap, setStockMap] = useState({});
  const [sharedStockConflicts, setSharedStockConflicts] = useState([]);

  useEffect(() => {
    if (!items.length) {
      setStockMap({});
      setSharedStockConflicts([]);
      return;
    }

    const fetchStocks = async () => {
      const map = {};
      // stockColorId real por item.key: { stockColorId, color, talles }
      const colorDataByKey = {};
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
            const res = await fetch(apiPath(`/products/${productId}`));
            const data = await res.json();
            const talles = data.stockColorId?.talles || {};
            const stockColorId = data.stockColorId?._id || data.stockColorId || null;
            const color = data.stockColorId?.color || "";

            groupedByProduct[productId].forEach((item) => {
              if (item.size) {
                map[item.key] = talles[item.size] ?? 0;
              } else {
                map[item.key] = Infinity;
              }
              colorDataByKey[item.key] = { stockColorId: String(stockColorId), color, talles };
            });
          } catch (err) {
            groupedByProduct[productId].forEach((item) => {
              map[item.key] = Infinity;
            });
          }
        })
      );

      setStockMap(map);

      // Detectar conflictos: agrupar por stockColorId + talle
      const demandMap = {};
      items.forEach((item) => {
        const cd = colorDataByKey[item.key];
        if (!cd || !cd.stockColorId || !item.size) return;
        const key = `${cd.stockColorId}-${item.size}`;
        if (!demandMap[key]) {
          demandMap[key] = {
            color: cd.color,
            size: item.size,
            available: cd.talles[item.size] ?? 0,
            totalQty: 0,
            affectedItems: [],
          };
        }
        demandMap[key].totalQty += item.quantity;
        demandMap[key].affectedItems.push({ name: item.name, key: item.key, quantity: item.quantity });
      });

      const conflicts = Object.values(demandMap).filter(
        (g) => g.affectedItems.length > 1 && g.totalQty > g.available
      );
      setSharedStockConflicts(conflicts);
    };

    fetchStocks();
  }, [items]);

  // ============================
  // CÓDIGO PROMOCIONAL → usa CartContext (promoCode, promoCodeData, etc.)
  // ============================

  // ============================
  // FUNCIÓN: OBTENER REGLA POR CATEGORÍA
  // ============================
  function getCategoryRule(item) {
    const itemCats = Array.isArray(item.category) ? item.category : [item.category];
    const itemSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
    return discountRules.find(
      (r) =>
        itemCats.includes(r.category) &&
        (!r.subcategory || r.subcategory === "none" || itemSubs.includes(r.subcategory))
    );
  }

  // ============================
  // ENVÍO GRATIS POR REGLA DE DESCUENTO O POR THRESHOLD
  // ============================
  // Primero calcular subtotal para verificar threshold
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

  // Verificar envío gratis: por regla de categoría O por threshold
  const freeShippingByRule = items.some((item) => {
    const itemCats = Array.isArray(item.category) ? item.category : [item.category];
    const itemSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
    return discountRules.some(
      (r) =>
        r.type === "free_shipping" &&
        itemCats.includes(r.category) &&
        (!r.subcategory || r.subcategory === "none" || itemSubs.includes(r.subcategory))
    );
  });

  const freeShippingByThreshold = isActiveThreshold && freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const freeShipping = freeShippingByRule || freeShippingByThreshold;

  // ============================
  // FUNCIÓN: 3x2 REAL
  // ============================
  function apply3x2(price, qty) {
    const groups = Math.floor(qty / 3);
    const remainder = qty % 3;
    return groups * 2 * price + remainder * price;
  }

  // ============================
  // TOTAL FINAL CON CÓDIGO PROMO + ENVÍO
  // ============================
  let total = subtotal;

  if (promoCodeData) {
    total = total - (total * promoCodeData.discount) / 100;
  }

  // Agregar costo de envío si hay opción seleccionada (gratis si hay regla free_shipping o threshold)
  const effectiveShippingPrice = freeShipping ? 0 : shippingPrice;
  const totalConEnvio = total + (selectedShipping ? effectiveShippingPrice : 0);

  const handleCheckout = () => {
    if (sharedStockConflicts.length > 0) {
      toast.error("Revisá los conflictos de stock antes de continuar");
      return;
    }
    // Guardar datos de regalo + envío seleccionado en localStorage para el checkout
    const checkoutFormData = JSON.parse(localStorage.getItem("checkoutFormData") || "{}");
    checkoutFormData.isGift = isGift;
    checkoutFormData.giftMessage = giftMessage;

    // Propagar la selección de envío del carrito al checkout
    if (pickPoint) {
      // Pick up point seleccionado → tiene prioridad
      checkoutFormData.shippingMethod = "pickup";
      checkoutFormData.pickPoint = pickPoint;
      checkoutFormData.shippingPrice = 0;
      checkoutFormData.selectedAgency = null;
    } else if (selectedShipping) {
      checkoutFormData.shippingMethod = selectedShipping; // "correo-home" o "correo-branch"
      checkoutFormData.shippingPrice = effectiveShippingPrice;
      checkoutFormData.freeShipping = freeShipping;
      checkoutFormData.pickPoint = "";
    }
    if (postalCode) {
      checkoutFormData.postalCode = postalCode;
    }
    if (selectedAgency) {
      checkoutFormData.selectedAgency = selectedAgency;
    }

    localStorage.setItem("checkoutFormData", JSON.stringify(checkoutFormData));

    navigate("/checkout");
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
  // ENVÍO - CALCULADORA
  // ============================
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

  // Auto-calcular envío si hay CP guardado del producto
  useEffect(() => {
    if (postalCode && postalCode.length >= 4 && items.length > 0 && !shippingRestored) {
      setShippingRestored(true);
      const products = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        weight: item.weight,
        dimensions: item.dimensions,
      }));
      calcularEnvio(postalCode, products);
    }
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================
  // PICK UP POINT
  // ============================
  const [pickPoint, setPickPoint] = useState("");

  // ============================
  // REGALO
  // ============================
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

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

                  {item.color && (
                    <p className="cart-item-color">Color: {item.color}</p>
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
                onClick={validatePromoCode}
              >
                Aplicar código
              </button>
            </div>

            {promoCodeError && (
              <p style={{ color: "#b71c1c", marginTop: "6px" }}>
                {promoCodeError}
              </p>
            )}

            {promoCodeData && (
              <p style={{ color: "#d94f7a", marginTop: "6px" }}>
                Código aplicado: {promoCode} ({promoCodeData.discount}%)
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
          {promoCodeData && (
            <div className="cart-summary-row">
              <span>Descuento ({promoCodeData.discount}%)</span>
              <span>
                -$
                {(subtotal * (promoCodeData.discount / 100)).toLocaleString(
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

            {/* ⭐ Opciones de envío seleccionables */}
            {!pickPoint && (
              <ShippingOptions
                result={shippingOptions}
                selected={selectedShipping}
                initialAgency={selectedAgency}
                freeShipping={freeShipping}
                onSelect={(id, opt, agency) => {
                  setSelectedShipping(id);
                  setShippingPrice(opt?.data?.price || 0);
                  if (agency) setSelectedAgency(agency);
                  else if (id !== "correo-branch") setSelectedAgency(null);
                  // Al elegir correo, limpiar pick up point
                  setPickPoint("");
                  // Persistir selección
                  localStorage.setItem("shippingSelection", JSON.stringify({
                    postalCode,
                    selectedShipping: id,
                    shippingPrice: opt?.data?.price || 0,
                    selectedAgency: agency || null,
                  }));
                }}
                postalCode={postalCode}
              />
            )}

            {/* ⭐ PICK UP POINT */}
            {!selectedShipping && (
              <div className="cart-pickup">
                <h4 className="cart-pickup-title">Pick Up Point</h4>

                <div className="cart-field">
                  <select
                    className="cart-input cart-pickup-dropdown"
                    value={pickPoint}
                    onChange={(e) => {
                      setPickPoint(e.target.value);
                      // Al elegir pick up, limpiar selección de correo
                      if (e.target.value) {
                        setSelectedShipping(null);
                        setShippingPrice(0);
                        setSelectedAgency(null);
                        localStorage.removeItem("shippingSelection");
                      }
                    }}
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
            )}

            {/* Botón para cambiar de método si ya eligió uno */}
            {(selectedShipping || pickPoint) && (
              <button
                type="button"
                className="cart-btn-secondary"
                style={{ marginTop: "10px", fontSize: "0.85rem" }}
                onClick={() => {
                  setSelectedShipping(null);
                  setShippingPrice(0);
                  setSelectedAgency(null);
                  setPickPoint("");
                  localStorage.removeItem("shippingSelection");
                }}
              >
                Cambiar método de envío
              </button>
            )}

            {/* ⭐ REGALO */}
            <div className="cart-gift">
              <div className="cart-gift-checkbox">
                <input
                  type="checkbox"
                  id="isGift"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                />
                <label htmlFor="isGift">¿Es para regalo?</label>
                <span className="cart-gift-icon">🎁</span>
              </div>

              {isGift && (
                <div className="cart-field">
                  <textarea
                    className="cart-input cart-gift-message"
                    placeholder="Deja tu mensaje personalizado"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    rows="3"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ============================
              ENVÍO + TOTAL FINAL
          ============================ */}
          {freeShipping && selectedShipping && (
            <div className="cart-summary-row" style={{ color: '#2e7d32', fontWeight: 600 }}>
              <span>Envío ({selectedShipping === "correo-branch" ? "Sucursal" : "Domicilio"})</span>
              <span>GRATIS 🎉</span>
            </div>
          )}
          {!freeShipping && selectedShipping && shippingPrice > 0 && (
            <div className="cart-summary-row">
              <span>Envío ({selectedShipping === "correo-branch" ? "Sucursal" : "Domicilio"})</span>
              <span>${shippingPrice.toLocaleString("es-AR")}</span>
            </div>
          )}

          <div className="cart-summary-row cart-summary-total">
            <span>Total{selectedShipping ? "" : " estimado"}</span>
            <span>${totalConEnvio.toLocaleString("es-AR")}</span>
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

          {/* ============================
              AVISO DE STOCK COMPARTIDO
          ============================ */}
          {sharedStockConflicts.length > 0 && (
            <div className="cart-stock-conflict">
              <strong>⚠️ Conflicto de stock</strong>
              {sharedStockConflicts.map((conflict, i) => (
                <div key={i} className="cart-stock-conflict__item">
                  <p>
                    El color <strong>{conflict.color}</strong> talle <strong>{conflict.size}</strong> solo
                    tiene <strong>{conflict.available}</strong> unidad{conflict.available === 1 ? "" : "es"} disponible{conflict.available === 1 ? "" : "s"},
                    pero tenés {conflict.totalQty} en el carrito entre:
                  </p>
                  <ul>
                    {conflict.affectedItems.map((ai) => (
                      <li key={ai.key}>{ai.name} &times; {ai.quantity}</li>
                    ))}
                  </ul>
                  <p>Por favor quitá o reducí alguno de estos productos para poder continuar.</p>
                </div>
              ))}
            </div>
          )}

          <button
            className="cart-btn-primary"
            onClick={handleCheckout}
            disabled={sharedStockConflicts.length > 0}
            style={sharedStockConflicts.length > 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
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
