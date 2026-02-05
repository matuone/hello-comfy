
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useState as useReactState } from "react";
import "../../styles/account/accountopinions.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

export default function AccountOpinions() {
  const { user, token } = useAuth();
  const [stars, setStars] = useReactState(0);
  const [text, setText] = useReactState("");
  const [success, setSuccess] = useReactState(false);
  const [loading, setLoading] = useReactState(false);
  const [products, setProducts] = useReactState([]);
  const [selectedProduct, setSelectedProduct] = useReactState("");
  const [starError, setStarError] = useReactState("");
  const [myOpinions, setMyOpinions] = useReactState([]);
  const [error, setError] = useReactState("");

  useEffect(() => {
    async function fetchPurchasesAndOpinions() {
      if (!user || !token) return;
      const res = await fetch(apiPath("/orders/my-orders"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Extraer productos comprados y eliminar duplicados
      const allProds = (data.orders || []).flatMap(order =>
        order.items.map(item => ({
          _id: item.productId || item._id,
          name: item.name || item.productName || "Producto"
        }))
      );
      // Eliminar duplicados por _id
      const uniqueProds = [];
      const seen = new Set();
      for (const prod of allProds) {
        if (!seen.has(prod._id)) {
          uniqueProds.push(prod);
          seen.add(prod._id);
        }
      }
      setProducts(uniqueProds);

      // Traer opiniones propias
      const resOp = await fetch(apiPath("/opinions/user/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataOp = await resOp.json();
      setMyOpinions(dataOp.opinions || []);
    }
    fetchPurchasesAndOpinions();
  }, [user, token, success]);

  function handleStarClick(n) {
    setStars(n);
    setStarError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStarError("");
    setError("");
    if (!selectedProduct) {
      setError("Por favor selecciona un producto");
      return;
    }
    if (stars === 0) {
      setStarError("Por favor selecciona una cantidad de estrellas");
      return;
    }
    if (!text.trim()) {
      setError("Por favor escribe una opinión");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiPath("/opinions"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product: selectedProduct, stars, text }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setText("");
        setStars(0);
        setSelectedProduct("");
        setTimeout(() => setSuccess(false), 3000);
        window.dispatchEvent(new CustomEvent("reloadProductOpinions", { detail: { productId: selectedProduct } }));
      } else {
        setError(data.error || "No se pudo enviar la opinión");
      }
    } catch {
      setError("Error de red al enviar la opinión");
    }
    setLoading(false);
  }

  return (
    <div className="account-opinions-container">
      <h2>Dejá tu opinión sobre tus productos</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        {error && <div style={{ color: '#d94f7a', fontWeight: 600, marginBottom: 8 }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Producto:</label>
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
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
          {!selectedProduct && error && (
            <div style={{ color: "#d94f7a", fontWeight: 600, marginTop: 4 }}>Por favor selecciona un producto</div>
          )}
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
          {starError && (
            <div style={{ color: "#d94f7a", fontWeight: 600, marginTop: 4 }}>{starError}</div>
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Opinión:</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            style={{ width: "100%", borderRadius: 8, padding: 8 }}
          />
          {!text.trim() && error && (
            <div style={{ color: "#d94f7a", fontWeight: 600, marginTop: 4 }}>Por favor escribe una opinión</div>
          )}
        </div>
        <button type="submit" disabled={loading} style={{ padding: "10px 24px", borderRadius: 8, background: "#d94f7a", color: "white", fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Enviando..." : "Enviar opinión"}
        </button>
        {success && (
          <div style={{
            color: "#fff",
            background: "#4CAF50",
            padding: "10px 0",
            borderRadius: 8,
            marginTop: 12,
            fontWeight: 600,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(76,175,80,0.12)"
          }}>
            ¡Opinión enviada correctamente!
          </div>
        )}
      </form>

      {/* Opiniones propias */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Tus opiniones</h3>
        {myOpinions.length === 0 && <div style={{ color: '#888' }}>Aún no dejaste opiniones.</div>}
        {myOpinions.map(op => (
          <div key={op._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{products.find(p => p._id === op.product)?.name || 'Producto'}</div>
            <div style={{ fontSize: 18, color: '#FFD700', marginBottom: 4 }}>{'★'.repeat(op.stars)}<span style={{ color: '#ccc' }}>{'★'.repeat(5 - op.stars)}</span></div>
            <div style={{ fontSize: 15 }}>{op.text}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{new Date(op.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
