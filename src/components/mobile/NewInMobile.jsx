import { useEffect, useState } from "react";
import ProductCardNewInMobile from "../../components/mobile/ProductCardNewInMobile";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../styles/mobile/bestsellers.mobile.css";

export default function NewInMobile() {
  const [productos, setProductos] = useState([]);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  useEffect(() => {
    // Configuración global de API para compatibilidad local/producción
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    function apiPath(path) {
      return API_URL.endsWith("/api") ? `${API_URL}${path}` : `${API_URL}/api${path}`;
    }
    fetch(apiPath('/products/new'))
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
            />
          </div>
        ))}
      </div>
    </div>
  );
}
