import { useEffect, useState } from "react";
import ProductCardNewInMobile from "../../components/mobile/ProductCardNewInMobile";
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

export default function NewInMobile() {
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);
  const [opinionsProductId, setOpinionsProductId] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const discountRules = useDiscountRules();
  useEffect(() => {
    fetch(apiPath(`/products/new?limit=12&t=${Date.now()}`))
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => {
          const aKey = a?.createdAt || a?._id || "";
          const bKey = b?.createdAt || b?._id || "";
          return aKey < bKey ? 1 : aKey > bKey ? -1 : 0;
        });
        setProductos(list);
      })
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
  const handleStarsClick = (product) => {
    setOpinionsProductId(product._id);
    setShowOpinions(true);
  };

  return (
    <>
      <div className="newin-mobile-swiper bestsellers-mobile-scroll">
        <div className="bestsellers-mobile-track">
          {productos.map((product) => (
            <div className="bestsellers-mobile-slide" key={product._id}>
              <ProductCardNewInMobile
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
