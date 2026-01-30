import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // ⭐ Reglas de descuento por categoría/subcategoría
  const [discountRules, setDiscountRules] = useState([]);

  // ⭐ Código promocional ingresado
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeData, setPromoCodeData] = useState(null);
  const [promoCodeError, setPromoCodeError] = useState("");

  // ============================
  // LOCALSTORAGE - Cargar al iniciar
  // ============================
  useEffect(() => {
    const savedCart = localStorage.getItem("hc_cart");
    const savedPromo = localStorage.getItem("hc_promo");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (err) {
        console.error("Error al cargar carrito desde localStorage:", err);
        localStorage.removeItem("hc_cart");
      }
    }

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
  }, []);

  // ============================
  // LOCALSTORAGE - Guardar cuando cambia el carrito
  // ============================
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("hc_cart", JSON.stringify(items));
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
    fetch("http://localhost:5000/api/discounts")
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
    const rule = discountRules.find(
      (r) =>
        r.category === item.category &&
        (r.subcategory === item.subcategory || r.subcategory === "none") &&
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
          (item) =>
            item.category === rule.category &&
            item.subcategory === rule.subcategory
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
      const res = await fetch("http://localhost:5000/api/promocodes/validate", {
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
        const matchCategory = category === "all" || item.category === category;
        const matchSub =
          subcategory === "all" || item.subcategory === subcategory;
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
