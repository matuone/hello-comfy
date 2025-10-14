import { useShop } from "../context/ShopContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useShop();
  const total = cart.reduce((acc, i) => acc + i.price * (i.qty ?? 0), 0);

  if (cart.length === 0) return <h1>Tu carrito está vacío</h1>;

  return (
    <section>
      <h1>Carrito</h1>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
        {cart.map((i) => (
          <li key={i.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ flex: 1 }}>
              <strong>{i.name}</strong> — x{i.qty} — ${(i.price * (i.qty ?? 0)).toLocaleString("es-AR")}
            </div>
            <button onClick={() => removeFromCart(i.id)}>Quitar</button>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 12 }}>Total: ${total.toLocaleString("es-AR")}</h2>
      <button style={{ marginTop: 12 }} onClick={clearCart}>Vaciar carrito</button>
    </section>
  );
}
