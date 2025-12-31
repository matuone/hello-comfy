import "../styles/bestsellers.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "./OpinionsPopup";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function BestSellers() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/bestsellers")
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  return (
    <section className="bestsellers">
      <div className="bestsellers__container">
        <h2 className="bestsellers__title">Los más vendidos:</h2>

        {/* HINT VISUAL */}
        <div className="carousel-hint">Arrastrá para ver más →</div>

        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          slidesPerView={5}
          spaceBetween={20}
          speed={400}
        >
          {productos.map((p) => (
            <SwiperSlide key={p._id}>
              <div className="bestsellers__item">
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/300"}
                  alt={p.name}
                  className="bestsellers__image"
                  onClick={() => navigate(`/products/${p._id}`)}
                />

                <h3
                  className="bestsellers__name"
                  onClick={() => navigate(`/products/${p._id}`)}
                >
                  {p.name}
                </h3>

                <p className="bestsellers__price">
                  ${p.price?.toLocaleString("es-AR")}
                </p>

                <p className="bestsellers__desc">
                  {p.description?.slice(0, 80) || "Producto destacado"}
                </p>

                <div
                  className="bestsellers__stars"
                  onClick={() => setShowOpinions(true)}
                >
                  {"★".repeat(5)}
                </div>

                <div className="bestsellers__buttons">
                  <button className="bestsellers__btn-buy">Comprar</button>
                  <button className="bestsellers__btn-cart">Agregar al carrito</button>
                </div>

                <button
                  className="bestsellers__btn-viewmore"
                  onClick={() => navigate(`/products/${p._id}`)}
                >
                  Ver más
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {showOpinions && <OpinionsPopup onClose={() => setShowOpinions(false)} />}
    </section>
  );
}
