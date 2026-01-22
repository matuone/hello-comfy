import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
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
    <div className="bestsellers-mobile-swiper">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        slidesPerView={2}
        spaceBetween={14}
        speed={400}
      >
        {productos.map((product) => (
          <SwiperSlide key={product._id}>
            <ProductCardMobile product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
