
import { useEffect, useState } from "react";
import ProductCardBestSellersMobile from "../../components/mobile/ProductCardBestSellersMobile";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useDiscountRules } from "../../hooks/useDiscountRules";
import OpinionsPopup from "../OpinionsPopup";
import "../../styles/mobile/bestsellers.mobile.css";

// Configuración global de API para compatibilidad local/producción
const API_URL = import.meta.env.VITE_API_URL;
function apiPath(path) {
  return `${API_URL}${path}`;
}

export default function BestSellersMobile() {
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);
  const [opinionsProductId, setOpinionsProductId] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const discountRules = useDiscountRules();

  useEffect(() => {
    fetch(apiPath('/products/bestsellers'))
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  const handleAddToCart = (product, size, quantity) => {
    addToCart(product, { size, color: product.color, quantity });
  };
  const handleBuy = (product, size, quantity) => {
    const API_URL = import.meta.env.VITE_API_URL;
    navigate("/checkout");
  };
  const handleViewMore = (product) => {
    navigate(`/products/${product._id}`);
  };
  const handleStarsClick = (product) => {
    setOpinionsProductId(product._id);
    setShowOpinions(true);
  };

  return (
    <>
      <div className="swipe-hint-mobile">
        <span className="swipe-hand">👆</span> Deslizá para ver más
      </div>
      <div className="newin-mobile-swiper bestsellers-mobile-scroll">
        <div className="bestsellers-mobile-track">
          {productos.map((product) => (
            <div className="bestsellers-mobile-slide" key={product._id}>
              <ProductCardBestSellersMobile
                product={product}
                discountRules={discountRules}
                onBuy={handleBuy}
                onAddToCart={handleAddToCart}
                onViewMore={handleViewMore}
                onStarsClick={handleStarsClick}
              />
            </div>
          ))}
        </div>
      </div>
      {showOpinions && opinionsProductId && (
        <OpinionsPopup
          productId={opinionsProductId}
          onClose={() => {
            setShowOpinions(false);
            setOpinionsProductId(null);
          }}
        />
      )}
    </>
  );
}
