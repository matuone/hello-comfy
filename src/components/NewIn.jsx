import "../styles/newin.css";
import { useState, useEffect } from "react";

export default function NewIn() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/new")
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

  if (loading) {
    return (
      <section className="newin">
        <h2 className="newin__title">Nuevos ingresos:</h2>
        <div className="loader"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="newin">
        <h2 className="newin__title">Nuevos ingresos:</h2>
        <p style={{ textAlign: "center", color: "red" }}>
          No se pudieron cargar los productos.
        </p>
      </section>
    );
  }

  return (
    <section className="newin fade-in">
      <div className="newin__container">
        <h2 className="newin__title">Nuevos ingresos:</h2>

        <div className="newin__grid">
          {productos.map((p) => (
            <div key={p._id} className="newin__item fade-in">
              <img
                src={p.images?.[0] || "https://via.placeholder.com/200"}
                alt={p.name}
                className="newin__image"
              />

              <h3 className="newin__name">{p.name}</h3>

              <p className="newin__price">
                ${p.price?.toLocaleString("es-AR")}
              </p>

              <p className="newin__desc">
                {p.description?.slice(0, 60) || "Nuevo producto disponible"}
              </p>

              <div className="newin__buttons">
                <button className="btn-buy">Comprar</button>
                <button className="btn-cart">Agregar al carrito</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
