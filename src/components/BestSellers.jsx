// src/components/BestSellers.jsx
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

  useEffect(function () {
    fetch("http://localhost:5000/api/products/bestsellers")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          setError(true);
        }
      })
      .catch(function () {
        setError(true);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  useEffect(
    function () {
      if (!productos || productos.length <= ITEMS_PER_PAGE) return;

      const interval = setInterval(function () {
        setStartIndex(function (prev) {
          return (prev + 1) % productos.length;
        });
      }, 4000);

      return function () {
        clearInterval(interval);
      };
    },
    [productos.length]
  );

  function goPrev() {
    if (!productos || productos.length === 0) return;

    setStartIndex(function (prev) {
      const next = prev - 1;
      return next < 0 ? productos.length - 1 : next;
    });
  }

  function goNext() {
    if (!productos || productos.length === 0) return;

    setStartIndex(function (prev) {
      return (prev + 1) % productos.length;
    });
  }

  const visibleProducts = [];
  if (productos && productos.length > 0) {
    for (let i = 0; i < ITEMS_PER_PAGE; i++) {
      visibleProducts.push(productos[(startIndex + i) % productos.length]);
    }
  }

  return (
    <section className="bestsellers">
      <div className="bestsellers__container">
        <h2 className="bestsellers__title">Los más vendidos:</h2>

        <div className="bestsellers__carousel">
          <button
            className="carousel__arrow left"
            onClick={goPrev}
            aria-label="Anterior"
          >
            ‹
          </button>

          <div className="bestsellers__viewport">
            <div className="bestsellers__track">
              {visibleProducts.map(function (p) {
                return (
                  <div key={p._id} className="bestsellers__item">
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/300"}
                      alt={p.name}
                      className="bestsellers__image"
                      onClick={function () {
                        navigate(`/products/${p._id}`);
                      }}
                    />

                    <h3
                      className="bestsellers__name"
                      onClick={function () {
                        navigate(`/products/${p._id}`);
                      }}
                    >
                      {p.name}
                    </h3>

                    <p className="bestsellers__price">
                      ${p.price?.toLocaleString("es-AR")}
                    </p>

                    <p className="bestsellers__desc">
                      {p.description?.slice(0, 80) || "Producto destacado"}
                    </p>

                    <button
                      type="button"
                      className="stars"
                      onClick={function () {
                        setShowOpinions(true);
                      }}
                      aria-label="Ver opiniones"
                    >
                      ★★★★☆
                    </button>

                    <div className="bestsellers__buttons">
                      <button className="btn-buy">Comprar</button>
                      <button className="btn-cart">Agregar al carrito</button>
                      <button
                        className="btn-link"
                        onClick={function () {
                          navigate(`/products/${p._id}`);
                        }}
                      >
                        Ver más
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="carousel__arrow right"
            onClick={goNext}
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>

        {loading && <p className="bestsellers__status">Cargando...</p>}
        {error && (
          <p className="bestsellers__status">Error al cargar productos.</p>
        )}
      </div>

      {showOpinions && (
        <OpinionsPopup
          onClose={function () {
            setShowOpinions(false);
          }}
        />
      )}
    </section>
  );
}
