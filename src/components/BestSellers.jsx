import "../styles/bestsellers.css";
import { useState, useEffect } from "react";
import OpinionsPopup from "./OpinionsPopup";

import remera1 from "../assets/productos/remera1.png";
import remera2 from "../assets/productos/remera2.png";
import remera3 from "../assets/productos/remera3.png";
import remera4 from "../assets/productos/remera4.png";

const PRODUCTS = [
  { id: "rem-1", img: remera1, name: "Remera Estampada", desc: "Lorem ipsum...", rating: 4.5 },
  { id: "rem-2", img: remera2, name: "Remera Bordada", desc: "Lorem ipsum...", rating: 4.0 },
  { id: "rem-3", img: remera3, name: "Crop Top", desc: "Lorem ipsum...", rating: 5.0 },
  { id: "rem-4", img: remera4, name: "Remera Personalizada", desc: "Lorem ipsum...", rating: 4.2 },
];

export default function BestSellers() {
  const [startIndex, setStartIndex] = useState(0);
  const [showOpinions, setShowOpinions] = useState(false);

  function prev() {
    if (startIndex === 0) {
      setStartIndex(PRODUCTS.length - 4);
    } else {
      setStartIndex(startIndex - 1);
    }
  }

  function next() {
    if (startIndex + 4 >= PRODUCTS.length) {
      setStartIndex(0);
    } else {
      setStartIndex(startIndex + 1);
    }
  }

  useEffect(function () {
    const interval = setInterval(function () {
      next();
    }, 4000);
    return function () {
      clearInterval(interval);
    };
  }, [startIndex]);

  function renderStars(rating) {
    var fullStars = Math.floor(rating);
    var halfStar = rating % 1 >= 0.5;
    var emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="stars" onClick={function () { setShowOpinions(true); }}>
        {"★".repeat(fullStars)}
        {halfStar ? "½" : ""}
        {"☆".repeat(emptyStars)}
      </div>
    );
  }

  var visibleProducts = PRODUCTS.slice(startIndex, startIndex + 4);

  return (
    <section className="bestsellers">
      <div className="bestsellers__container">
        <h2 className="bestsellers__title">Los más vendidos:</h2>

        <div className="bestsellers__carousel">
          <button className="carousel__arrow left" onClick={prev}>‹</button>

          <div className="bestsellers__grid">
            {visibleProducts.map(function (p) {
              return (
                <div key={p.id} className="bestsellers__item">
                  <img src={p.img} alt={p.name} className="bestsellers__image" />
                  <h3 className="bestsellers__name">{p.name}</h3>
                  <p className="bestsellers__desc">{p.desc}</p>
                  {renderStars(p.rating)}
                </div>
              );
            })}
          </div>

          <button className="carousel__arrow right" onClick={next}>›</button>
        </div>
      </div>

      {showOpinions && <OpinionsPopup onClose={function () { setShowOpinions(false); }} />}
    </section>
  );
}
