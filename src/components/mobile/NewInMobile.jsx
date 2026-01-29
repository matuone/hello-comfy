
import { useEffect, useState, useCallback } from "react";
import OpinionsPopup from "../../components/OpinionsPopup";
import ProductCardNewInMobile from "../../components/mobile/ProductCardNewInMobile";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../styles/mobile/bestsellers.mobile.css";

export default function NewInMobile() {
  const [productos, setProductos] = useState([]);
  const [opinionsProductId, setOpinionsProductId] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  useEffect(() => {
    fetch("http://localhost:5000/api/products/new")
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  const handleAddToCart = (product, size, quantity) => {
    addToCart(product, { size, color: product.stockColorId?.color, quantity });
  };
  const handleBuy = (product, size, quantity) => {
    handleAddToCart(product, size, quantity);
    navigate("/checkout");
  };
  const handleViewMore = (product) => {
    navigate(`/products/${product._id}`);
  };
  const handleShowOpinions = useCallback((productId) => {
    setOpinionsProductId(productId);
  }, []);

  return (
    <div className="newin-mobile-swiper bestsellers-mobile-scroll">
      <div className="bestsellers-mobile-track">
        {productos.map((product) => (
          <div className="bestsellers-mobile-slide" key={product._id}>
            <ProductCardNewInMobile
              product={product}
              onBuy={handleBuy}
              onAddToCart={handleAddToCart}
              onViewMore={handleViewMore}
              onShowOpinions={handleShowOpinions}
            />
          </div>
        ))}
      </div>
      {opinionsProductId && (
        <OpinionsPopup productId={opinionsProductId} onClose={() => setOpinionsProductId(null)} />
      )}
    </div>
  );
}
