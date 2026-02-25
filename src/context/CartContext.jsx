import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

// Campos mínimos que se guardan en localStorage (sin precios ni nombres)
const CART_STORAGE_FIELDS = ["key", "productId", "size", "color", "quantity"];
const stripSensitive = (item) =>
  CART_STORAGE_FIELDS.reduce((obj, k) => { if (item[k] !== undefined) obj[k] = item[k]; return obj; }, {});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // ⭐ Reglas de descuento por categoría/subcategoría
  const [discountRules, setDiscountRules] = useState([]);

  // ⭐ Código promocional ingresado
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeData, setPromoCodeData] = useState(null);
  const [promoCodeError, setPromoCodeError] = useState("");

  // ============================
  // LOCALSTORAGE - Cargar al iniciar + hidratar desde API
  // Solo se guardan IDs y cantidades; precios vienen SIEMPRE del servidor
  // ============================
  useEffect(() => {
    const savedPromo = localStorage.getItem("hc_promo");
    if (savedPromo) {
      try {
        const parsedPromo = JSON.parse(savedPromo);
        setPromoCode(parsedPromo.code || "");
        setPromoCodeData(parsedPromo.data || null);
      } catch (err) {
        console.error("Error al cargar promo desde localStorage:", err);
        localStorage.removeItem("hc_promo");
      }
    }

    const savedCart = localStorage.getItem("hc_cart");
    if (!savedCart) {
      setCartLoading(false);
      return;
    }

    let minimalItems;
    try {
      minimalItems = JSON.parse(savedCart);
    } catch (err) {
      console.error("Error al cargar carrito desde localStorage:", err);
      localStorage.removeItem("hc_cart");
      setCartLoading(false);
      return;
    }

    if (!Array.isArray(minimalItems) || minimalItems.length === 0) {
      setCartLoading(false);
      return;
    }

    // Hidratar precios/nombres desde la API (NUNCA desde localStorage)
    const API_URL = import.meta.env.VITE_API_URL;
    const apiPath = (path) =>
      API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;

    const productIds = [...new Set(minimalItems.map((i) => i.productId))];

    Promise.all(
      productIds.map((id) =>
        fetch(apiPath(`/products/${id}`))
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    )
      .then((products) => {
        const productMap = {};
        products.forEach((p) => {
          if (p && p._id) productMap[p._id] = p;
        });

        const hydrated = minimalItems
          .filter((item) => productMap[item.productId]) // quitar productos eliminados de la BD
          .map((item) => {
            const db = productMap[item.productId];
            return {
              key: item.key,
              productId: item.productId,
              name: db.name,
              category: db.category,
              subcategory: db.subcategory,
              price: db.price,
              discount: db.discount || 0,
              image: db.images?.[0] || "",
              size: item.size || null,
              color: item.color || null,
              quantity: Math.max(1, parseInt(item.quantity) || 1),
            };
          });

        setItems(hydrated);
      })
      .catch((err) => {
        console.error("Error hidratando carrito desde API:", err);
        // Dejar items vacíos si no se puede contactar la API
      })
      .finally(() => setCartLoading(false));
  }, []);

  // ============================
  // LOCALSTORAGE - Guardar solo datos mínimos (sin precios ni nombres)
  // ============================
  useEffect(() => {
    if (items.length > 0) {
      const minimal = items.map(stripSensitive);
      localStorage.setItem("hc_cart", JSON.stringify(minimal));
    } else {
      localStorage.removeItem("hc_cart");
    }
  }, [items]);

  // ============================
  // LOCALSTORAGE - Guardar código promocional
  // ============================
  useEffect(() => {
    if (promoCode || promoCodeData) {
      localStorage.setItem("hc_promo", JSON.stringify({
        code: promoCode,
        data: promoCodeData,
      }));
    } else {
      localStorage.removeItem("hc_promo");
    }
  }, [promoCode, promoCodeData]);

  // ============================
  // FETCH REGLAS DE DESCUENTO
  // ============================
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const apiPath = (path) => `${API_URL}${path}`;
    fetch(apiPath("/discounts"))
      .then((res) => res.json())
      .then((data) => setDiscountRules(data))
      .catch(() => { });
  }, []);

  // ============================
  // AGREGAR AL CARRITO (respeta cantidad)
  // ============================
  const addToCart = (product, options = {}) => {
    const { size, color, quantity = 1 } = options;

    const key = `${product._id}-${size || "nosize"}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);

      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          key,
          productId: product._id,
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          discount: product.discount || 0,
          image: product.images?.[0] || "",
          size: size || null,
          color: color || null,
          quantity, // ⭐ respeta la cantidad real
        },
      ];
    });
  };

  // ============================
  // ACTUALIZAR CANTIDAD DESDE CARRITO
  // ============================
  const updateQuantity = (key, newQty) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, newQty) }
          : item
      )
    );
  };

  // ============================
  // REMOVER / LIMPIAR
  // ============================
  const removeFromCart = (key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode("");
    setPromoCodeData(null);
    setPromoCodeError("");
    localStorage.removeItem("hc_cart");
    localStorage.removeItem("hc_promo");
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // ============================
  // APLICAR DESCUENTO POR CATEGORÍA/SUBCATEGORÍA
  // ============================
  const applyCategoryDiscount = (item) => {
    const itemCats = Array.isArray(item.category) ? item.category : [item.category];
    const itemSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
    const rule = discountRules.find(
      (r) =>
        itemCats.includes(r.category) &&
        (r.subcategory === "none" || itemSubs.includes(r.subcategory)) &&
        r.type === "percentage"
    );

    if (!rule) return item.discount || 0;

    // Si el producto ya tiene descuento propio → se respeta
    if (item.discount > 0) return item.discount;

    return rule.discount;
  };

  // ============================
  // APLICAR PROMOCIÓN 3x2
  // ============================
  const apply3x2Promotions = () => {
    let discountAmount = 0;

    discountRules
      .filter((r) => r.type === "3x2")
      .forEach((rule) => {
        const group = items.filter(
          (item) => {
            const itemCats = Array.isArray(item.category) ? item.category : [item.category];
            const itemSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
            return itemCats.includes(rule.category) && itemSubs.includes(rule.subcategory);
          }
        );

        const totalQty = group.reduce((acc, i) => acc + i.quantity, 0);

        if (totalQty >= 3) {
          const freeUnits = Math.floor(totalQty / 3);

          // Tomamos el precio más barato del grupo (estándar en 3x2)
          const sorted = [...group].sort((a, b) => a.price - b.price);
          const cheapest = sorted[0];

          discountAmount += cheapest.price * freeUnits;
        }
      });

    return discountAmount;
  };

  // ============================
  // VALIDAR CÓDIGO PROMOCIONAL
  // ============================
  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const res = await fetch(apiPath("/promocodes/validate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });

      const data = await res.json();

      if (!data.valid) {
        setPromoCodeError(data.message || "Código inválido");
        setPromoCodeData(null);
        return;
      }

      setPromoCodeError("");
      setPromoCodeData(data);
    } catch (err) {
      setPromoCodeError("Error al validar el código");
    }
  };

  // ============================
  // CALCULAR TOTAL
  // ============================
  const calculateTotal = () => {
    let subtotal = 0;

    items.forEach((item) => {
      const base = item.price;

      // 1) descuento propio o por categoría
      const discountPercent = applyCategoryDiscount(item);

      const finalPrice =
        discountPercent > 0
          ? base - (base * discountPercent) / 100
          : base;

      subtotal += finalPrice * item.quantity;
    });

    // 2) aplicar 3x2
    const promo3x2Discount = apply3x2Promotions();

    let total = subtotal - promo3x2Discount;

    // 3) aplicar código promocional
    if (promoCodeData) {
      const { discount, category, subcategory } = promoCodeData;

      const applicableItems = items.filter((item) => {
        const itemCats = Array.isArray(item.category) ? item.category : [item.category];
        const itemSubs = Array.isArray(item.subcategory) ? item.subcategory : [item.subcategory];
        const matchCategory = category === "all" || itemCats.includes(category);
        const matchSub =
          subcategory === "all" || itemSubs.includes(subcategory);
        return matchCategory && matchSub;
      });

      const promoSubtotal = applicableItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const promoDiscountAmount = (promoSubtotal * discount) / 100;

      total -= promoDiscountAmount;
    }

    return total;
  };

  const totalPrice = calculateTotal();

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,

        // estado de carga
        cartLoading,

        // códigos promocionales
        promoCode,
        setPromoCode,
        validatePromoCode,
        promoCodeError,
        promoCodeData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
