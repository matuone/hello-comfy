import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Opcional: persistir en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hc_cart");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hc_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product, options = {}) => {
    const { size } = options;

    const key = `${product._id}-${size || "nosize"}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          image: product.images?.[0] || "",
          size: size || null,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = items.reduce((acc, item) => {
    const hasDiscount = item.discount && item.discount > 0;
    const base = item.price;
    const final = hasDiscount
      ? base - (base * item.discount) / 100
      : base;
    return acc + final * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
