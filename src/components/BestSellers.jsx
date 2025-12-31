import "../styles/bestsellers.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "./OpinionsPopup";

export default function BestSellers() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [showOpinions, setShowOpinions] = useState(false);
  const [index, setIndex] = useState(0);

  const trackRef = useRef(null);

  const ITEM_WIDTH = 260 + 20; // tarjeta + gap
  const VISIBLE = 5;           // se ven 5 tarjetas
  const ITEMS_PER_PAGE = 1;    // avanzar de a 1
  const PAGE_WIDTH = ITEM_WIDTH * ITEMS_PER_PAGE;

  useEffect(() => {
    fetch("http://localhost:5000/api/products/bestsellers")
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, []);

  // FIX: evitar que quede 1 tarjeta sola al final
  const maxIndex = Math.max(0, productos.length - VISIBLE);

  const scrollLeft = () => setIndex((prev) => Math.max(prev - 1, 0));
  const scrollRight = () => setIndex((prev) => Math.min(prev + 1, maxIndex));

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${index * PAGE_WIDTH}px)`;
    }
  }, [index]);

  return (
    <section className="bestsellers">
      <div className="bestsellers__container">
        <h2 className="bestsellers__title">Los más vendidos:</h2>

        <div className="bestsellers__carousel">
          <button className="bestsellers__arrow left" onClick={scrollLeft}>‹</button>

          <div className="bestsellers__track-viewport">
            <div className="bestsellers__track" ref={trackRef}>
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
