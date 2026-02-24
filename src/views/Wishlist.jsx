import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { calcularPrecios } from "../hooks/useDiscountRules";
import toast from "react-hot-toast";
import "../styles/wishlist.css";

const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

export default function Wishlist() {
  const { wishlistIds, fetchWishlistProducts, toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discountRules, setDiscountRules] = useState([]);

  // Cargar reglas de descuento
  useEffect(() => {
    fetch(apiPath("/discounts"))
      .then((r) => r.json())
      .then((data) => setDiscountRules(Array.isArray(data) ? data : []))
      .catch(() => setDiscountRules([]));
  }, []);

  // Cargar productos frescos del server
  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchWishlistProducts()
      .then((prods) => setProducts(prods))
      .finally(() => setLoading(false));
  }, [wishlistIds, fetchWishlistProducts]);

  if (loading) {
    return (
      <div className="wishlist-container">
        <h1>Mis favoritos</h1>
        <p className="wishlist-loading">Cargando favoritos...</p>
      </div>
    );
  }

  if (wishlistIds.length === 0) {
    return (
      <div className="wishlist-container">
        <h1>Mis favoritos</h1>
        <p className="empty-wishlist">Todavía no agregaste favoritos.</p>
        <button className="wishlist-browse-btn" onClick={() => navigate("/products")}>
          Explorar productos
        </button>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h1>Mis favoritos</h1>
      <p className="wishlist-count">{wishlistIds.length} {wishlistIds.length === 1 ? "producto" : "productos"}</p>

      <div className="wishlist-grid">
        {products.map((p) => {
          const { precioOriginal, descuento, precioFinal, precioTransferencia } = calcularPrecios(p, discountRules);

          return (
            <div key={p._id} className="wishlist-card">
              <button
                className="wishlist-card__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(p._id);
                  toast("Quitado de favoritos", { icon: "💔" });
                }}
                aria-label="Quitar de favoritos"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#d94f7a" stroke="#d94f7a" strokeWidth="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
              <div className="wishlist-card__img" onClick={() => navigate(`/products/${p._id}`)}>
                <img src={p.images?.[0] || "https://via.placeholder.com/300x300?text=Sin+imagen"} alt={p.name} />
              </div>
              <div className="wishlist-card__info" onClick={() => navigate(`/products/${p._id}`)}>
                <h3>{p.name}</h3>
                <div className="wishlist-card__pricing">
                  {descuento > 0 ? (
                    <>
                      <span className="wishlist-card__price-original">${precioOriginal?.toLocaleString("es-AR")}</span>
                      <span className="wishlist-card__price-final">${precioFinal?.toLocaleString("es-AR")}</span>
                      <span className="wishlist-card__discount">{descuento}% OFF</span>
                    </>
                  ) : (
                    <span className="wishlist-card__price">${precioOriginal?.toLocaleString("es-AR")}</span>
                  )}
                </div>
                {precioTransferencia && (
                  <p className="wishlist-card__transfer">
                    Transferencia: ${precioTransferencia?.toLocaleString("es-AR")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
