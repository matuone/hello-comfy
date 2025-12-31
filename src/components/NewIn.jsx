import "../styles/newin.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "./OpinionsPopup";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function NewIn() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/new")
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  return (
    <section className="newin">
      <div className="newin__container">
        <h2 className="newin__title">Nuevos ingresos:</h2>

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
              <div className="newin__item">
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/300"}
                  alt={p.name}
                  className="newin__image"
                  onClick={() => navigate(`/products/${p._id}`)}
                />

                <h3
                  className="newin__name"
                  onClick={() => navigate(`/products/${p._id}`)}
                >
                  {p.name}
                </h3>

                <p className="newin__price">
                  ${p.price?.toLocaleString("es-AR")}
                </p>

                <p className="newin__desc">
                  {p.description?.slice(0, 80) || "Nuevo producto disponible"}
                </p>

                <div
                  className="newin__stars"
                  onClick={() => setShowOpinions(true)}
                >
                  {"★".repeat(4)}☆
                </div>

                <div className="newin__buttons">
                  <button className="newin__btn-buy">Comprar</button>
                  <button className="newin__btn-cart">Agregar al carrito</button>
                </div>

                <button
                  className="newin__btn-viewmore"
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
