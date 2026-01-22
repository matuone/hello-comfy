import { useEffect, useState } from "react";
import ProductCardMobile from "../../components/mobile/ProductCardMobile";
import "../../styles/mobile/bestsellers.mobile.css";

export default function BestSellersMobile() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/bestsellers")
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);


  return (
    <div className="bestsellers-mobile-swiper bestsellers-mobile-scroll">
      <div className="bestsellers-mobile-track">
        {productos.map((product) => (
          <div className="bestsellers-mobile-slide" key={product._id}>
            <ProductCardMobile product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
