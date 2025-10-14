import { createContext, useContext, useMemo, useState, useEffect } from "react";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [products] = useState([
    { id: "1", name: "Remera HelloComfy", price: 14999 },
    { id: "2", name: "Tote Bag", price: 8999 },
    { id: "3", name: "Hoodie", price: 24999 },
  ]);

  // Cargar carrito del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hello-comfy:cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Guardar carrito cuando cambie
  useEffect(() => {
    localStorage.setItem("hello-comfy:cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (p) =>
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      return found
        ? prev.map((i) => (i.id === p.id ? { ...i, qty: (i.qty ?? 0) + 1 } : i))
        : [...prev, { ...p, qty: 1 }];
    });

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, clearCart, products, user, setUser }),
    [cart, products, user]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within <ShopProvider>");
  return ctx;
};
