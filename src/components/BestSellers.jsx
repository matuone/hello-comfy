import "../styles/bestsellers.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "./OpinionsPopup";

export default function BestSellers() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/bestsellers")
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  const scrollLeft = () => {
    wrapperRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };

  const scrollRight = () => {
    wrapperRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  return (
    <section className="bestsellers">
      <div className="bestsellers__container">
        <h2 className="bestsellers__title">Los más vendidos:</h2>

        <div className="bestsellers__carousel">
          <button className="bestsellers__arrow left" onClick={scrollLeft}>‹</button>

          <div className="bestsellers__track-viewport">
            <div className="bestsellers__track" ref={wrapperRef}>
              {productos.map((p) => (
                <div key={p._id} className="bestsellers__item">
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/300"}
                    alt={p.name}
                    className="bestsellers__image"
                    onClick={() => navigate(`/products/${p._id}`)}
                  />

                  <h3 className="bestsellers__name" onClick={() => navigate(`/products/${p._id}`)}>
                    {p.name}
                  </h3>

                  <p className="bestsellers__price">
                    ${p.price?.toLocaleString("es-AR")}
                  </p>

                  <p className="bestsellers__desc">
                    {p.description?.slice(0, 80) || "Producto destacado"}
                  </p>

                  <div className="bestsellers__stars" onClick={() => setShowOpinions(true)}>
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
              ))}
            </div>
          </div>

          <button className="bestsellers__arrow right" onClick={scrollRight}>›</button>
        </div>
      </div>

      {showOpinions && <OpinionsPopup onClose={() => setShowOpinions(false)} />}
    </section>
  );
}
