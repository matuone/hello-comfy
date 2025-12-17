// src/components/NewIn.jsx
import "../styles/newin.css";
import { useState, useEffect } from "react";

import remera1 from "../assets/remera1.png";
import remera2 from "../assets/remera2.png";
import remera3 from "../assets/remera3.png";
import remera4 from "../assets/remera4.png";

const NEW_PRODUCTS = [
  {
    id: "new-1",
    img: remera1,
    name: "Remera Oversize",
    desc: "Nueva colección con estilo urbano y cómodo.",
    rating: 5.0,
  },
  {
    id: "new-2",
    img: remera2,
    name: "Remera Minimal",
    desc: "Diseño limpio y moderno para cualquier ocasión.",
    rating: 4.3,
  },
  {
    id: "new-3",
    img: remera3,
    name: "Remera Vintage",
    desc: "Inspirada en los clásicos, con un toque retro.",
    rating: 4.7,
  },
  {
    id: "new-4",
    img: remera4,
    name: "Remera Edición Limitada",
    desc: "Exclusiva y única, disponible por tiempo limitado.",
    rating: 4.9,
  },
];

export default function NewIn() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const prev = () => {
    setStartIndex((prev) =>
      prev === 0 ? NEW_PRODUCTS.length - visibleCount : prev - 1
    );
  };

  const next = () => {
    setStartIndex((prev) =>
      prev + visibleCount >= NEW_PRODUCTS.length ? 0 : prev + 1
    );
  };

  // Autoplay cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const visibleProducts = NEW_PRODUCTS.slice(
    startIndex,
    startIndex + visibleCount
  );

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="stars">
        {"★".repeat(fullStars)}
        {halfStar && "½"}
        {"☆".repeat(emptyStars)}
      </div>
    );
  };

  return (
    <section className="newin">
      <div className="newin__container">
        <h2 className="newin__title">New In ✨</h2>

        <div className="newin__carousel">
          <button className="carousel__arrow left" onClick={prev}>
            ‹
          </button>

          <div className="newin__grid">
            {visibleProducts.map((p) => (
              <div key={p.id} className="newin__item">
                <img src={p.img} alt={p.name} className="newin__image" />
                <h3 className="newin__name">{p.name}</h3>
                <p className="newin__desc">{p.desc}</p>
                {renderStars(p.rating)}
              </div>
            ))}
          </div>

          <button className="carousel__arrow right" onClick={next}>
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
