import "../styles/newin.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "./OpinionsPopup";

export default function NewIn() {
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
    fetch("http://localhost:5000/api/products/new")
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
    <section className="newin">
      <div className="newin__container">
        <h2 className="newin__title">Nuevos ingresos:</h2>

        <div className="newin__carousel">
          <button className="newin__arrow left" onClick={scrollLeft}>‹</button>

          <div className="newin__track-viewport">
            <div className="newin__track" ref={trackRef}>
              {productos.map((p) => (
                <div key={p._id} className="newin__item">
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/300"}
                    alt={p.name}
                    className="newin__image"
                    onClick={() => navigate(`/products/${p._id}`)}
                  />

                  <h3 className="newin__name" onClick={() => navigate(`/products/${p._id}`)}>
                    {p.name}
                  </h3>

                  <p className="newin__price">
                    ${p.price?.toLocaleString("es-AR")}
                  </p>

                  <p className="newin__desc">
                    {p.description?.slice(0, 80) || "Nuevo producto disponible"}
                  </p>

                  <div className="newin__stars" onClick={() => setShowOpinions(true)}>
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
              ))}
            </div>
          </div>

          <button className="newin__arrow right" onClick={scrollRight}>›</button>
        </div>
      </div>

      {showOpinions && <OpinionsPopup onClose={() => setShowOpinions(false)} />}
    </section>
  );
}
