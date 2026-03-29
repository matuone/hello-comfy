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

const HOME_CAROUSEL_LIMIT = 12;

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const isComfyGeekLabel = (value) => {
  const normalized = normalizeText(value);
  return normalized === "comfy geek" || normalized === "comfy geek!";
};

const hasComfyGeekTag = (values) => {
  if (!Array.isArray(values)) return false;
  return values.some(isComfyGeekLabel);
};

const isGeekProduct = (product) =>
  hasComfyGeekTag(product?.category) || hasComfyGeekTag(product?.subcategory);

const buildGeekList = (products) => {
  const geekOnly = products.filter(isGeekProduct);
  return geekOnly.slice(0, HOME_CAROUSEL_LIMIT);
};

export default function NewInMobile({ mode = "new" }) {
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);
  const [opinionsProductId, setOpinionsProductId] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const discountRules = useDiscountRules();
  useEffect(() => {
    const endpoint = mode === "geek" ? `/products?t=${Date.now()}` : `/products/new?limit=12&t=${Date.now()}`;

    fetch(apiPath(endpoint))
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => {
          const aKey = a?.createdAt || a?._id || "";
          const bKey = b?.createdAt || b?._id || "";
          return aKey < bKey ? 1 : aKey > bKey ? -1 : 0;
        });
        setProductos(mode === "geek" ? buildGeekList(list) : list);
      })
      .catch(() => setProductos([]));
  }, [mode]);

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
      <div className="swipe-hint-mobile">
        <span className="swipe-hand">👆</span> Deslizá para ver más
      </div>
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
