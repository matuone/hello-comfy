
import { useEffect, useState } from "react";
import ProductCardBestSellersMobile from "../../components/mobile/ProductCardBestSellersMobile";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import OpinionsPopup from "../OpinionsPopup";
import "../../styles/mobile/bestsellers.mobile.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function BestSellersMobile() {
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);
  const [opinionsProductId, setOpinionsProductId] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    // Configuración global de API para compatibilidad local/producción
    const API_URL = import.meta.env.VITE_API_URL;
    function apiPath(path) {
      return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
    }
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
      <div className="bestsellers-mobile-swiper">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          slidesPerView={2}
          spaceBetween={12}
          speed={400}
        >
          {productos.map((product) => (
            <SwiperSlide key={product._id}>
              <div className="bestsellers-mobile-slide">
                <ProductCardBestSellersMobile
                  product={product}
                  onBuy={handleBuy}
                  onAddToCart={handleAddToCart}
                  onViewMore={handleViewMore}
                  onStarsClick={handleStarsClick}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
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
