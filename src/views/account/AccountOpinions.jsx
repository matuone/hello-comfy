import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useState as useReactState } from "react";

export default function AccountOpinions() {
  const { user, token } = useAuth();
  const [stars, setStars] = useReactState(0);
  const [text, setText] = useReactState("");
  const [success, setSuccess] = useReactState(false);
  const [loading, setLoading] = useReactState(false);
  const [products, setProducts] = useReactState([]);
  const [selectedProduct, setSelectedProduct] = useReactState("");

  useEffect(() => {
    async function fetchPurchases() {
      if (!user || !token) return;
      const res = await fetch("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Extraer productos comprados
      const prods = (data.orders || []).flatMap(order =>
        order.items.map(item => ({
          _id: item.productId || item._id,
          name: item.name || item.productName || "Producto"
        }))
      );
      setProducts(prods);
    }
    fetchPurchases();
  }, [user, token]);

  function handleStarClick(n) {
    setStars(n);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/opinions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: selectedProduct, stars, text }),
      });
      if (res.ok) {
        setSuccess(true);
        setText("");
        setStars(0);
        setSelectedProduct("");
      }
    } catch {
      // error
    }
    setLoading(false);
  }

  return (
    <div className="account-opinions-container">
      <h2>Dejá tu opinión sobre tus productos</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Producto:</label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            required
            style={{
              width: "100%",
              borderRadius: 8,
              padding: 8,
              border: "2px solid #d94f7a",
              background: "#fff0f6",
              color: "#d94f7a",
              fontWeight: 600,
              fontSize: "1rem",
              outline: "none",
              marginBottom: 8,
              boxShadow: "0 2px 8px rgba(217,79,122,0.07)"
            }}
          >
            <option value="">Seleccioná un producto</option>
            {products.map(prod => (
              <option key={prod._id} value={prod._id}>{prod.name}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Calificación:</label>
          <div style={{ fontSize: 32, cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n} onClick={() => handleStarClick(n)} style={{ color: n <= stars ? "#FFD700" : "#ccc" }}>
                ★
              </span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Opinión:</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            style={{ width: "100%", borderRadius: 8, padding: 8 }}
            required
          />
        </div>
        <button type="submit" disabled={loading || stars === 0 || !text.trim() || !selectedProduct} style={{ padding: "10px 24px", borderRadius: 8, background: "#d94f7a", color: "white", fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Enviando..." : "Enviar opinión"}
        </button>
        {success && <div style={{ color: "green", marginTop: 12 }}>¡Opinión enviada!</div>}
      </form>
    </div>
  );
}
