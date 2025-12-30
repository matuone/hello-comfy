import "../styles/bestsellers.css";
import { useState, useEffect } from "react";
import OpinionsPopup from "./OpinionsPopup";

export default function BestSellers() {
  const [productos, setProductos] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [showOpinions, setShowOpinions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ============================
  // CARGAR BEST SELLERS DESDE BACKEND
  // ============================
  useEffect(() => {
    fetch("http://localhost:5000/api/products/bestsellers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // ============================
  // CARRUSEL AUTOMÁTICO (CORREGIDO)
  // ============================
  useEffect(() => {
    if (productos.length === 0) return;

    const interval = setInterval(() => {
      setStartIndex((prev) =>
        prev + 4 >= productos.length ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [productos.length]);

  // ============================
  // ESTADOS
  // ============================
  if (loading) {
    return (
      <section className="bestsellers">
        <h2 className="bestsellers__title">Los más vendidos:</h2>
        <div className="loader"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bestsellers">
        <h2 className="bestsellers__title">Los más vendidos:</h2>
        <p style={{ textAlign: "center", color: "red" }}>
          No se pudieron cargar los productos.
        </p>
      </section>
    );
  }

  // ============================
  // PRODUCTOS VISIBLES
  // ============================
  const visibleProducts = productos.slice(startIndex, startIndex + 4);

  return (
    <section className="bestsellers fade-in">
      <div className="bestsellers__container">
        <h2 className="bestsellers__title">Los más vendidos:</h2>

        <div className="bestsellers__carousel">
          <button className="carousel__arrow left" onClick={() =>
            setStartIndex((prev) =>
              prev === 0 ? Math.max(productos.length - 4, 0) : prev - 1
            )
          }>
            ‹
          </button>

          <div className="bestsellers__grid">
            {visibleProducts.map((p) => (
              <div key={p._id} className="bestsellers__item fade-in">
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/200"}
                  alt={p.name}
                  className="bestsellers__image"
                />

                <h3 className="bestsellers__name">{p.name}</h3>

                <p className="bestsellers__price">
                  ${p.price?.toLocaleString("es-AR")}
                </p>

                <p className="bestsellers__desc">
                  {p.description?.slice(0, 60) || "Producto destacado"}
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
                </div>
              </div>
            ))}
          </div>

          <button className="carousel__arrow right" onClick={() =>
            setStartIndex((prev) =>
              prev + 4 >= productos.length ? 0 : prev + 1
            )
          }>
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
