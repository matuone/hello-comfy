import { useShop } from "../context/ShopContext";

export default function Products() {
  const { products, addToCart } = useShop();
  return (
    <section>
      <h1>Productos</h1>
      <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16, listStyle: "none", padding: 0 }}>
        {products.map((p) => (
          <li key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
            <strong>{p.name}</strong>
            <p>${p.price.toLocaleString("es-AR")}</p>
            <button onClick={() => addToCart(p)}>Agregar</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
