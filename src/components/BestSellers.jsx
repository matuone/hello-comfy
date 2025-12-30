import "../styles/bestsellers.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OpinionsPopup from "./OpinionsPopup";

const ITEMS_PER_PAGE = 5;

export default function BestSellers() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [showOpinions, setShowOpinions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/bestsellers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductos(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (productos.length <= ITEMS_PER_PAGE) return;

    const interval = setInterval(() => {
      setStartIndex((prev) =>
        prev + ITEMS_PER_PAGE >= productos.length ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [productos.length]);

  const visibleProducts = productos.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <section className="bestsellers">
      <div className="bestsellers__container">
        <h2 className="bestsellers__title">Los más vendidos:</h2>

        <div className="bestsellers__carousel">
          <button
            className="carousel__arrow left"
            onClick={() =>
              setStartIndex((prev) =>
                prev === 0
                  ? Math.max(productos.length - ITEMS_PER_PAGE, 0)
                  : prev - 1
              )
            }
          >
            ‹
          </button>

          <div className="bestsellers__track">
            {visibleProducts.map((p) => (
              <div key={p._id} className="bestsellers__item">
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
                  className="stars"
                  onClick={() => setShowOpinions(true)}
                >
                  {"★".repeat(4)}☆
                </div>

                <div className="bestsellers__buttons">
                  <button className="btn-buy">Comprar</button>
                  <button className="btn-cart">Agregar al carrito</button>
                  <button
                    className="btn-buy"
                    onClick={() => navigate(`/products/${p._id}`)}
                  >
                    Ver más
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="carousel__arrow right"
            onClick={() =>
              setStartIndex((prev) =>
                prev + ITEMS_PER_PAGE >= productos.length ? 0 : prev + 1
              )
            }
          >
            ›
          </button>
        </div>
      </div>

      {showOpinions && (
        <OpinionsPopup onClose={() => setShowOpinions(false)} />
      )}
    </section>
  );
}
