import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  if (wishlist.length === 0)
    return <p className="empty-wishlist">Todavía no agregaste favoritos.</p>;

  return (
    <div className="wishlist-container">
      <h1>Mis favoritos</h1>

      <div className="wishlist-grid">
        {wishlist.map((p) => (
          <div
            key={p._id}
            className="wishlist-card"
            onClick={() => navigate(`/products/${p._id}`)}
          >
            <img src={p.images?.[0]} alt={p.name} />
            <h3>{p.name}</h3>
            <p>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
