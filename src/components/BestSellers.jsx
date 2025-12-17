// src/components/BestSellers.jsx
import "../styles/bestsellers.css";
import { useState, useEffect } from "react";

import remera1 from "../assets/remera1.png";
import remera2 from "../assets/remera2.png";
import remera3 from "../assets/remera3.png";
import remera4 from "../assets/remera4.png";

const PRODUCTS = [
  {
    id: "rem-1",
    img: remera1,
    name: "Remera Estampada",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    rating: 4.5,
  },
  {
    id: "rem-2",
    img: remera2,
    name: "Remera Bordada",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    rating: 4.0,
  },
  {
    id: "rem-3",
    img: remera3,
    name: "Crop Top",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    rating: 5.0,
  },
  {
    id: "rem-4",
    img: remera4,
    name: "Remera Personalizada",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    rating: 4.2,
  },
];

export default function BestSellers() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const prev = () => {
    setStartIndex((prev) =>
      prev === 0 ? PRODUCTS.length - visibleCount : prev - 1
    );
  };

  const next = () => {
    setStartIndex((prev) =>
      prev + visibleCount >= PRODUCTS.length ? 0 : prev + 1
    );
  };

  // Autoplay cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      next();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const visibleProducts = PRODUCTS.slice(
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
    <section className="bestsellers">
      <div className="bestsellers__container">
        <h2 className="bestsellers__title">Los más vendidos:</h2>

        <div className="bestsellers__carousel">
          <button className="carousel__arrow left" onClick={prev}>
            ‹
          </button>

          <div className="bestsellers__grid">
            {visibleProducts.map((p) => (
              <div key={p.id} className="bestsellers__item">
                <img
                  src={p.img}
                  alt={p.name}
                  className="bestsellers__image"
                />
                <h3 className="bestsellers__name">{p.name}</h3>
                <p className="bestsellers__desc">{p.desc}</p>
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
